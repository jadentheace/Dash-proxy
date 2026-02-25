const WebSocket = require('ws');
const net = require('net');

// CRITICAL: Forces Port 10000 as seen in your logs
const port = process.env.PORT || 10000; 
const wss = new WebSocket.Server({ port: port });

const POOL_HOST = 'na.veruspool.io';
const POOL_PORT = 9999; 

wss.on('connection', (ws) => {
    const pool = new net.Socket();
    pool.setKeepAlive(true, 10000);

    pool.connect(POOL_PORT, POOL_HOST, () => {
        console.log('--- LINK ESTABLISHED TO VERUSPOOL ---');
    });

    ws.on('message', (message) => {
        if (pool.writable) pool.write(message + '\n');
    });

    pool.on('data', (data) => {
        if (ws.readyState === WebSocket.OPEN) ws.send(data.toString());
    });

    pool.on('error', () => {
        if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({type: "error", msg: "POOL_RECONNECTING"}));
        }
    });

    ws.on('close', () => pool.destroy());
});
