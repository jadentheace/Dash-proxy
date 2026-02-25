const WebSocket = require('ws');
const net = require('net');

const wss = new WebSocket.Server({ port: 10000 }); // Render uses 10000
const POOL_HOST = 'mining-dutch.nl';
const POOL_PORT = 3533; // DASH (X11) specific port

wss.on('connection', (ws) => {
    console.log('iPhone Link Established');
    const pool = new net.Socket();

    pool.connect(POOL_PORT, POOL_HOST, () => {
        console.log('Bridge connected to Mining-Dutch TCP');
    });

    ws.on('message', (message) => {
        // Sends your authentication to the pool
        pool.write(message + '\n');
    });

    pool.on('data', (data) => {
        // Sends the pool's "Result: True" back to your phone
        ws.send(data.toString());
    });

    pool.on('error', (err) => console.log('Bridge Error:', err));
    ws.on('close', () => pool.destroy());
});
