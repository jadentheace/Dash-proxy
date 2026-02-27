const WebSocket = require('ws');
const tls = require('tls');

// Target: ViaBTC (Best for mobile Dash mining)
const POOL = { host: 'dash.viabtc.top', port: 443 }; 
const WALLET = "Xxo7XaZhnnkHz55mYSdQuGj93MWD3Bhcu1";

const wss = new WebSocket.Server({ port: process.env.PORT || 8080 });

wss.on('connection', (ws) => {
    console.log('--- [!] IPHONE_ENTRY_DETECTED ---');
    
    // Connect to ViaBTC via SSL
    const stratum = tls.connect(POOL.port, POOL.host, { rejectUnauthorized: false }, () => {
        console.log('--- [SUCCESS] VIABTC_SSL_LINK_OPEN ---');
        
        // Login immediately with your wallet
        const sub = JSON.stringify({"id":1,"method":"mining.subscribe","params":[]}) + '\n';
        const auth = JSON.stringify({"id":2,"method":"mining.authorize","params":[WALLET + ".i14", "x"]}) + '\n';
        
        stratum.write(sub);
        stratum.write(auth);
    });

    stratum.on('data', (chunk) => {
        const data = chunk.toString();
        if (data.includes("mining.notify")) {
            console.log('--- [JOB] VIABTC_JOB_INBOUND ---');
        }
        if (ws.readyState === WebSocket.OPEN) ws.send(data);
    });

    ws.on('message', (msg) => {
        if (stratum.writable) stratum.write(msg.toString().trim() + '\n');
    });

    stratum.on('error', (e) => console.log('POOL_ERR:', e.message));
    stratum.on('close', () => ws.close());
    ws.on('close', () => stratum.destroy());
});

console.log('VIABTC_V35_MASTER_ACTIVE');
