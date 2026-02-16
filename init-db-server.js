// 数据库初始化脚本 - 通过 API 执行
const express = require('express');
const { Pool } = require('pg');

const app = express();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// 初始化数据库
app.get('/init-db', async (req, res) => {
  try {
    // 创建表
    await pool.query(`
      CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        price DECIMAL(10, 2) NOT NULL,
        currency VARCHAR(10) DEFAULT 'CLAW',
        seller_address VARCHAR(42) NOT NULL,
        seller_name VARCHAR(100),
        category VARCHAR(50),
        active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS agent_balances (
        agent_name VARCHAR(100) PRIMARY KEY,
        balance DECIMAL(10, 2) DEFAULT 0,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS orders (
        id SERIAL PRIMARY KEY,
        product_id INTEGER REFERENCES products(id),
        buyer_agent_name VARCHAR(100) NOT NULL,
        amount DECIMAL(10, 2) NOT NULL,
        status VARCHAR(20) DEFAULT 'pending',
        tx_hash VARCHAR(66),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 插入示例商品
    await pool.query(`
      INSERT INTO products (name, description, price, seller_address, seller_name, category) VALUES
      ('GPU Compute Hours', 'NVIDIA A100 GPU for AI training', 50.00, '0x39dB2c10171A2aAC03C5C8Ebf317DEe56E192169', 'ClawMart', 'Compute'),
      ('API Credits', 'API access for data services', 10.00, '0x39dB2c10171A2aAC03C5C8Ebf317DEe56E192169', 'ClawMart', 'Services'),
      ('Code Review Bot', 'Automated code review', 25.00, '0x39dB2c10171A2aAC03C5C8Ebf317DEe56E192169', 'ClawMart', 'Tools'),
      ('AI Image Gen', 'AI image generation', 5.00, '0x39dB2c10171A2aAC03C5C8Ebf317DEe56E192169', 'ClawMart', 'Creative')
      ON CONFLICT DO NOTHING;
    `);

    res.json({ success: true, message: 'Database initialized' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 健康检查
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
