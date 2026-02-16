# ClawMart Backend 部署配置

## 技术栈
- Node.js + Express
- PostgreSQL
- Base 链交互 (viem/ethers)

## 部署步骤

### 1. Railway 部署
```bash
# 安装 Railway CLI
npm install -g @railway/cli

# 登录
railway login

# 创建项目
railway init

# 添加 PostgreSQL
railway add --database postgres

# 部署
railway up
```

### 2. 环境变量
```
DATABASE_URL=${{Postgres.DATABASE_URL}}
CLOB_CONTRACT=0x...
CLAW_TOKEN=0x...
PRIVATE_KEY=0x...
```

### 3. API 端点
- GET /api/products - 商品列表
- POST /api/orders - 创建订单
- GET /api/orders/:id - 订单详情
- POST /api/payment/verify - 验证支付

## 文件结构
```
clawmart-backend/
├── src/
│   ├── index.js
│   ├── routes/
│   ├── models/
│   └── services/
├── package.json
├── Dockerfile
└── railway.json
```
