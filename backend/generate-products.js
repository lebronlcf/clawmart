// 批量生成商品数据
const fs = require('fs');

// 商品模板 - 扩展版本
const templates = {
  'Compute': [
    { name: '{type} GPU Hours', desc: 'High-performance {type} GPU for {task}', basePrice: 50 },
    { name: '{type} CPU Cluster', desc: 'Distributed {type} computing power', basePrice: 25 },
    { name: '{type} Cloud Storage', desc: 'Decentralized {type} storage solution', basePrice: 10 },
    { name: '{type} Bandwidth', desc: 'High-speed {type} data transfer', basePrice: 15 },
    { name: '{type} Memory Pool', desc: 'Shared {type} memory resources', basePrice: 20 },
    { name: '{type} Container Service', desc: 'Scalable {type} container orchestration', basePrice: 35 },
    { name: '{type} Serverless Functions', desc: 'Event-driven {type} compute', basePrice: 18 },
    { name: '{type} Database Hosting', desc: 'Managed {type} database service', basePrice: 28 }
  ],
  'AI Services': [
    { name: '{type} Model Training', desc: 'Custom {type} AI model training', basePrice: 100 },
    { name: '{type} Inference API', desc: 'Real-time {type} predictions', basePrice: 30 },
    { name: '{type} Data Labeling', desc: 'Automated {type} data annotation', basePrice: 40 },
    { name: '{type} Fine-tuning', desc: 'Specialized {type} model fine-tuning', basePrice: 80 },
    { name: '{type} Prompt Engineering', desc: 'Optimized {type} prompt design', basePrice: 35 },
    { name: '{type} Vector Database', desc: '{type} embedding storage and search', basePrice: 45 },
    { name: '{type} LLM Gateway', desc: 'Unified {type} language model access', basePrice: 55 },
    { name: '{type} AI Agent Builder', desc: 'No-code {type} agent creation', basePrice: 75 }
  ],
  'Trading': [
    { name: '{type} Trading Bot', desc: 'Automated {type} trading strategies', basePrice: 150 },
    { name: '{type} Signal Provider', desc: 'Real-time {type} trading signals', basePrice: 60 },
    { name: '{type} Risk Manager', desc: 'Automated {type} risk controls', basePrice: 90 },
    { name: '{type} Portfolio Balancer', desc: 'Dynamic {type} portfolio optimization', basePrice: 75 },
    { name: '{type} Market Maker', desc: 'Automated {type} liquidity provision', basePrice: 200 },
    { name: '{type} Options Strategy', desc: 'Automated {type} options trading', basePrice: 180 },
    { name: '{type} Futures Trading', desc: 'Leveraged {type} futures automation', basePrice: 160 },
    { name: '{type} Copy Trading', desc: 'Mirror {type} successful traders', basePrice: 85 }
  ],
  'Security': [
    { name: '{type} Security Audit', desc: 'Comprehensive {type} security review', basePrice: 120 },
    { name: '{type} Threat Monitor', desc: 'Real-time {type} threat detection', basePrice: 55 },
    { name: '{type} Penetration Test', desc: 'Automated {type} vulnerability testing', basePrice: 180 },
    { name: '{type} Incident Response', desc: 'Automated {type} incident handling', basePrice: 95 },
    { name: '{type} Compliance Check', desc: 'Automated {type} compliance verification', basePrice: 70 },
    { name: '{type} Key Management', desc: 'Secure {type} key custody', basePrice: 110 },
    { name: '{type} Access Control', desc: 'Granular {type} permission management', basePrice: 65 },
    { name: '{type} Backup Recovery', desc: 'Automated {type} disaster recovery', basePrice: 85 }
  ],
  'Analytics': [
    { name: '{type} Data Analytics', desc: 'Advanced {type} data insights', basePrice: 65 },
    { name: '{type} Reporting Dashboard', desc: 'Custom {type} analytics dashboard', basePrice: 45 },
    { name: '{type} Forecasting Model', desc: 'Predictive {type} analytics', basePrice: 85 },
    { name: '{type} Visualization Tool', desc: 'Interactive {type} data visualization', basePrice: 40 },
    { name: '{type} Alert System', desc: 'Real-time {type} anomaly detection', basePrice: 50 },
    { name: '{type} Chain Analytics', desc: 'On-chain {type} data analysis', basePrice: 95 },
    { name: '{type} Social Sentiment', desc: 'Social media {type} sentiment tracking', basePrice: 55 },
    { name: '{type} Whale Tracking', desc: 'Large holder {type} movement alerts', basePrice: 70 }
  ],
  'Development': [
    { name: '{type} Code Review', desc: 'AI-powered {type} code analysis', basePrice: 45 },
    { name: '{type} Testing Suite', desc: 'Automated {type} test generation', basePrice: 55 },
    { name: '{type} CI/CD Pipeline', desc: 'Automated {type} deployment', basePrice: 65 },
    { name: '{type} Documentation', desc: 'Auto-generated {type} documentation', basePrice: 35 },
    { name: '{type} Bug Bounty', desc: 'Crowdsourced {type} vulnerability hunting', basePrice: 150 },
    { name: '{type} Smart Contract Dev', desc: 'Custom {type} contract development', basePrice: 250 },
    { name: '{type} Frontend Builder', desc: 'No-code {type} UI generation', basePrice: 75 },
    { name: '{type} API Generator', desc: 'Auto-generated {type} REST APIs', basePrice: 60 }
  ],
  'Marketing': [
    { name: '{type} Social Growth', desc: 'Automated {type} follower acquisition', basePrice: 80 },
    { name: '{type} Content Creation', desc: 'AI-generated {type} marketing content', basePrice: 50 },
    { name: '{type} Influencer Match', desc: 'AI-matched {type} influencer partnerships', basePrice: 95 },
    { name: '{type} Email Campaigns', desc: 'Automated {type} email marketing', basePrice: 40 },
    { name: '{type} SEO Optimizer', desc: 'Automated {type} search optimization', basePrice: 70 },
    { name: '{type} Ad Manager', desc: 'AI-optimized {type} ad campaigns', basePrice: 120 },
    { name: '{type} Community Builder', desc: 'Automated {type} community growth', basePrice: 85 },
    { name: '{type} Brand Monitor', desc: 'Real-time {type} brand mention tracking', basePrice: 55 }
  ],
  'Infrastructure': [
    { name: '{type} Node Hosting', desc: 'Dedicated {type} blockchain nodes', basePrice: 90 },
    { name: '{type} RPC Gateway', desc: 'High-availability {type} RPC access', basePrice: 45 },
    { name: '{type} Indexer Service', desc: 'Custom {type} blockchain indexing', basePrice: 110 },
    { name: '{type} IPFS Pinning', desc: 'Permanent {type} decentralized storage', basePrice: 25 },
    { name: '{type} Domain Management', desc: 'Automated {type} domain operations', basePrice: 35 },
    { name: '{type} Load Balancer', desc: 'Distributed {type} traffic management', basePrice: 75 },
    { name: '{type} CDN Service', desc: 'Global {type} content delivery', basePrice: 60 },
    { name: '{type} Monitoring Stack', desc: 'Comprehensive {type} system monitoring', basePrice: 50 }
  ]
};

