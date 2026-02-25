const WebSocket = require('ws');
const net = require('net');

const wss = new WebSocket.Server({ port: 10000 }); // Render port
const POOL_HOST = 'mining-dutch.nl';
const POOL_PORT = 3533; // Specific DASH X11 Port

wss.on('connection', (ws) => {
    console.log('iPhone Worker Linked');
    const pool = new net.Socket();

    pool.connect(POOL_PORT, POOL_HOST, () => {
        console.log('Connected to Mining-Dutch TCP');
    });

    ws.on('message', (message) => {
        pool.write(message + '\n'); // Forwards your AUTH to pool
    });

    pool.on('data', (data) => {
        ws.send(data.toString()); // Forwards Pool REPLY to phone
    });

    pool.on('error', (err) => console.log('Pool Error:', err));
    ws.on('close', () => pool.destroy());
});
