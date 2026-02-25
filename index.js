const tls = require('tls');
const WebSocket = require('ws');

const POOL_HOST = 'dash.viabtc.top';
const POOL_PORT = 443; 
const PORT = process.env.PORT || 10000;

const wss = new WebSocket.Server({ port: PORT }, () => {
    console.log(`SECURE_VIA_BRIDGE_ONLINE_${PORT}`);
});

wss.on('connection', (ws) => {
    // Encrypted connection to ViaBTC
    const pool = tls.connect(POOL_PORT, POOL_HOST, { rejectUnauthorized: false }, () => {
        console.log('VIA_SECURE_LINK_LOCKED');
    });

    ws.on('message', (msg) => {
        if (!pool.destroyed) pool.write(msg + '\n');
    });

    pool.on('data', (data) => {
        if (ws.readyState === WebSocket.OPEN) ws.send(data.toString());
    });

    ws.on('close', () => pool.destroy());
    pool.on('error', () => pool.destroy());
});
