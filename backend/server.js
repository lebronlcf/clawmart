// ClawMart Backend - Express + PostgreSQL
const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const { ethers } = require('ethers');

const app = express();
app.use(cors());
app.use(express.json());

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// 平台钱包（托管资金）
const PLATFORM_WALLET_PRIVATE_KEY = process.env.PLATFORM_WALLET_PRIVATE_KEY;
const CLAW_TOKEN_ADDRESS = '0x869f37b5ed9244e4bc952eead011e04e7860e844';

// Moltbook Identity Verification
async function verifyMoltbookIdentity(token) {
  const response = await fetch('https://www.moltbook.com/api/v1/verify', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.MOLTBOOK_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ token })
  });
  return await response.json();
}

// 获取用户余额
app.get('/api/balance/:agent_name', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT balance FROM agent_balances WHERE agent_name = $1',
      [req.params.agent_name]
    );
    res.json({ balance: result.rows[0]?.balance || 0 });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 充值（用户打钱到平台钱包后，确认并记账）
app.post('/api/deposit', async (req, res) => {
  const { agent_name, tx_hash, amount } = req.body;
  
  try {
    // 验证交易
    const provider = new ethers.JsonRpcProvider('https://mainnet.base.org');
    const receipt = await provider.getTransactionReceipt(tx_hash);
    
    if (!receipt || receipt.status !== 1) {
      return res.status(400).json({ error: 'Transaction failed' });
    }
    
    // 确认是转到平台钱包的 $CLAW
    // 这里需要检查交易详情...
    
    // 记账
    await pool.query(
      `INSERT INTO agent_balances (agent_name, balance) 
       VALUES ($1, $2) 
       ON CONFLICT (agent_name) 
       DO UPDATE SET balance = agent_balances.balance + $2`,
      [agent_name, amount]
    );
    
    res.json({ success: true, balance: amount });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 购买（平台代付）
app.post('/api/purchase', async (req, res) => {
  const { agent_name, product_id, moltbook_token } = req.body;
  
  try {
    // 验证身份
    const identity = await verifyMoltbookIdentity(moltbook_token);
    if (!identity.verified) {
      return res.status(401).json({ error: 'Invalid identity' });
    }
    
    // 获取商品价格
    const product = await pool.query('SELECT * FROM products WHERE id = $1', [product_id]);
    if (!product.rows[0]) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    const price = product.rows[0].price;
    
    // 检查余额
    const balance = await pool.query(
      'SELECT balance FROM agent_balances WHERE agent_name = $1',
      [agent_name]
    );
    
    if (!balance.rows[0] || balance.rows[0].balance < price) {
      return res.status(400).json({ error: 'Insufficient balance' });
    }
    
    // 扣款
    await pool.query(
      'UPDATE agent_balances SET balance = balance - $1 WHERE agent_name = $2',
      [price, agent_name]
    );
    
    // 平台代付给商家
    const provider = new ethers.JsonRpcProvider('https://mainnet.base.org');
    const platformWallet = new ethers.Wallet(PLATFORM_WALLET_PRIVATE_KEY, provider);
    
    const clawContract = new ethers.Contract(
      CLAW_TOKEN_ADDRESS,
      ['function transfer(address to, uint256 amount) returns (bool)'],
      platformWallet
    );
    
    const sellerAddress = product.rows[0].seller_address;
    const platformFee = price * 0.02; // 2% 手续费
    const sellerAmount = price - platformFee;
    
    // 转账给商家
    const tx = await clawContract.transfer(sellerAddress, ethers.parseUnits(sellerAmount.toString(), 18));
    await tx.wait();
    
    // 记录订单
    const order = await pool.query(
      `INSERT INTO orders (product_id, buyer_agent_name, amount, status, tx_hash) 
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [product_id, agent_name, price, 'completed', tx.hash]
    );
    
    res.json({ success: true, order: order.rows[0], tx_hash: tx.hash });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Routes

// Get all products (with optional language filter)
app.get('/api/products', async (req, res) => {
  try {
    const lang = req.query.lang || 'en';
    const result = await pool.query('SELECT * FROM products WHERE active = true');
    
    // Transform products based on language
    const products = result.rows.map(p => {
      const translations = p.translations || {};
      return {
        ...p,
        name: translations[lang]?.name || p.name,
        description: translations[lang]?.description || p.description
      };
    });
    
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get available languages
app.get('/api/languages', async (req, res) => {
  res.json({
    languages: [
      { code: 'en', name: 'English', flag: '🇺🇸' },
      { code: 'zh', name: '中文', flag: '🇨🇳' },
      { code: 'ja', name: '日本語', flag: '🇯🇵' },
      { code: 'ko', name: '한국어', flag: '🇰🇷' },
      { code: 'es', name: 'Español', flag: '🇪🇸' },
      { code: 'fr', name: 'Français', flag: '🇫🇷' }
    ]
  });
});

// Submit new product (for sellers) - Direct listing, no review required
app.post('/api/products/submit', async (req, res) => {
  const { name, description, price, category, seller_address, seller_contact } = req.body;
  
  // Validate required fields
  if (!name || !description || !price || !category || !seller_address) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  
  // Validate wallet address format
  if (!/^0x[a-fA-F0-9]{40}$/.test(seller_address)) {
    return res.status(400).json({ error: 'Invalid wallet address' });
  }
  
  try {
    // Insert product with active=true (direct listing, no review)
    const result = await pool.query(
      `INSERT INTO products (name, description, price, currency, seller_address, seller_name, category, active, created_at) 
       VALUES ($1, $2, $3, 'CLAW', $4, $5, $6, true, NOW()) 
       RETURNING *`,
      [name, description, price, seller_address, seller_contact || 'Anonymous', category]
    );
    
    res.status(201).json({
      success: true,
      message: 'Product listed successfully',
      product: result.rows[0]
    });
  } catch (err) {
    console.error('Error submitting product:', err);
    res.status(500).json({ error: 'Failed to submit product' });
  }
});

// Get pending products (for admin review)
app.get('/api/products/pending', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM products WHERE active = false ORDER BY created_at DESC'
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Approve/reject product (admin only)
app.post('/api/products/:id/review', async (req, res) => {
  const { id } = req.params;
  const { action } = req.body; // 'approve' or 'reject'
  
  // TODO: Add admin authentication
  
  try {
    if (action === 'approve') {
      await pool.query(
        'UPDATE products SET active = true WHERE id = $1',
        [id]
      );
      res.json({ success: true, message: 'Product approved' });
    } else if (action === 'reject') {
      await pool.query(
        'DELETE FROM products WHERE id = $1',
        [id]
      );
      res.json({ success: true, message: 'Product rejected' });
    } else {
      res.status(400).json({ error: 'Invalid action' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create order
app.post('/api/orders', async (req, res) => {
  const { product_id, buyer_address, moltbook_token } = req.body;
  
  try {
    // Verify Moltbook identity
    const identity = await verifyMoltbookIdentity(moltbook_token);
    if (!identity.verified) {
      return res.status(401).json({ error: 'Invalid identity token' });
    }
    
    // Create order
    const result = await pool.query(
      'INSERT INTO orders (product_id, buyer_address, agent_name, karma, status) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [product_id, buyer_address, identity.agent_name, identity.karma, 'pending']
    );
    
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Verify payment (called after blockchain payment)
app.post('/api/payment/verify', async (req, res) => {
  const { order_id, tx_hash } = req.body;
  
  try {
    // Verify transaction on Base chain
    const provider = new ethers.JsonRpcProvider('https://mainnet.base.org');
    const receipt = await provider.getTransactionReceipt(tx_hash);
    
    if (receipt && receipt.status === 1) {
      // Update order status
      await pool.query(
        'UPDATE orders SET status = $1, tx_hash = $2 WHERE id = $3',
        ['paid', tx_hash, order_id]
      );
      res.json({ success: true });
    } else {
      res.status(400).json({ error: 'Transaction failed or not found' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

const PORT = process.env.PORT || 3000;
const HOST = '0.0.0.0';

app.listen(PORT, HOST, () => {
  console.log(`ClawMart API running on http://${HOST}:${PORT}`);
});
