const WebSocket = require('ws');
const net = require('net');

// Matches the port Render is forcing in your logs
const port = process.env.PORT || 10000; 
const wss = new WebSocket.Server({ port: port });

const POOL_HOST = 'na.veruspool.io';
const POOL_PORT = 9999; 

wss.on('connection', (ws) => {
    const pool = new net.Socket();
    
    pool.connect(POOL_PORT, POOL_HOST, () => {
        console.log('CONNECTED_TO_VERUS_POOL');
    });

    ws.on('message', (message) => {
        // THE FIX: Adding the newline '\n' ensures the pool reads the command
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
        console.log('POOL_ERROR:', err.message);
        setTimeout(() => pool.connect(POOL_PORT, POOL_HOST), 2000);
    });

    ws.on('close', () => pool.destroy());
});
