const tls = require('tls');
const WebSocket = require('ws');

const POOL_HOST = 'dash.viabtc.top';
const POOL_PORT = 443; 
const PORT = process.env.PORT || 10000;

const wss = new WebSocket.Server({ port: PORT });

wss.on('connection', (ws) => {
    // Open a raw SSL tunnel to ViaBTC
    const pool = tls.connect(POOL_PORT, POOL_HOST, { rejectUnauthorized: false });

    pool.on('data', (chunk) => {
        // Send RAW data immediately to your iPhone
        if (ws.readyState === WebSocket.OPEN) {
            ws.send(chunk.toString('utf8'));
        }
    });

    ws.on('message', (msg) => {
        // Push your iPhone's requests directly into the pool
        if (!pool.destroyed) pool.write(msg + '\n');
    });

    pool.on('error', (err) => console.log("Pool Sync Error: ", err));
    ws.on('close', () => pool.destroy());
});
