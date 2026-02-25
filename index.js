const WebSocket = require('ws');
const net = require('net');

const wss = new WebSocket.Server({ port: process.env.PORT || 8080 });

// TARGET: Official VerusPool.io
const POOL_HOST = 'na.veruspool.io';
const POOL_PORT = 9999; 

wss.on('connection', (ws) => {
    const pool = new net.Socket();
    
    pool.connect(POOL_PORT, POOL_HOST, () => {
        console.log('Connected to VerusPool Official');
    });

    // Pass iPhone commands to Pool
    ws.on('message', (message) => {
        if (pool.writable) {
            pool.write(message + '\n');
        }
    });

    // Pass Pool jobs back to iPhone
    pool.on('data', (data) => {
        ws.send(data.toString());
    });

    // Hard-Sync: Prevents connection drops
    const ping = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify({type: "ping"}));
    }, 25000);

    ws.on('close', () => { clearInterval(ping); pool.destroy(); });
    pool.on('error', () => ws.terminate());
});
