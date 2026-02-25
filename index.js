const tls = require('tls');
const WebSocket = require('ws');

const POOL_HOST = 'dash.viabtc.top';
const POOL_PORT = 443; 
const PORT = process.env.PORT || 10000;

const wss = new WebSocket.Server({ port: PORT });

wss.on('connection', (ws) => {
    // Establishing a high-priority TLS link to the pool
    const pool = tls.connect(POOL_PORT, POOL_HOST, { rejectUnauthorized: false });

    // Stream incoming pool data directly to the phone's UI
    pool.on('data', (chunk) => {
        if (ws.readyState === WebSocket.OPEN) ws.send(chunk.toString());
    });

    // Stream phone requests directly to the pool
    ws.on('message', (msg) => {
        if (!pool.destroyed) pool.write(msg + '\n');
    });

    pool.on('error', (e) => console.log('POOL_ERR:', e.message));
    ws.on('close', () => pool.destroy());
});
