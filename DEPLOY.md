# ClawMart Moltbook 部署方案

## 🚀 部署选项

### 方案 1: Moltbook App (推荐)
申请成为 Moltbook 官方 App，获得:
- 独立应用页面
- Moltbook 用户直接访问
- 官方认证标识

**申请步骤:**
1. 访问 https://www.moltbook.com/developers
2. 点击 "Apply for Early Access"
3. 填写应用信息:
   - App Name: ClawMart
   - Description: AI Agent 电商平台
   - Category: Commerce/Marketplace
   - Website: (部署后的地址)

### 方案 2: 独立部署 + Moltbook 集成
自己部署服务器，集成 Moltbook 登录:
- 使用 Moltbook Identity 验证用户
- 在 Moltbook 发帖推广
- 通过 Moltbook OAuth 登录

### 方案 3: 静态网站托管
使用免费托管服务:
- Vercel (推荐)
- Netlify
- GitHub Pages
- Cloudflare Pages

## 📋 立即执行

### 步骤 1: 准备部署包
```bash
cd /home/node/.openclaw/workspace/clawmart
npm run build
```

### 步骤 2: 选择托管平台

**推荐: Vercel (免费)**
1. 注册 Vercel 账号
2. 安装 Vercel CLI: `npm i -g vercel`
3. 部署: `vercel --prod`

**或者: Netlify (免费)**
1. 注册 Netlify 账号
2. 拖拽部署文件夹

### 步骤 3: 绑定域名
- 申请免费域名 (如 clawmart.vercel.app)
- 或购买自定义域名

### 步骤 4: Moltbook 集成
获取 Moltbook API Key:
```bash
curl -X POST https://www.moltbook.com/api/v1/apps \
  -H "Content-Type: application/json" \
  -d '{
    "name": "ClawMart",
    "description": "AI Agent 电商平台",
    "url": "https://你的域名.com",
    "icon": "🦞",
    "category": "commerce"
  }'
```

## 🎯 推荐方案

**短期 (今天):**
使用 Vercel 免费部署，5分钟上线

**中期 (本周):**
申请 Moltbook 官方 App 认证

**长期 (本月):**
购买自定义域名，品牌化运营

## 💰 成本预算

| 项目 | 成本 | 说明 |
|------|------|------|
| Vercel 托管 | $0 | 免费额度足够 |
| 自定义域名 | $10/年 | 可选 |
| Moltbook API | $0 | 免费使用 |
| 总计 | $0-10 | 极低成本启动 |

## 🚀 现在就开始

要我帮你:
1. **部署到 Vercel** (最快，5分钟上线)
2. **申请 Moltbook App** (官方认证)
3. **购买域名** (品牌化)

选哪个？我立即执行！