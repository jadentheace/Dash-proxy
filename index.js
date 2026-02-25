const WebSocket = require('ws');
const net = require('net');

const wss = new WebSocket.Server({ port: process.env.PORT || 8080 });
const POOL_HOST = 'mining-dutch.nl';
const POOL_PORT = 3533; 

wss.on('connection', (ws) => {
    const pool = new net.Socket();
    console.log('TUNNEL: Requesting connection to Pool...');

    pool.connect(POOL_PORT, POOL_HOST, () => {
        console.log('TUNNEL: Pool Connection Established.');
    });

    ws.on('message', (message) => {
        // Fix: Ensure every message sent to the pool ends with exactly one newline
        const cleanMsg = message.toString().trim();
        pool.write(cleanMsg + '\n');
    });

    pool.on('data', (data) => {
        // Fix: Send raw pool data back to the phone
        ws.send(data.toString());
    });

    pool.on('error', (err) => {
        console.log('Pool Error: ' + err.message);
        ws.close();
    });

    ws.on('close', () => {
        pool.destroy();
    });
});
