const Stratum = require('coin-hive-stratum');

// This connects your browser to zpool.ca
const proxy = new Stratum({
  host: 'x11.mine.zpool.ca',
  port: 3533,
  key: 'Xxo7XaZhnnkHz55mYSdQuGj93MWD3Bhcu1' // Your Dash Wallet
});

// This starts the bridge on Render's network
const port = process.env.PORT || 3000;
proxy.listen(port);

console.log(`Overlord Proxy running on port ${port}`);