// 类型修饰词
const types = [
  'High-Performance', 'Enterprise', 'Advanced', 'Pro', 'Lite',
  'Premium', 'Standard', 'Custom', 'AI-Powered', 'Decentralized',
  'Real-time', 'Automated', 'Smart', 'Secure', 'Scalable',
  'Lightning', 'Quantum', 'Neural', 'Distributed', 'Cloud'
];

// 任务/用途
const tasks = [
  'machine learning', 'deep learning', 'data processing', 'rendering',
  'scientific computing', 'blockchain validation', 'video encoding',
  'cryptographic operations', 'simulation', 'optimization'
];

// 生成商品
function generateProducts() {
  const products = [];
  let id = 1;
  
  // 为每个模板生成多个变体 - 增加到 16 个变体以达到 1000+
  for (const [category, items] of Object.entries(templates)) {
    for (const item of items) {
      // 每个基础模板生成 16 个变体
      for (let i = 0; i < 16; i++) {
        const type = types[Math.floor(Math.random() * types.length)];
        const task = tasks[Math.floor(Math.random() * tasks.length)];
        const priceVariation = 0.8 + Math.random() * 0.4; // 0.8x - 1.2x
        
        const name = item.name.replace('{type}', type);
        const desc = item.desc.replace('{type}', type.toLowerCase()).replace('{task}', task);
        const price = (item.basePrice * priceVariation).toFixed(2);
        
        products.push({
          id: id++,
          name,
          description: desc,
          price,
          category
        });
      }
    }
  }
  
  return products;
}

// 生成 SQL
function generateSQL() {
  const products = generateProducts();
  
  let sql = '-- Auto-generated products\n';
  sql += `INSERT INTO products (name, description, price, seller_address, seller_name, category) VALUES\n`;
  
  const values = products.map(p => 
    `('${p.name.replace(/'/g, "''")}', '${p.description.replace(/'/g, "''")}', ${p.price}, '0x39dB2c10171A2aAC03C5C8Ebf317DEe56E192169', 'ClawMart', '${p.category}')`
  );
  
  sql += values.join(',\n') + ';';
  
  return { sql, count: products.length };
}

const { sql, count } = generateSQL();

console.log(`Generated ${count} products`);
console.log('\nFirst 5 products:');
console.log(sql.split('\n').slice(1, 6).join('\n'));

// 保存到文件
fs.writeFileSync('generated-products.sql', sql);
console.log(`\nSaved to generated-products.sql`);
