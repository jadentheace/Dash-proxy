const WebSocket = require('ws');
const net = require('net');

const wss = new WebSocket.Server({ port: 443 });
const POOL_HOST = 'mining-dutch.nl';
const POOL_PORT = 3533; // DASH X11 Port

wss.on('connection', (ws) => {
    console.log('iPhone connected to Bridge');
    const pool = new net.Socket();

    pool.connect(POOL_PORT, POOL_HOST, () => {
        console.log('Bridge connected to Mining-Dutch');
    });

    // Send data from Phone -> Pool
    ws.on('message', (message) => {
        pool.write(message + '\n');
    });

    // Send data from Pool -> Phone
    pool.on('data', (data) => {
        ws.send(data.toString());
    });

    pool.on('error', (err) => console.log('Pool Error:', err));
    ws.on('close', () => pool.destroy());
});
