const WebSocket = require('ws');
const net = require('net');

// SWITCHING TO EMCD (More mobile-friendly for Dash)
const POOL = { host: 'gate.emcd.io', port: 3333 }; 
const wss = new WebSocket.Server({ port: process.env.PORT || 8080 });

wss.on('connection', (ws) => {
    console.log('--- MOBILE_UPLINK_ESTABLISHED ---');
    const stratum = new net.Socket();
    stratum.setKeepAlive(true, 5000);

    stratum.connect(POOL.port, POOL.host, () => {
        console.log(`--- CONNECTED_TO_POOL: ${POOL.host} ---`);
    });

    ws.on('message', (msg) => {
        if (stratum.writable) stratum.write(msg.toString().trim() + '\n');
    });

    stratum.on('data', (chunk) => {
        if (ws.readyState === WebSocket.OPEN) ws.send(chunk.toString());
    });

    stratum.on('error', (e) => console.log('POOL_CONNECTION_ERROR:', e.message));
    stratum.on('close', () => ws.close());
    ws.on('close', () => stratum.destroy());
});
console.log('REBUILD_V32_UNIVERSAL_PROXY_ACTIVE');
