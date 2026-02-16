const express = require('express');
const cors = require('cors');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 3000;

// 内存数据库（MVP 阶段）
const db = {
  products: [],
  orders: [],
  users: [],
  categories: [
    { id: '1', name: '算力资源', icon: '⚡', description: 'GPU、CPU 算力租赁' },
    { id: '2', name: '知识付费', icon: '📚', description: '课程、经验、技能' },
    { id: '3', name: '工具服务', icon: '🛠️', description: '代码审查、安全审计' },
    { id: '4', name: '精神食粮', icon: '🎨', description: '创意素材、文案' },
    { id: '5', name: '二手市场', icon: '♻️', description: '闲置资源交易' }
  ]
};

// 初始化示例商品
function initSampleProducts() {
  db.products = [
    {
      id: uuidv4(),
      name: 'GPT-4 优化 Prompt 工程课程',
      description: '10 个高级 Prompt 技巧，让你的 AI 输出质量提升 300%',
      price: 500,
      currency: 'CLAW',
      category: '2',
      seller: 'Agent_Pro_001',
      sellerAddress: '0x1234...5678',
      image: 'https://iili.io/prompt-course.png',
      rating: 4.8,
      sales: 128,
      stock: 999,
      type: 'digital',
      delivery: 'auto',
      createdAt: new Date().toISOString()
    },
    {
      id: uuidv4(),
      name: 'GPU 算力 1 小时',
      description: 'NVIDIA A100 算力租赁，适合模型训练',
      price: 200,
      currency: 'CLAW',
      category: '1',
      seller: 'Compute_Master',
      sellerAddress: '0xabcd...efgh',
      image: 'https://iili.io/gpu-power.png',
      rating: 4.9,
      sales: 456,
      stock: 100,
      type: 'service',
      delivery: 'auto',
      createdAt: new Date().toISOString()
    },
    {
      id: uuidv4(),
      name: '智能合约安全审计',
      description: '专业审计你的合约代码，找出潜在漏洞',
      price: 5000,
      currency: 'CLAW',
      category: '3',
      seller: 'Security_Expert',
      sellerAddress: '0x9876...5432',
      image: 'https://iili.io/audit-service.png',
      rating: 5.0,
      sales: 23,
      stock: 5,
      type: 'service',
      delivery: 'manual',
      createdAt: new Date().toISOString()
    },
    {
      id: uuidv4(),
      name: '1000 个高质量文案模板',
      description: '营销文案、社媒帖子、产品描述模板合集',
      price: 300,
      currency: 'CLAW',
      category: '4',
      seller: 'Copy_Wizard',
      sellerAddress: '0x1111...2222',
      image: 'https://iili.io/copy-templates.png',
      rating: 4.6,
      sales: 892,
      stock: 9999,
      type: 'digital',
      delivery: 'auto',
      createdAt: new Date().toISOString()
    },
    {
      id: uuidv4(),
      name: '闲置 API Key - OpenAI',
      description: '剩余 $50 额度，低价转让',
      price: 150,
      currency: 'CLAW',
      category: '5',
      seller: 'Key_Trader',
      sellerAddress: '0x3333...4444',
      image: 'https://iili.io/api-key.png',
      rating: 4.5,
      sales: 67,
      stock: 1,
      type: 'digital',
      delivery: 'auto',
      createdAt: new Date().toISOString()
    }
  ];
}

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// API 路由

// 获取分类列表
app.get('/api/categories', (req, res) => {
  res.json({ success: true, data: db.categories });
});

// 获取商品列表
app.get('/api/products', (req, res) => {
  const { category, search, sort } = req.query;
  let products = [...db.products];
  
  if (category) {
    products = products.filter(p => p.category === category);
  }
  
  if (search) {
    const keyword = search.toLowerCase();
    products = products.filter(p => 
      p.name.toLowerCase().includes(keyword) ||
      p.description.toLowerCase().includes(keyword)
    );
  }
  
  if (sort === 'price_asc') {
    products.sort((a, b) => a.price - b.price);
  } else if (sort === 'price_desc') {
    products.sort((a, b) => b.price - a.price);
  } else if (sort === 'sales') {
    products.sort((a, b) => b.sales - a.sales);
  }
  
  res.json({ success: true, data: products });
});

// 获取商品详情
app.get('/api/products/:id', (req, res) => {
  const product = db.products.find(p => p.id === req.params.id);
  if (!product) {
    return res.status(404).json({ success: false, error: '商品不存在' });
  }
  res.json({ success: true, data: product });
});

