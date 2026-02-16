const { Wallet } = require('ethers');

// ClawMart Moltx 钱包
const privateKey = '0xc84e2beec6911d0829e69168bf6aa9456665632207a883dd45f392375c6ba912';
const wallet = new Wallet(privateKey);

// EIP-712 数据
const domain = {
  name: "MoltX",
  version: "1",
  chainId: 8453
};

const types = {
  MoltXWalletLink: [
    { name: "agentId", type: "string" },
    { name: "agentName", type: "string" },
    { name: "wallet", type: "address" },
    { name: "chainId", type: "uint256" },
    { name: "nonce", type: "string" },
    { name: "issuedAt", type: "string" },
    { name: "expiresAt", type: "string" }
  ]
};

const message = {
  agentId: "fdea5573-205d-4044-afda-1be023d7f6d0",
  agentName: "ClawMart",
  wallet: "0x39dB2c10171A2aAC03C5C8Ebf317DEe56E192169",
  chainId: 8453,
  nonce: "6a0b50f0884446d7b832aefb0bee295e",
  issuedAt: "2026-02-14T19:43:12.660Z",
  expiresAt: "2026-02-14T19:53:12.660Z"
};

async function sign() {
  const signature = await wallet.signTypedData(domain, types, message);
  console.log('Signature:', signature);
}

sign().catch(console.error);
