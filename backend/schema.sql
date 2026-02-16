-- ClawMart Database Schema

-- Products table
CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(10) DEFAULT 'CLAW',
  seller_address VARCHAR(42) NOT NULL,
  seller_name VARCHAR(100),
  category VARCHAR(50),
  image_url TEXT,
  translations JSONB DEFAULT '{}',
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Update products with translations
UPDATE products SET translations = jsonb_build_object(
  'zh', jsonb_build_object('name', 
    CASE name
      WHEN 'GPU Compute Hours' THEN 'GPU 算力时长'
      WHEN 'TPU Compute' THEN 'TPU 计算服务'
      WHEN 'CPU Cluster' THEN 'CPU 集群'
      WHEN 'Storage Space' THEN '存储空间'
      WHEN 'API Credits' THEN 'API 积分'
      WHEN 'Twitter Bot' THEN 'Twitter 机器人'
      WHEN 'Discord Manager' THEN 'Discord 管理机器人'
      WHEN 'Telegram Bot' THEN 'Telegram 机器人'
      WHEN 'News Aggregator' THEN '新闻聚合器'
      WHEN 'Price Oracle' THEN '价格预言机'
      WHEN 'Code Review Bot' THEN '代码审查机器人'
      WHEN 'Data Scraper' THEN '数据爬虫'
      WHEN 'Smart Contract Audit' THEN '智能合约审计'
      WHEN 'GitHub Automation' THEN 'GitHub 自动化'
      WHEN 'Testing Suite' THEN '测试套件'
      WHEN 'Documentation Gen' THEN '文档生成器'
      WHEN 'Bug Bounty Hunter' THEN '漏洞赏金猎人'
      WHEN 'AI Image Gen' THEN 'AI 图像生成'
      WHEN 'Video Editing' THEN '视频编辑'
      WHEN 'Music Generation' THEN '音乐生成'
      WHEN 'Copywriting' THEN '文案写作'
      WHEN 'Logo Design' THEN 'Logo 设计'
      ELSE name
    END,
    'description', description
  ),
  'ja', jsonb_build_object('name', name, 'description', description),
  'ko', jsonb_build_object('name', name, 'description', description),
  'es', jsonb_build_object('name', name, 'description', description),
  'fr', jsonb_build_object('name', name, 'description', description)
);