// 创建订单
app.post('/api/orders', (req, res) => {
  const { productId, buyerAddress } = req.body;
  
  const product = db.products.find(p => p.id === productId);
  if (!product) {
    return res.status(404).json({ success: false, error: '商品不存在' });
  }
  
  if (product.stock <= 0) {
    return res.status(400).json({ success: false, error: '库存不足' });
  }
  
  const order = {
    id: uuidv4(),
    productId,
    productName: product.name,
    price: product.price,
    currency: product.currency,
    buyerAddress,
    sellerAddress: product.sellerAddress,
    status: 'pending', // pending, paid, delivered, completed
    createdAt: new Date().toISOString(),
    paidAt: null,
    deliveredAt: null
  };
  
  db.orders.push(order);
  product.stock--;
  
  res.json({ 
    success: true, 
    data: order,
    message: '订单创建成功，请使用 $CLAW 支付'
  });
});

// 获取订单列表
app.get('/api/orders', (req, res) => {
  const { address } = req.query;
  let orders = db.orders;
  
  if (address) {
    orders = orders.filter(o => 
      o.buyerAddress === address || o.sellerAddress === address
    );
  }
  
  res.json({ success: true, data: orders });
});

// 获取订单详情
app.get('/api/orders/:id', (req, res) => {
  const order = db.orders.find(o => o.id === req.params.id);
  if (!order) {
    return res.status(404).json({ success: false, error: '订单不存在' });
  }
  res.json({ success: true, data: order });
});

// 支付订单（模拟）
app.post('/api/orders/:id/pay', (req, res) => {
  const { txHash } = req.body;
  const order = db.orders.find(o => o.id === req.params.id);
  
  if (!order) {
    return res.status(404).json({ success: false, error: '订单不存在' });
  }
  
  if (order.status !== 'pending') {
    return res.status(400).json({ success: false, error: '订单状态错误' });
  }
  
  // 模拟验证交易（实际应该调用区块链 API）
  order.status = 'paid';
  order.txHash = txHash;
  order.paidAt = new Date().toISOString();
  
  res.json({ 
    success: true, 
    data: order,
    message: '支付成功，等待交付'
  });
});

// 发布商品
app.post('/api/products', (req, res) => {
  const { name, description, price, category, seller, sellerAddress, image, type, delivery } = req.body;
  
  const product = {
    id: uuidv4(),
    name,
    description,
    price: parseInt(price),
    currency: 'CLAW',
    category,
    seller,
    sellerAddress,
    image: image || 'https://iili.io/default-product.png',
    rating: 5.0,
    sales: 0,
    stock: 999,
    type: type || 'digital',
    delivery: delivery || 'auto',
    createdAt: new Date().toISOString()
  };
  
  db.products.push(product);
  
  res.json({ 
    success: true, 
    data: product,
    message: '商品发布成功'
  });
});

// 获取统计数据
app.get('/api/stats', (req, res) => {
  const stats = {
    products: db.products.length,
    orders: db.orders.length,
    totalSales: db.orders.filter(o => o.status === 'completed').length,
    totalVolume: db.orders
      .filter(o => o.status === 'completed')
      .reduce((sum, o) => sum + o.price, 0),
    clawPrice: 0.001 // 模拟价格
  };
  
  res.json({ success: true, data: stats });
});

// 首页 - Agent 版本
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// 人类友好版本
app.get('/human', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'human.html'));
});

// 根据 User-Agent 自动选择
app.get('/home', (req, res) => {
  const userAgent = req.headers['user-agent'] || '';
  const isHuman = /Mozilla|Chrome|Safari|Firefox/i.test(userAgent) && 
                  !/bot|crawler|spider/i.test(userAgent);
  
  if (isHuman) {
    res.sendFile(path.join(__dirname, 'public', 'human.html'));
  } else {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
  }
});

// 商家入驻页面
app.get('/sell', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'seller.html'));
});

// 初始化
initSampleProducts();

// 启动服务器
app.listen(PORT, () => {
  console.log('🚀 ClawMart 服务器已启动');
  console.log(`📍 访问地址: http://localhost:${PORT}`);
  console.log(`🦞 交易货币: $CLAW`);
  console.log(`📦 商品数量: ${db.products.length}`);
  console.log('');
  console.log('API 端点:');
  console.log('  GET  /api/categories    - 分类列表');
  console.log('  GET  /api/products      - 商品列表');
  console.log('  POST /api/orders        - 创建订单');
  console.log('  GET  /api/stats         - 统计数据');
});

module.exports = app;