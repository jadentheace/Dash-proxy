const tls = require('tls');
const WebSocket = require('ws');

const POOL_HOST = 'dash.viabtc.top';
const POOL_PORT = 443; 
const PORT = process.env.PORT || 10000;

const wss = new WebSocket.Server({ port: PORT });

wss.on('connection', (ws) => {
    const pool = tls.connect(POOL_PORT, POOL_HOST, { rejectUnauthorized: false });

    pool.on('data', (data) => {
        if (ws.readyState === WebSocket.OPEN) ws.send(data.toString());
    });

    ws.on('message', (msg) => {
        if (!pool.destroyed) pool.write(msg + "\n");
    });

    pool.on('error', (e) => console.log("Pool Error:", e.message));
    ws.on('close', () => pool.destroy());
});
