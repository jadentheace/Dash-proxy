const WebSocket = require('ws');
const tls = require('tls');

// ViaBTC Dash Global SSL Endpoint
const POOL = { host: 'dash.viabtc.top', port: 443 }; 
const WALLET = "Xxo7XaZhnnkHz55mYSdQuGj93MWD3Bhcu1";

const wss = new WebSocket.Server({ port: process.env.PORT || 8080 });

wss.on('connection', (ws) => {
    console.log('--- [SIGNAL] IPHONE_14_CONNECTED ---');
    
    // Establishing the Encrypted Link
    const stratum = tls.connect(POOL.port, POOL.host, { rejectUnauthorized: false }, () => {
        console.log('--- [SUCCESS] VIABTC_SSL_TUNNEL_ACTIVE ---');
        
        // IMMEDIATE LOGIN: Forces the pool to send jobs immediately
        const sub = JSON.stringify({"id":1,"method":"mining.subscribe","params":["i14_v37"]}) + '\n';
        const auth = JSON.stringify({"id":2,"method":"mining.authorize","params":[WALLET + ".i14", "x"]}) + '\n';
        
        stratum.write(sub);
        stratum.write(auth);
    });

    stratum.on('data', (chunk) => {
        const raw = chunk.toString();
        // If we see mining.notify, the hashrate will start moving on the phone
        if (raw.includes("mining.notify")) {
            console.log('--- [JOB] DATA_FLOW_DETECTION: YES ---');
        }
        if (ws.readyState === WebSocket.OPEN) ws.send(raw);
    });

    ws.on('message', (msg) => {
        if (stratum.writable) stratum.write(msg.toString().trim() + '\n');
    });

    stratum.on('error', (e) => console.log('POOL_BRIDGE_ERR:', e.message));
    stratum.on('close', () => ws.close());
    ws.on('close', () => stratum.destroy());
});

console.log('V37_VIABTC_DASH_STABLE_READY');
