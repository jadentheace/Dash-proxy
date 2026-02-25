const net = require('net');
const WebSocket = require('ws');

const POOL_HOST = 'dash.viabtc.top';
const POOL_PORT = 3333; // Standard Raw Stratum Port
const PORT = process.env.PORT || 10000;

const wss = new WebSocket.Server({ port: PORT });

wss.on('connection', (ws) => {
    // Switching to a RAW TCP socket (No SSL interference)
    const pool = net.connect(POOL_PORT, POOL_HOST);

    pool.on('data', (data) => {
        if (ws.readyState === WebSocket.OPEN) {
            ws.send(data.toString());
        }
    });

    ws.on('message', (msg) => {
        if (!pool.destroyed) pool.write(msg + "\n");
    });

    pool.on('error', () => pool.destroy());
    ws.on('close', () => pool.destroy());
});
