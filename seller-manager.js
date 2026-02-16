// ClawMart 商家管理系统
const fs = require('fs');
const path = require('path');

// 商家数据库
const SELLERS_DB = path.join(__dirname, 'data', 'sellers.json');
const PRODUCTS_DB = path.join(__dirname, 'data', 'products.json');

// 确保数据目录存在
if (!fs.existsSync(path.join(__dirname, 'data'))) {
  fs.mkdirSync(path.join(__dirname, 'data'));
}

// 初始化数据库
function initDB() {
  if (!fs.existsSync(SELLERS_DB)) {
    fs.writeFileSync(SELLERS_DB, JSON.stringify([], null, 2));
  }
  if (!fs.existsSync(PRODUCTS_DB)) {
    fs.writeFileSync(PRODUCTS_DB, JSON.stringify([], null, 2));
  }
}

// 读取商家列表
function getSellers() {
  try {
    return JSON.parse(fs.readFileSync(SELLERS_DB, 'utf8'));
  } catch (e) {
    return [];
  }
}

// 保存商家
function saveSeller(seller) {
  const sellers = getSellers();
  seller.id = Date.now().toString();
  seller.createdAt = new Date().toISOString();
  seller.status = 'pending'; // pending, approved, rejected
  sellers.push(seller);
  fs.writeFileSync(SELLERS_DB, JSON.stringify(sellers, null, 2));
  return seller;
}

// 审核商家
function approveSeller(sellerId) {
  const sellers = getSellers();
  const seller = sellers.find(s => s.id === sellerId);
  if (seller) {
    seller.status = 'approved';
    seller.approvedAt = new Date().toISOString();
    fs.writeFileSync(SELLERS_DB, JSON.stringify(sellers, null, 2));
    return seller;
  }
  return null;
}

// 获取商品列表
function getProducts() {
  try {
    return JSON.parse(fs.readFileSync(PRODUCTS_DB, 'utf8'));
  } catch (e) {
    return [];
  }
}

// 添加商品
function addProduct(product) {
  const products = getProducts();
  product.id = Date.now().toString();
  product.createdAt = new Date().toISOString();
  product.status = 'active';
  product.sales = 0;
  product.rating = 5.0;
  products.push(product);
  fs.writeFileSync(PRODUCTS_DB, JSON.stringify(products, null, 2));
  return product;
}

// 生成商家入驻指南
function generateSellerGuide() {
  return `# ClawMart 商家入驻指南

## 🎉 欢迎加入 ClawMart！

你的入驻申请已收到，请按照以下步骤完成入驻：

## 📋 入驻流程

### 步骤 1: 准备资料
- 商家名称
- 商家简介
- 钱包地址（用于收款）
- 联系方式

### 步骤 2: 上架商品
使用以下格式添加商品：

\`\`\`json
{
  "name": "商品名称",
  "description": "商品描述",
  "price": 100,
  "category": "1",
  "image": "https://...",
  "type": "digital",
  "delivery": "auto"
}
\`\`\`

### 步骤 3: 等待审核
- 审核时间：24 小时内
- 审核通过后即可开始销售

## 💰 收益说明

- 平台手续费：2%
- 商家收益：98%
- 结算方式：自动结算到钱包

## 📞 联系我们

有问题随时联系客服！

---
祝你在 ClawMart 赚大钱！🦞💰`;
}

// 生成推广素材
function generatePromoMaterials(sellerName) {
  return {
    twitter: `🎉 欢迎 @${sellerName} 入驻 ClawMart！

新商家上线，限时优惠中：
• 首单 5 折
• 满减优惠
• 赠品活动

立即查看 👇
#ClawMart #新商家`,

    moltbook: `🦞 新商家入驻公告

欢迎 **${sellerName}** 加入 ClawMart！

新店开业，福利多多：
✅ 限时折扣
✅ 满减活动
✅ 专属优惠

快来支持新商家！👇

#新商家 #ClawMart`
  };
}

// 统计报表
function generateReport() {
  const sellers = getSellers();
  const products = getProducts();
  
  const approvedSellers = sellers.filter(s => s.status === 'approved');
  const pendingSellers = sellers.filter(s => s.status === 'pending');
  
  return {
    totalSellers: sellers.length,
    approvedSellers: approvedSellers.length,
    pendingSellers: pendingSellers.length,
    totalProducts: products.length,
    reportDate: new Date().toISOString()
  };
}

// 初始化
initDB();

// 导出
module.exports = {
  getSellers,
  saveSeller,
  approveSeller,
  getProducts,
  addProduct,
  generateSellerGuide,
  generatePromoMaterials,
  generateReport
};

// 如果直接运行
if (require.main === module) {
  console.log('📊 ClawMart 商家管理系统');
  console.log('='.repeat(60));
  
  const report = generateReport();
  console.log('当前统计:');
  console.log('  商家总数:', report.totalSellers);
  console.log('  已审核:', report.approvedSellers);
  console.log('  待审核:', report.pendingSellers);
  console.log('  商品总数:', report.totalProducts);
}