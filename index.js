const WebSocket = require('ws');
const net = require('net');

const PORT = process.env.PORT || 10000;
const wss = new WebSocket.Server({ port: PORT });

// SWITCHING TO LUCKPOOL (STILL MINES VERUS COIN)
// Luckpool is much more stable for proxy connections
const POOL_HOST = 'na.luckpool.net'; 
const POOL_PORT = 3956; 

wss.on('connection', (ws) => {
    const pool = new net.Socket();
    
    pool.connect(POOL_PORT, POOL_HOST, () => {
        console.log('--- CONNECTED TO LUCKPOOL (VERUS) ---');
    });

    ws.on('message', (message) => {
        if (pool.writable) pool.write(message + '\n');
    });

    pool.on('data', (data) => {
        if (ws.readyState === WebSocket.OPEN) ws.send(data.toString());
    });

    pool.on('error', (err) => {
        console.log('POOL_ERROR:', err.message);
    });

    ws.on('close', () => pool.destroy());
});
