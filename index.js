const WebSocket = require('ws');
const net = require('net');

const PORT = process.env.PORT || 10000;
const wss = new WebSocket.Server({ port: PORT });

const POOL_HOST = 'mining-dutch.nl';
const POOL_PORT = 3533; 

wss.on('connection', (ws) => {
    const pool = new net.Socket();
    pool.setKeepAlive(true, 5000); // Keeps the A16 link from timing out

    pool.connect(POOL_PORT, POOL_HOST, () => {
        console.log('HANDSHAKE: Connected to Netherlands');
    });

    ws.on('message', (msg) => {
        // We trim and add a formal newline to match Stratum requirements
        pool.write(msg.toString().trim() + '\n');
    });

    pool.on('data', (data) => {
        // Forward pool data back to the iPhone log
        if (ws.readyState === WebSocket.OPEN) {
            ws.send(data.toString());
        }
    });

    ws.on('close', () => pool.destroy());
    pool.on('error', () => ws.close());
});
