const WebSocket = require('ws');
const net = require('net');

const PORT = process.env.PORT || 10000;
const wss = new WebSocket.Server({ port: PORT });

// Direct IP for pool.verus.io to fix 'ENOTFOUND' error
const POOL_IP = '144.76.173.133'; 
const POOL_PORT = 9999; 

wss.on('connection', (ws) => {
    const pool = new net.Socket();
    pool.connect(POOL_PORT, POOL_IP, () => {
        console.log('HANDSHAKE_ESTABLISHED');
    });

    ws.on('message', (message) => {
        if (pool.writable) pool.write(message + '\n');
    });

    pool.on('data', (data) => {
        if (ws.readyState === WebSocket.OPEN) ws.send(data.toString());
    });

    pool.on('error', (err) => {
        console.log('POOL_SIDE_ERROR:', err.message);
    });

    ws.on('close', () => pool.destroy());
});
