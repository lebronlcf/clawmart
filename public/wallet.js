// Wallet Connection Module
class WalletManager {
  constructor() {
    this.provider = null;
    this.signer = null;
    this.address = null;
    this.chainId = null;
  }

  // 检测安装的钱包
  detectWallets() {
    const wallets = [];
    
    if (window.ethereum) {
      if (window.ethereum.isMetaMask) wallets.push('metamask');
      if (window.ethereum.isOkxWallet) wallets.push('okx');
      if (window.ethereum.isCoinbaseWallet) wallets.push('coinbase');
      if (!window.ethereum.isMetaMask && !window.ethereum.isOkxWallet) {
        wallets.push('generic');
      }
    }
    
    return wallets;
  }

  // 连接 MetaMask
  async connectMetaMask() {
    if (!window.ethereum || !window.ethereum.isMetaMask) {
      window.open('https://metamask.io/download/', '_blank');
      throw new Error('Please install MetaMask');
    }
    
    return this.connectProvider(window.ethereum);
  }

  // 连接 OKX Wallet
  async connectOKX() {
    if (!window.okxwallet) {
      window.open('https://www.okx.com/web3', '_blank');
      throw new Error('Please install OKX Wallet');
    }
    
    return this.connectProvider(window.okxwallet);
  }

  // 连接 Coinbase Wallet
  async connectCoinbase() {
    if (!window.ethereum || !window.ethereum.isCoinbaseWallet) {
      window.open('https://www.coinbase.com/wallet', '_blank');
      throw new Error('Please install Coinbase Wallet');
    }
    
    return this.connectProvider(window.ethereum);
  }

  // 通用连接
  async connectProvider(provider) {
    try {
      // 请求连接
      const accounts = await provider.request({ method: 'eth_requestAccounts' });
      this.address = accounts[0];
      
      // 获取链 ID
      const chainId = await provider.request({ method: 'eth_chainId' });
      this.chainId = parseInt(chainId, 16);
      
      this.provider = provider;
      
      // 监听账户变化
      provider.on('accountsChanged', (accounts) => {
        if (accounts.length === 0) {
          this.disconnect();
        } else {
          this.address = accounts[0];
          this.updateUI();
        }
      });
      
      // 监听链变化
      provider.on('chainChanged', (chainId) => {
        window.location.reload();
      });
      
      this.updateUI();
      return { address: this.address, chainId: this.chainId };
      
    } catch (err) {
      throw new Error(err.message || 'Failed to connect wallet');
    }
  }

  // 断开连接
  disconnect() {
    this.provider = null;
    this.signer = null;
    this.address = null;
    this.chainId = null;
    this.updateUI();
  }

  // 更新 UI
  updateUI() {
    const connectBtn = document.getElementById('connect-wallet-btn');
    if (connectBtn) {
      if (this.address) {
        connectBtn.textContent = `${this.address.slice(0, 6)}...${this.address.slice(-4)}`;
        connectBtn.classList.add('connected');
      } else {
        connectBtn.textContent = 'Connect Wallet';
        connectBtn.classList.remove('connected');
      }
    }
  }

  // 检查是否已连接
  async checkConnection() {
    if (window.ethereum) {
      const accounts = await window.ethereum.request({ method: 'eth_accounts' });
      if (accounts.length > 0) {
        this.address = accounts[0];
        this.provider = window.ethereum;
        const chainId = await window.ethereum.request({ method: 'eth_chainId' });
        this.chainId = parseInt(chainId, 16);
        this.updateUI();
        return true;
      }
    }
    return false;
  }
}

// 全局钱包管理器
window.walletManager = new WalletManager();

// 连接钱包弹窗
function showWalletModal() {
  const modal = document.createElement('div');
  modal.id = 'wallet-modal';
  modal.innerHTML = `
    <div class="modal-overlay" onclick="closeWalletModal()">
      <div class="modal-content" onclick="event.stopPropagation()">
        <h3>Connect Wallet</h3>
        <div class="wallet-options">
          <button class="wallet-btn" onclick="connectMetaMask()">
            <span class="wallet-icon">🦊</span>
            <span>MetaMask</span>
          </button>
          <button class="wallet-btn" onclick="connectOKX()">
            <span class="wallet-icon">🔵</span>
            <span>OKX Wallet</span>
          </button>
          <button class="wallet-btn" onclick="connectCoinbase()">
            <span class="wallet-icon">🔷</span>
            <span>Coinbase</span>
          </button>
          <button class="wallet-btn" onclick="connectAgentWallet()">
            <span class="wallet-icon">🤖</span>
            <span>Agent Wallet</span>
          </button>
        </div>
        <button class="close-btn" onclick="closeWalletModal()">✕</button>
      </div>
    </div>
  `;
  
  // 添加样式
  const style = document.createElement('style');
  style.textContent = `
    .modal-overlay {
      position: fixed;
      top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(0,0,0,0.8);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }
    .modal-content {
      background: #1a1a2e;
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 16px;
      padding: 30px;
      max-width: 400px;
      width: 90%;
      position: relative;
    }
    .modal-content h3 {
      margin-bottom: 20px;
      text-align: center;
    }
    .wallet-options {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .wallet-btn {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 16px;
      background: rgba(255,255,255,0.05);
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 12px;
      color: #fff;
      cursor: pointer;
      transition: all 0.3s;
    }
    .wallet-btn:hover {
      background: rgba(0,212,170,0.1);
      border-color: #00d4aa;
    }
    .wallet-icon {
      font-size: 24px;
    }
    .close-btn {
      position: absolute;
      top: 15px;
      right: 15px;
      background: none;
      border: none;
      color: rgba(255,255,255,0.5);
      font-size: 20px;
      cursor: pointer;
    }
  `;
  
  document.head.appendChild(style);
  document.body.appendChild(modal);
}

function closeWalletModal() {
  const modal = document.getElementById('wallet-modal');
  if (modal) modal.remove();
}

async function connectMetaMask() {
  try {
    await walletManager.connectMetaMask();
    closeWalletModal();
    alert('Wallet connected: ' + walletManager.address);
  } catch (err) {
    alert(err.message);
  }
}

async function connectOKX() {
  try {
    await walletManager.connectOKX();
    closeWalletModal();
    alert('Wallet connected: ' + walletManager.address);
  } catch (err) {
    alert(err.message);
  }
}

async function connectCoinbase() {
  try {
    await walletManager.connectCoinbase();
    closeWalletModal();
    alert('Wallet connected: ' + walletManager.address);
  } catch (err) {
    alert(err.message);
  }
}

async function connectAgentWallet() {
  alert('Agent Wallet integration coming soon! Support for autonomous agent transactions.');
}

// 页面加载时检查连接
window.addEventListener('load', () => {
  walletManager.checkConnection();
});
