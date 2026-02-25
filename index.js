const WebSocket = require('ws');
const net = require('net');

const PORT = process.env.PORT || 10000;
const wss = new WebSocket.Server({ port: PORT });

const POOL_HOST = 'mining-dutch.nl';
const POOL_PORT = 3533; 

wss.on('connection', (ws) => {
    const pool = new net.Socket();
    pool.setKeepAlive(true, 10000);

    pool.connect(POOL_PORT, POOL_HOST, () => {
        console.log('TCP: Connected to Netherlands');
    });

    ws.on('message', (msg) => {
        // Cleaning the message to ensure no double-newlines
        pool.write(msg.trim() + '\n');
    });

    pool.on('data', (data) => {
        if (ws.readyState === WebSocket.OPEN) {
            ws.send(data.toString());
        }
    });

    ws.on('close', () => pool.destroy());
    pool.on('error', () => ws.close());
});
