// ClawMart 智能合约部署脚本
const { ethers } = require('ethers');
const fs = require('fs');
const path = require('path');

// 配置
const CONFIG = {
  // Base 链 RPC
  base: {
    rpc: 'https://mainnet.base.org',
    chainId: 8453,
    name: 'Base Mainnet'
  },
  baseSepolia: {
    rpc: 'https://sepolia.base.org',
    chainId: 84532,
    name: 'Base Sepolia Testnet'
  }
};

// 合约 ABI（简化版，完整版需要编译）
const CONTRACT_ABI = [
  "constructor(address _platformWallet)",
  "function createOrder(bytes32 _orderId, address _seller, uint256 _amount) external",
  "function payOrder(bytes32 _orderId) external",
  "function confirmDelivery(bytes32 _orderId) external",
  "function markDelivered(bytes32 _orderId) external",
  "function refund(bytes32 _orderId) external",
  "function orders(bytes32) view returns (address buyer, address seller, uint256 amount, uint256 fee, bool isPaid, bool isDelivered, bool isRefunded)",
  "event OrderCreated(bytes32 indexed orderId, address indexed buyer, address indexed seller, uint256 amount)",
  "event PaymentReceived(bytes32 indexed orderId, uint256 amount, uint256 fee)"
];

// 部署合约
async function deployContract(network = 'baseSepolia') {
  const config = CONFIG[network];
  
  console.log(`🚀 部署到 ${config.name}...`);
  console.log(`🔗 RPC: ${config.rpc}`);
  
  // 需要设置环境变量 PRIVATE_KEY
  const privateKey = process.env.DEPLOYER_PRIVATE_KEY;
  if (!privateKey) {
    console.error('❌ 错误: 请设置 DEPLOYER_PRIVATE_KEY 环境变量');
    process.exit(1);
  }
  
  // 平台钱包地址（收手续费）
  const platformWallet = process.env.PLATFORM_WALLET;
  if (!platformWallet) {
    console.error('❌ 错误: 请设置 PLATFORM_WALLET 环境变量');
    process.exit(1);
  }
  
  const provider = new ethers.JsonRpcProvider(config.rpc);
  const wallet = new ethers.Wallet(privateKey, provider);
  
  console.log(`👤 部署地址: ${wallet.address}`);
  
  // 检查余额
  const balance = await provider.getBalance(wallet.address);
  console.log(`💰 余额: ${ethers.formatEther(balance)} ETH`);
  
  if (balance === 0n) {
    console.error('❌ 错误: 余额不足，请先充值 ETH');
    process.exit(1);
  }
  
  // 这里需要合约字节码（需要编译 Solidity）
  // 简化示例，实际需要 hardhat/forge 编译
  console.log('⚠️  注意: 需要编译后的合约字节码才能部署');
  console.log('📋 部署参数:');
  console.log(`   - Platform Wallet: ${platformWallet}`);
  console.log(`   - Network: ${config.name}`);
  
  return {
    network: config.name,
    deployer: wallet.address,
    platformWallet
  };
}

// 验证合约（部署后）
async function verifyContract(contractAddress, network = 'baseSepolia') {
  console.log(`🔍 验证合约 ${contractAddress}...`);
  console.log('📋 验证参数:');
  console.log(`   - 合约地址: ${contractAddress}`);
  console.log(`   - 网络: ${network}`);
  console.log(`   - 平台钱包: ${process.env.PLATFORM_WALLET}`);
  
  // 实际验证需要通过 Basescan API
  console.log('⚠️  请访问 Basescan 手动验证或使用 hardhat-verify');
}

// 主函数
async function main() {
  const command = process.argv[2];
  const network = process.argv[3] || 'baseSepolia';
  
  switch (command) {
    case 'deploy':
      await deployContract(network);
      break;
    case 'verify':
      const contractAddress = process.argv[4];
      if (!contractAddress) {
        console.error('❌ 错误: 请提供合约地址');
        process.exit(1);
      }
      await verifyContract(contractAddress, network);
      break;
    default:
      console.log('用法:');
      console.log('  node deploy.js deploy [network]     - 部署合约');
      console.log('  node deploy.js verify [network] [address] - 验证合约');
      console.log('');
      console.log('环境变量:');
      console.log('  DEPLOYER_PRIVATE_KEY - 部署者私钥');
      console.log('  PLATFORM_WALLET      - 平台收款钱包');
  }
}

main().catch(console.error);
