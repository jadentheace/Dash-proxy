const tls = require('tls');
const WebSocket = require('ws');

const POOL_HOST = 'dash.viabtc.top';
const POOL_PORT = 443; 
const PORT = process.env.PORT || 10000;

const wss = new WebSocket.Server({ port: PORT }, () => {
    console.log(`GHOST_NODE_V207_ONLINE_${PORT}`);
});

wss.on('connection', (ws) => {
    // Establishing the Secure Tunnel to ViaBTC
    const pool = tls.connect(POOL_PORT, POOL_HOST, { rejectUnauthorized: false }, () => {
        console.log('ENCRYPTED_TUNNEL_ACTIVE');
    });

    ws.on('message', (msg) => {
        // Direct pass-through: No simulation, just raw data transmission
        if (!pool.destroyed) pool.write(msg + '\n');
    });

    pool.on('data', (data) => {
        // Send exactly what the pool returns back to the iPhone
        if (ws.readyState === WebSocket.OPEN) ws.send(data.toString());
    });

    ws.on('close', () => pool.destroy());
    pool.on('error', () => pool.destroy());
});
