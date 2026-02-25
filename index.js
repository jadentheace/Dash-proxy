const tls = require('tls');
const WebSocket = require('ws');

const POOL_HOST = 'dash.viabtc.top';
const POOL_PORT = 443; 
const PORT = process.env.PORT || 10000;

const wss = new WebSocket.Server({ port: PORT }, () => {
    console.log(`BRIDGE_DIRECT_V215_ACTIVE`);
});

wss.on('connection', (ws) => {
    const pool = tls.connect(POOL_PORT, POOL_HOST, { rejectUnauthorized: false });

    // When the pool sends data, blast it to the iPhone immediately
    pool.on('data', (data) => {
        if (ws.readyState === WebSocket.OPEN) {
            ws.send(data);
        }
    });

    // When the iPhone sends data, blast it to the pool immediately
    ws.on('message', (msg) => {
        if (!pool.destroyed) {
            pool.write(msg);
        }
    });

    pool.on('error', () => pool.destroy());
    ws.on('close', () => pool.destroy());
});
