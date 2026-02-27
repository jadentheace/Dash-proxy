const WebSocket = require('ws');
const tls = require('tls');

const POOL = { host: 'gate.emcd.io', port: 700 }; // Secure SSL Port
const WALLET = "Xxo7XaZhnnkHz55mYSdQuGj93MWD3Bhcu1";

const wss = new WebSocket.Server({ port: process.env.PORT || 8080 });

wss.on('connection', (ws) => {
    console.log('--- [!] IPHONE_ENTRY_DETECTED ---');
    
    const stratum = tls.connect(POOL.port, POOL.host, { rejectUnauthorized: false }, () => {
        console.log('--- [SUCCESS] SSL_BRIDGE_OPEN ---');
        
        // IMMEDIATE PRE-AUTH: Don't wait for the phone
        const sub = JSON.stringify({"id":1,"method":"mining.subscribe","params":["i14_titan"]}) + '\n';
        const auth = JSON.stringify({"id":2,"method":"mining.authorize","params":[WALLET + ".i14", "x"]}) + '\n';
        
        stratum.write(sub);
        stratum.write(auth);
        console.log('--- [AUTH] PRE-AUTHORIZATION_SENT ---');
    });

    stratum.on('data', (chunk) => {
        const data = chunk.toString();
        if (data.includes("mining.notify")) {
            console.log('--- [JOB] REAL_DATA_FLOWING ---');
        }
        if (ws.readyState === WebSocket.OPEN) ws.send(data);
    });

    ws.on('message', (msg) => {
        if (stratum.writable) stratum.write(msg.toString().trim() + '\n');
    });

    stratum.on('error', (e) => console.log('STRATUM_ERR:', e.message));
    stratum.on('close', () => ws.close());
    ws.on('close', () => stratum.destroy());
});

console.log('TITAN_AUTO_V34_ACTIVE');
