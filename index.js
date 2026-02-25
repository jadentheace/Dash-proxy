const tls = require('tls');
const WebSocket = require('ws');

const POOL_HOST = 'dash.viabtc.top';
const POOL_PORT = 443; 
const PORT = process.env.PORT || 10000;

const wss = new WebSocket.Server({ port: PORT });

wss.on('connection', (ws) => {
    // Connect to ViaBTC via SSL
    const pool = tls.connect(POOL_PORT, POOL_HOST, { rejectUnauthorized: false });

    // Stream REAL data from pool to iPhone
    pool.on('data', (chunk) => {
        if (ws.readyState === WebSocket.OPEN) ws.send(chunk);
    });

    // Stream REAL data from iPhone to pool
    ws.on('message', (data) => {
        if (!pool.destroyed) pool.write(data);
    });

    pool.on('error', () => pool.destroy());
    ws.on('close', () => pool.destroy());
});
