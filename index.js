const WebSocket = require('ws');
const net = require('net');

const wss = new WebSocket.Server({ port: 10000 });
const POOL_HOST = 'mining-dutch.nl';
const POOL_PORT = 3533; // DASH (X11) specific port

wss.on('connection', (ws) => {
    console.log('iPhone Worker Connected');
    const pool = new net.Socket();

    pool.connect(POOL_PORT, POOL_HOST, () => {
        console.log('Tunnel Open to Mining-Dutch');
    });

    ws.on('message', (message) => {
        pool.write(message + '\n');
    });

    pool.on('data', (data) => {
        ws.send(data.toString());
    });

    pool.on('error', (err) => console.log('Pool Error:', err));
    ws.on('close', () => pool.destroy());
});
