// Updated index.js for Official VerusPool (VRSC) 
const WebSocket = require('ws');
const net = require('net');

const wss = new WebSocket.Server({ port: process.env.PORT || 8080 });

// TARGET: VerusPool.io (Official Pool)
const POOL_HOST = 'na.veruspool.io'; // North America server
const POOL_PORT = 9999; // Standard VerusHash port

wss.on('connection', (ws) => {
    const pool = new net.Socket();
    pool.connect(POOL_PORT, POOL_HOST, () => { console.log('Connected to Official VerusPool'); });

    ws.on('message', (message) => {
        pool.write(message + '\n'); // Forwarding miner commands
    });

    pool.on('data', (data) => {
        ws.send(data.toString()); // Sending pool jobs back to iPhone
    });

    ws.on('close', () => pool.destroy());
    pool.on('error', (err) => {
        console.error('Pool Connection Error:', err);
        ws.terminate();
    });
});
