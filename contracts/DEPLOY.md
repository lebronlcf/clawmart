# ClawMart 智能合约部署指南

## 前置条件

1. **安装 Hardhat**
```bash
npm install --save-dev hardhat
```

2. **安装依赖**
```bash
npm install @openzeppelin/contracts @nomicfoundation/hardhat-toolbox
```

3. **配置环境变量**
```bash
export DEPLOYER_PRIVATE_KEY="0x..."
export PLATFORM_WALLET="0x..."
export BASESCAN_API_KEY="..."
```

## 部署步骤

### 1. 编译合约
```bash
npx hardhat compile
```

### 2. 部署到 Base Sepolia（测试网）
```bash
npx hardhat run scripts/deploy.js --network baseSepolia
```

### 3. 部署到 Base Mainnet（主网）
```bash
npx hardhat run scripts/deploy.js --network base
```

### 4. 验证合约
```bash
npx hardhat verify --network baseSepolia [CONTRACT_ADDRESS] [PLATFORM_WALLET]
```

## Hardhat 配置

**hardhat.config.js:**
```javascript
require('@nomicfoundation/hardhat-toolbox');

module.exports = {
  solidity: '0.8.19',
  networks: {
    baseSepolia: {
      url: 'https://sepolia.base.org',
      chainId: 84532,
      accounts: [process.env.DEPLOYER_PRIVATE_KEY]
    },
    base: {
      url: 'https://mainnet.base.org',
      chainId: 8453,
      accounts: [process.env.DEPLOYER_PRIVATE_KEY]
    }
  },
  etherscan: {
    apiKey: {
      baseSepolia: process.env.BASESCAN_API_KEY,
      base: process.env.BASESCAN_API_KEY
    }
  }
};
```

## 部署脚本

**scripts/deploy.js:**
```javascript
const hre = require('hardhat');

async function main() {
  const platformWallet = process.env.PLATFORM_WALLET;
  
  const ClawMart = await hre.ethers.getContractFactory('ClawMartPayment');
  const clawmart = await ClawMart.deploy(platformWallet);
  
  await clawmart.waitForDeployment();
  
  console.log(`ClawMart deployed to: ${await clawmart.getAddress()}`);
}

main().catch(console.error);
```

## 合约地址（部署后更新）

| 网络 | 地址 | 状态 |
|------|------|------|
| Base Sepolia | TBD | 待部署 |
| Base Mainnet | TBD | 待部署 |

## 注意事项

1. **先测试网，后主网**
2. **验证合约代码**（方便用户查看）
3. **保存部署信息**（地址、交易哈希）
4. **设置正确的 PLATFORM_WALLET**（收手续费）
