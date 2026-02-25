const WebSocket = require('ws');
const net = require('net');

const wss = new WebSocket.Server({ port: process.env.PORT || 8080 });
const POOL_HOST = 'na.veruspool.io';
const POOL_PORT = 9999; 

wss.on('connection', (ws) => {
    console.log('--- IPHONE 14 LINK ACTIVE ---');
    const pool = new net.Socket();
    pool.setKeepAlive(true, 5000); // Forces the link to stay alive

    pool.connect(POOL_PORT, POOL_HOST, () => {
        console.log('VERUSPOOL_CONNECTED');
    });

    ws.on('message', (message) => {
        // Only forward if the pool connection is ready
        if (pool.writable) {
            pool.write(message + '\n');
        }
    });

    pool.on('data', (data) => {
        if (ws.readyState === WebSocket.OPEN) {
            ws.send(data.toString());
        }
    });

    pool.on('error', (err) => {
        console.log('STRATUM_ERROR:', err.message);
        if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({type: "error", msg: "POOL_RECONNECTING"}));
        }
        // Force immediate retry
        setTimeout(() => pool.connect(POOL_PORT, POOL_HOST), 2000);
    });

    ws.on('close', () => {
        pool.destroy();
        console.log('IPHONE_DISCONNECTED');
    });
});
