const tls = require('tls');
const WebSocket = require('ws');

const POOL_HOST = 'dash.viabtc.top';
const POOL_PORT = 443; 
const PORT = process.env.PORT || 10000;

const wss = new WebSocket.Server({ port: PORT });

wss.on('connection', (ws) => {
    // Establishing a direct, high-priority SSL pipe
    const pool = tls.connect(POOL_PORT, POOL_HOST, { rejectUnauthorized: false });

    pool.on('data', (data) => {
        if (ws.readyState === WebSocket.OPEN) {
            // Force data to string and send immediately
            ws.send(data.toString('utf-8'));
        }
    });

    ws.on('message', (msg) => {
        if (!pool.destroyed) {
            pool.write(msg + "\n");
        }
    });

    // Auto-cleanup to save server resources
    pool.on('error', () => pool.destroy());
    ws.on('close', () => pool.destroy());
});
