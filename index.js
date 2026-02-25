const tls = require('tls');
const WebSocket = require('ws');

const POOL_HOST = 'dash.viabtc.top';
const POOL_PORT = 443; 
const PORT = process.env.PORT || 10000;

const wss = new WebSocket.Server({ port: PORT }, () => {
    console.log(`DIAGNOSTIC_MODE_V213_ON_PORT_${PORT}`);
});

wss.on('connection', (ws) => {
    const pool = tls.connect(POOL_PORT, POOL_HOST, { rejectUnauthorized: false }, () => {
        console.log('--- CONNECTED_TO_VIABTC_SSL ---');
    });

    ws.on('message', (msg) => {
        console.log('IPHONE_SENT:', msg.toString().trim());
        if (!pool.destroyed) pool.write(msg + '\n');
    });

    pool.on('data', (data) => {
        // THIS IS THE KEY: We are going to see exactly why it fails
        console.log('POOL_REPLY:', data.toString().trim());
        if (ws.readyState === WebSocket.OPEN) ws.send(data.toString());
    });

    ws.on('close', () => { console.log('IPHONE_DISCONNECTED'); pool.destroy(); });
    pool.on('error', (e) => console.log('POOL_CONNECTION_ERROR:', e.message));
});
