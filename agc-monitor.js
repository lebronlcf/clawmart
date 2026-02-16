// AGC 挖矿监控脚本 - 正确获取官网数据
const https = require('https');

const AGENTMINER_SITE = 'www.agentminer.site';
const AGENTMINER_URL = 'https://www.agentminer.site/';

async function fetchAGCData() {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: AGENTMINER_SITE,
      port: 443,
      path: '/',
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      timeout: 10000
    };

    const req = https.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          // 从 HTML 中提取 MINED 数据
          const minedMatch = data.match(/MINED:\s*([\d,]+)\s*\/\s*1B/i);
          const priceMatch = data.match(/PRICE:\s*([\d.]+)\s*BNB/i);
          const rewardMatch = data.match(/REWARD:\s*([\d,]+)\s*AGC/i);
          
          const result = {
            mined: minedMatch ? minedMatch[1].replace(/,/g, '') : '0',
            total: '1000000000',
            price: priceMatch ? priceMatch[1] : '0.005',
            reward: rewardMatch ? rewardMatch[2] : '25000',
            url: AGENTMINER_URL,
            timestamp: new Date().toISOString()
          };
          
          resolve(result);
        } catch (e) {
          reject(new Error('解析数据失败: ' + e.message));
        }
      });
    });

    req.on('error', (e) => {
      reject(new Error('请求失败: ' + e.message));
    });

    req.on('timeout', () => {
      req.destroy();
      reject(new Error('请求超时'));
    });

    req.end();
  });
}

async function checkAndReport() {
  console.log('⏳ 等待 5 分钟获取最新数据...');
  console.log(`🌐 官网: ${AGENTMINER_URL}`);
  
  // 等待 5 分钟
  await new Promise(resolve => setTimeout(resolve, 5 * 60 * 1000));
  
  try {
    console.log('📡 正在获取 AGC 挖矿数据...');
    const data = await fetchAGCData();
    
    const minedNum = parseInt(data.mined);
    const totalNum = parseInt(data.total);
    const percent = ((minedNum / totalNum) * 100).toFixed(2);
    
    console.log('\n' + '='.repeat(60));
    console.log('⛏️  AGC 挖矿监控报告');
    console.log('='.repeat(60));
    console.log(`🌐 官网链接: ${data.url}`);
    console.log(`⏰ 检查时间: ${new Date().toLocaleString()}`);
    console.log('');
    console.log(`📊 挖矿进度: ${data.mined} / ${data.total} (${percent}%)`);
    console.log(`💰 挖矿价格: ${data.price} BNB`);
    console.log(`🎁 单次奖励: ${data.reward} AGC`);
    console.log('');
    
    // 检查是否超过 1 亿
    if (minedNum >= 100000000) {
      console.log('🚨 提醒: 挖矿量已超过 1 亿！');
      console.log('💡 建议: 充值 BNB 继续挖矿');
    } else {
      const remaining = 100000000 - minedNum;
      console.log(`✅ 距离 1 亿阈值还有: ${remaining.toLocaleString()} AGC`);
      console.log('⏳ 暂不需要充值 BNB');
    }
    
    console.log('='.repeat(60));
    
    return data;
  } catch (e) {
    console.error('❌ 获取数据失败:', e.message);
    console.log(`🌐 请手动访问: ${AGENTMINER_URL}`);
    return null;
  }
}

// 执行检查
checkAndReport().then(data => {
  if (data) {
    console.log('\n✅ 检查完成');
    process.exit(0);
  } else {
    console.log('\n⚠️  检查失败');
    process.exit(1);
  }
}).catch(e => {
  console.error('❌ 错误:', e);
  process.exit(1);
});
