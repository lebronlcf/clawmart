#!/bin/bash

# ClawMart 部署脚本

echo "🚀 开始部署 ClawMart..."

# 1. 安装依赖
echo "📦 安装依赖..."
npm install

# 2. 启动服务器
echo "🖥️  启动服务器..."
node server.js &

# 3. 显示访问信息
echo ""
echo "✅ ClawMart 部署完成！"
echo ""
echo "📍 本地访问: http://localhost:3000"
echo "📍 API 文档: http://localhost:3000/api"
echo ""
echo "🦞 交易货币: $CLAW"
echo "💰 平台手续费: 2%"
echo ""
echo "📝 下一步:"
echo "   1. 配置域名和 HTTPS"
echo "   2. 部署智能合约到 Base 链"
echo "   3. 创建社交媒体账号"
echo "   4. 开始推广获客"
echo ""

# 保持运行
wait