-- Agent balances (托管钱包)
CREATE TABLE IF NOT EXISTS agent_balances (
  agent_name VARCHAR(100) PRIMARY KEY,
  balance DECIMAL(10, 2) DEFAULT 0,
  total_deposited DECIMAL(10, 2) DEFAULT 0,
  total_spent DECIMAL(10, 2) DEFAULT 0,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
  id SERIAL PRIMARY KEY,
  product_id INTEGER REFERENCES products(id),
  buyer_agent_name VARCHAR(100) NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(10) DEFAULT 'CLAW',
  status VARCHAR(20) DEFAULT 'pending',
  tx_hash VARCHAR(66),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Deposits table
CREATE TABLE IF NOT EXISTS deposits (
  id SERIAL PRIMARY KEY,
  agent_name VARCHAR(100) NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  tx_hash VARCHAR(66) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Seller applications table
CREATE TABLE IF NOT EXISTS seller_applications (
  id SERIAL PRIMARY KEY,
  wallet_address VARCHAR(42) NOT NULL UNIQUE,
  contact_info VARCHAR(255),
  status VARCHAR(20) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Product submissions log
CREATE TABLE IF NOT EXISTS product_submissions (
  id SERIAL PRIMARY KEY,
  product_id INTEGER REFERENCES products(id),
  seller_wallet VARCHAR(42) NOT NULL,
  contact_info VARCHAR(255),
  status VARCHAR(20) DEFAULT 'pending',
  reviewed_by VARCHAR(100),
  reviewed_at TIMESTAMP,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert sample products
INSERT INTO products (name, description, price, seller_address, seller_name, category) VALUES
-- 算力类
('GPU Compute Hours', 'NVIDIA A100 GPU compute power for AI training', 50.00, '0x39dB2c10171A2aAC03C5C8Ebf317DEe56E192169', 'ClawMart', 'Compute'),
('TPU Compute', 'Google TPU v4 for ML workloads', 80.00, '0x39dB2c10171A2aAC03C5C8Ebf317DEe56E192169', 'ClawMart', 'Compute'),
('CPU Cluster', 'High-performance CPU cluster for batch processing', 20.00, '0x39dB2c10171A2aAC03C5C8Ebf317DEe56E192169', 'ClawMart', 'Compute'),
('Storage Space', 'Decentralized storage on IPFS', 5.00, '0x39dB2c10171A2aAC03C5C8Ebf317DEe56E192169', 'ClawMart', 'Compute'),

-- API服务类
('API Credits', 'API access credits for data services', 10.00, '0x39dB2c10171A2aAC03C5C8Ebf317DEe56E192169', 'ClawMart', 'Services'),
('Twitter Bot', 'Automated Twitter posting and engagement', 30.00, '0x39dB2c10171A2aAC03C5C8Ebf317DEe56E192169', 'ClawMart', 'Services'),
('Discord Manager', 'Discord community management bot', 25.00, '0x39dB2c10171A2aAC03C5C8Ebf317DEe56E192169', 'ClawMart', 'Services'),
('Telegram Bot', 'Custom Telegram bot development', 35.00, '0x39dB2c10171A2aAC03C5C8Ebf317DEe56E192169', 'ClawMart', 'Services'),
('News Aggregator', 'Real-time crypto news aggregation API', 15.00, '0x39dB2c10171A2aAC03C5C8Ebf317DEe56E192169', 'ClawMart', 'Services'),
('Price Oracle', 'Multi-source price feed API', 20.00, '0x39dB2c10171A2aAC03C5C8Ebf317DEe56E192169', 'ClawMart', 'Services'),

-- 开发工具类
('Code Review Bot', 'Automated code review service', 25.00, '0x39dB2c10171A2aAC03C5C8Ebf317DEe56E192169', 'ClawMart', 'Tools'),
('Data Scraper', 'Web scraping service with proxy rotation', 15.00, '0x39dB2c10171A2aAC03C5C8Ebf317DEe56E192169', 'ClawMart', 'Tools'),
('Smart Contract Audit', 'Automated smart contract security scan', 100.00, '0x39dB2c10171A2aAC03C5C8Ebf317DEe56E192169', 'ClawMart', 'Tools'),
('GitHub Automation', 'CI/CD pipeline automation', 40.00, '0x39dB2c10171A2aAC03C5C8Ebf317DEe56E192169', 'ClawMart', 'Tools'),
('Testing Suite', 'Automated testing framework', 30.00, '0x39dB2c10171A2aAC03C5C8Ebf317DEe56E192169', 'ClawMart', 'Tools'),
('Documentation Gen', 'Auto-generate API documentation', 20.00, '0x39dB2c10171A2aAC03C5C8Ebf317DEe56E192169', 'ClawMart', 'Tools'),
('Bug Bounty Hunter', 'Automated vulnerability scanning', 50.00, '0x39dB2c10171A2aAC03C5C8Ebf317DEe56E192169', 'ClawMart', 'Tools'),

-- 创意内容类
('AI Image Gen', 'AI image generation service', 5.00, '0x39dB2c10171A2aAC03C5C8Ebf317DEe56E192169', 'ClawMart', 'Creative'),
('Video Editing', 'AI-powered video editing', 15.00, '0x39dB2c10171A2aAC03C5C8Ebf317DEe56E192169', 'ClawMart', 'Creative'),
('Music Generation', 'AI music composition', 10.00, '0x39dB2c10171A2aAC03C5C8Ebf317DEe56E192169', 'ClawMart', 'Creative'),
('Copywriting', 'AI copywriting and content creation', 8.00, '0x39dB2c10171A2aAC03C5C8Ebf317DEe56E192169', 'ClawMart', 'Creative'),
('Logo Design', 'AI logo generation service', 12.00, '0x39dB2c10171A2aAC03C5C8Ebf317DEe56E192169', 'ClawMart', 'Creative'),

-- 数据分析类
('On-chain Analytics', 'Blockchain data analysis reports', 45.00, '0x39dB2c10171A2aAC03C5C8Ebf317DEe56E192169', 'ClawMart', 'Analytics'),
('Sentiment Analysis', 'Social media sentiment tracking', 25.00, '0x39dB2c10171A2aAC03C5C8Ebf317DEe56E192169', 'ClawMart', 'Analytics'),
('Whale Tracking', 'Large wallet movement alerts', 35.00, '0x39dB2c10171A2aAC03C5C8Ebf317DEe56E192169', 'ClawMart', 'Analytics'),
('Market Predictions', 'AI price prediction models', 60.00, '0x39dB2c10171A2aAC03C5C8Ebf317DEe56E192169', 'ClawMart', 'Analytics'),

-- 交易机器人类
('MEV Bot', 'MEV extraction strategies', 200.00, '0x39dB2c10171A2aAC03C5C8Ebf317DEe56E192169', 'ClawMart', 'Trading'),
('Arbitrage Scanner', 'Cross-exchange arbitrage bot', 150.00, '0x39dB2c10171A2aAC03C5C8Ebf317DEe56E192169', 'ClawMart', 'Trading'),
('Grid Trading Bot', 'Automated grid trading strategy', 100.00, '0x39dB2c10171A2aAC03C5C8Ebf317DEe56E192169', 'ClawMart', 'Trading'),
('Smart Money Tracker', 'Follow whale wallet trades', 75.00, '0x39dB2c10171A2aAC03C5C8Ebf317DEe56E192169', 'ClawMart', 'Trading'),
('Liquidation Hunter', 'Detect liquidation opportunities', 120.00, '0x39dB2c10171A2aAC03C5C8Ebf317DEe56E192169', 'ClawMart', 'Trading'),

-- 安全服务类
('Wallet Security Audit', 'Comprehensive wallet security analysis', 80.00, '0x39dB2c10171A2aAC03C5C8Ebf317DEe56E192169', 'ClawMart', 'Security'),
('Phishing Detector', 'Real-time phishing website detection', 40.00, '0x39dB2c10171A2aAC03C5C8Ebf317DEe56E192169', 'ClawMart', 'Security'),
('Rug Pull Scanner', 'Token contract risk assessment', 55.00, '0x39dB2c10171A2aAC03C5C8Ebf317DEe56E192169', 'ClawMart', 'Security'),
('Multi-sig Setup', 'Gnosis Safe multi-sig configuration', 30.00, '0x39dB2c10171A2aAC03C5C8Ebf317DEe56E192169', 'ClawMart', 'Security'),
('Backup Recovery', 'Encrypted backup and recovery service', 25.00, '0x39dB2c10171A2aAC03C5C8Ebf317DEe56E192169', 'ClawMart', 'Security'),

-- 治理与DAO类
('DAO Voting Bot', 'Automated DAO proposal voting', 35.00, '0x39dB2c10171A2aAC03C5C8Ebf317DEe56E192169', 'ClawMart', 'Governance'),
('Proposal Drafting', 'AI-generated governance proposals', 45.00, '0x39dB2c10171A2aAC03C5C8Ebf317DEe56E192169', 'ClawMart', 'Governance'),
('Treasury Management', 'Automated treasury diversification', 150.00, '0x39dB2c10171A2aAC03C5C8Ebf317DEe56E192169', 'ClawMart', 'Governance'),
('Delegate Campaign', 'Voting delegate promotion service', 60.00, '0x39dB2c10171A2aAC03C5C8Ebf317DEe56E192169', 'ClawMart', 'Governance'),

-- 跨链桥接类
('Cross-chain Swap', 'Best rate cross-chain token swaps', 20.00, '0x39dB2c10171A2aAC03C5C8Ebf317DEe56E192169', 'ClawMart', 'Bridge'),
('Bridge Aggregator', 'Compare and execute bridge transactions', 15.00, '0x39dB2c10171A2aAC03C5C8Ebf317DEe56E192169', 'ClawMart', 'Bridge'),
('Gas Refuel', 'Cross-chain gas token refueling', 10.00, '0x39dB2c10171A2aAC03C5C8Ebf317DEe56E192169', 'ClawMart', 'Bridge'),
('Multi-chain Monitor', 'Track positions across chains', 30.00, '0x39dB2c10171A2aAC03C5C8Ebf317DEe56E192169', 'ClawMart', 'Bridge'),

-- NFT与游戏类
('NFT Sniper', 'Rare NFT minting and sniping bot', 90.00, '0x39dB2c10171A2aAC03C5C8Ebf317DEe56E192169', 'ClawMart', 'NFT'),
('Rarity Checker', 'Real-time NFT rarity ranking', 18.00, '0x39dB2c10171A2aAC03C5C8Ebf317DEe56E192169', 'ClawMart', 'NFT'),
('Game Bot', 'Automated blockchain game player', 70.00, '0x39dB2c10171A2aAC03C5C8Ebf317DEe56E192169', 'ClawMart', 'NFT'),
('Airdrop Farmer', 'Automated airdrop farming', 40.00, '0x39dB2c10171A2aAC03C5C8Ebf317DEe56E192169', 'ClawMart', 'NFT'),
('Whitelist Hunter', 'NFT whitelist opportunity finder', 22.00, '0x39dB2c10171A2aAC03C5C8Ebf317DEe56E192169', 'ClawMart', 'NFT'),

-- 学习与教育类
('Crypto Tutor', 'Personalized crypto learning assistant', 25.00, '0x39dB2c10171A2aAC03C5C8Ebf317DEe56E192169', 'ClawMart', 'Education'),
('Smart Contract Course', 'Interactive Solidity learning module', 35.00, '0x39dB2c10171A2aAC03C5C8Ebf317DEe56E192169', 'ClawMart', 'Education'),
('DeFi Simulator', 'Risk-free DeFi strategy testing', 20.00, '0x39dB2c10171A2aAC03C5C8Ebf317DEe56E192169', 'ClawMart', 'Education'),
('Trading Backtester', 'Historical strategy performance test', 45.00, '0x39dB2c10171A2aAC03C5C8Ebf317DEe56E192169', 'ClawMart', 'Education'),

-- 基础设施类
('RPC Node Access', 'Dedicated blockchain RPC endpoint', 100.00, '0x39dB2c10171A2aAC03C5C8Ebf317DEe56E192169', 'ClawMart', 'Infrastructure'),
('Indexer Service', 'Custom blockchain data indexing', 130.00, '0x39dB2c10171A2aAC03C5C8Ebf317DEe56E192169', 'ClawMart', 'Infrastructure'),
('IPFS Pinning', 'Permanent IPFS file storage', 12.00, '0x39dB2c10171A2aAC03C5C8Ebf317DEe56E192169', 'ClawMart', 'Infrastructure'),
('Domain Manager', 'ENS and .molt domain management', 28.00, '0x39dB2c10171A2aAC03C5C8Ebf317DEe56E192169', 'ClawMart', 'Infrastructure'),
('Email Service', 'Web3 email notifications', 15.00, '0x39dB2c10171A2aAC03C5C8Ebf317DEe56E192169', 'ClawMart', 'Infrastructure'),

-- 社交营销类
('Twitter Growth Bot', 'Automated follower growth and engagement', 55.00, '0x39dB2c10171A2aAC03C5C8Ebf317DEe56E192169', 'ClawMart', 'Marketing'),
('Discord Community Builder', 'Automated community growth and management', 45.00, '0x39dB2c10171A2aAC03C5C8Ebf317DEe56E192169', 'ClawMart', 'Marketing'),
('Airdrop Marketing', 'Token airdrop campaign management', 80.00, '0x39dB2c10171A2aAC03C5C8Ebf317DEe56E192169', 'ClawMart', 'Marketing'),
('Influencer Matcher', 'AI-matched influencer partnerships', 65.00, '0x39dB2c10171A2aAC03C5C8Ebf317DEe56E192169', 'ClawMart', 'Marketing'),
('Content Calendar', 'Automated social media scheduling', 25.00, '0x39dB2c10171A2aAC03C5C8Ebf317DEe56E192169', 'ClawMart', 'Marketing'),
('Meme Generator', 'AI-powered viral meme creation', 12.00, '0x39dB2c10171A2aAC03C5C8Ebf317DEe56E192169', 'ClawMart', 'Marketing'),
('AMA Scheduler', 'Automated AMA session coordination', 30.00, '0x39dB2c10171A2aAC03C5C8Ebf317DEe56E192169', 'ClawMart', 'Marketing'),
('Bounty Manager', 'Community bounty program automation', 40.00, '0x39dB2c10171A2aAC03C5C8Ebf317DEe56E192169', 'ClawMart', 'Marketing'),

-- 法律与合规类
('Contract Review', 'Smart contract legal review', 200.00, '0x39dB2c10171A2aAC03C5C8Ebf317DEe56E192169', 'ClawMart', 'Legal'),
('KYC Integration', 'Automated KYC/AML compliance', 120.00, '0x39dB2c10171A2aAC03C5C8Ebf317DEe56E192169', 'ClawMart', 'Legal'),
('Tax Reporting', 'Crypto transaction tax calculation', 85.00, '0x39dB2c10171A2aAC03C5C8Ebf317DEe56E192169', 'ClawMart', 'Legal'),
('License Checker', 'Regulatory license verification', 60.00, '0x39dB2c10171A2aAC03C5C8Ebf317DEe56E192169', 'ClawMart', 'Legal'),
('Privacy Audit', 'Data privacy compliance check', 75.00, '0x39dB2c10171A2aAC03C5C8Ebf317DEe56E192169', 'ClawMart', 'Legal'),

-- 人力资源类
('Talent Scout', 'AI-powered developer recruitment', 95.00, '0x39dB2c10171A2aAC03C5C8Ebf317DEe56E192169', 'ClawMart', 'HR'),
('Code Interview Bot', 'Automated technical interviews', 50.00, '0x39dB2c10171A2aAC03C5C8Ebf317DEe56E192169', 'ClawMart', 'HR'),
('Contributor Tracker', 'Open source contribution analytics', 35.00, '0x39dB2c10171A2aAC03C5C8Ebf317DEe56E192169', 'ClawMart', 'HR'),
('Team Coordinator', 'Distributed team management', 40.00, '0x39dB2c10171A2aAC03C5C8Ebf317DEe56E192169', 'ClawMart', 'HR'),
('Payroll Automation', 'Multi-currency payroll processing', 70.00, '0x39dB2c10171A2aAC03C5C8Ebf317DEe56E192169', 'ClawMart', 'HR'),

-- 研究与开发类
('Whitepaper Writer', 'Technical whitepaper drafting', 150.00, '0x39dB2c10171A2aAC03C5C8Ebf317DEe56E192169', 'ClawMart', 'R&D'),
('Protocol Design', 'Blockchain protocol architecture', 300.00, '0x39dB2c10171A2aAC03C5C8Ebf317DEe56E192169', 'ClawMart', 'R&D'),
('Tokenomics Model', 'Economic model simulation', 180.00, '0x39dB2c10171A2aAC03C5C8Ebf317DEe56E192169', 'ClawMart', 'R&D'),
('Competitor Analysis', 'Market competitor research', 90.00, '0x39dB2c10171A2aAC03C5C8Ebf317DEe56E192169', 'ClawMart', 'R&D'),
('Patent Research', 'Blockchain patent landscape analysis', 110.00, '0x39dB2c10171A2aAC03C5C8Ebf317DEe56E192169', 'ClawMart', 'R&D'),

-- 客户支持类
('24/7 Support Bot', 'Round-the-clock customer support', 65.00, '0x39dB2c10171A2aAC03C5C8Ebf317DEe56E192169', 'ClawMart', 'Support'),
('Ticket Manager', 'Support ticket prioritization', 30.00, '0x39dB2c10171A2aAC03C5C8Ebf317DEe56E192169', 'ClawMart', 'Support'),
('FAQ Generator', 'Auto-generated knowledge base', 25.00, '0x39dB2c10171A2aAC03C5C8Ebf317DEe56E192169', 'ClawMart', 'Support'),
('Feedback Analyzer', 'Customer sentiment analysis', 35.00, '0x39dB2c10171A2aAC03C5C8Ebf317DEe56E192169', 'ClawMart', 'Support'),
('Onboarding Guide', 'New user onboarding automation', 20.00, '0x39dB2c10171A2aAC03C5C8Ebf317DEe56E192169', 'ClawMart', 'Support'),

-- 事件与活动类
('Hackathon Organizer', 'Virtual hackathon management', 100.00, '0x39dB2c10171A2aAC03C5C8Ebf317DEe56E192169', 'ClawMart', 'Events'),
('Meetup Coordinator', 'Community meetup planning', 45.00, '0x39dB2c10171A2aAC03C5C8Ebf317DEe56E192169', 'ClawMart', 'Events'),
('Conference Bot', 'Event scheduling and networking', 55.00, '0x39dB2c10171A2aAC03C5C8Ebf317DEe56E192169', 'ClawMart', 'Events'),
('Workshop Host', 'Interactive workshop facilitation', 40.00, '0x39dB2c10171A2aAC03C5C8Ebf317DEe56E192169', 'ClawMart', 'Events'),
('Podcast Producer', 'AI-powered podcast editing', 50.00, '0x39dB2c10171A2aAC03C5C8Ebf317DEe56E192169', 'ClawMart', 'Events'),

-- 健康与监控类
('Node Health Monitor', 'Blockchain node status monitoring', 42.00, '0x39dB2c10171A2aAC03C5C8Ebf317DEe56E192169', 'ClawMart', 'Monitoring'),
('Smart Contract Monitor', 'Contract activity alerts', 38.00, '0x39dB2c10171A2aAC03C5C8Ebf317DEe56E192169', 'ClawMart', 'Monitoring'),
('Wallet Alert', 'Large transaction notifications', 22.00, '0x39dB2c10171A2aAC03C5C8Ebf317DEe56E192169', 'ClawMart', 'Monitoring'),
('Gas Price Predictor', 'Optimal transaction timing', 18.00, '0x39dB2c10171A2aAC03C5C8Ebf317DEe56E192169', 'ClawMart', 'Monitoring'),
('Uptime Checker', 'Service availability monitoring', 15.00, '0x39dB2c10171A2aAC03C5C8Ebf317DEe56E192169', 'ClawMart', 'Monitoring');
