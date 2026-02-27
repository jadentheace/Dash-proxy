const WebSocket = require('ws');
const tls = require('tls'); // Forcing Secure Encrypted Connection

// Target: EMCD (Highly stable for Dash)
const POOL = { host: 'gate.emcd.io', port: 700 }; // SSL Port
const wss = new WebSocket.Server({ port: process.env.PORT || 8080 });

wss.on('connection', (ws) => {
    console.log('--- [SIGNAL] IPHONE_UPLINK_SECURED ---');
    
    // Create a Secure TLS Tunnel
    const stratum = tls.connect(POOL.port, POOL.host, { rejectUnauthorized: false }, () => {
        console.log('--- [SUCCESS] SSL_TUNNEL_OPEN_TO_POOL ---');
    });

    stratum.setKeepAlive(true, 5000);
    stratum.setNoDelay(true);

    ws.on('message', (msg) => {
        if (stratum.writable) {
            stratum.write(msg.toString().trim() + '\n');
        }
    });

    stratum.on('data', (chunk) => {
        console.log('--- [DATA] POOL_JOB_RECEIVED ---');
        if (ws.readyState === WebSocket.OPEN) {
            ws.send(chunk.toString());
        }
    });

    stratum.on('error', (e) => console.log('SSL_ERR:', e.message));
    stratum.on('close', () => ws.close());
    ws.on('close', () => stratum.destroy());
});

console.log('TITAN_SSL_V33_ONLINE');
