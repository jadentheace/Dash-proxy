const WebSocket = require('ws');
const net = require('net');

const wss = new WebSocket.Server({ port: 10000 }); // Render uses port 10000 internally
const POOL_HOST = 'mining-dutch.nl';
const POOL_PORT = 3533; // DASH X11 Port

wss.on('connection', (ws) => {
    console.log('iPhone Link Established');
    const pool = new net.Socket();

    pool.connect(POOL_PORT, POOL_HOST, () => {
        console.log('Connected to Mining-Dutch TCP');
    });

    ws.on('message', (message) => {
        // Forwards your Phone's AUTH to the Pool
        pool.write(message + '\n');
    });

    pool.on('data', (data) => {
        // Forwards the Pool's VALIDATION back to your Phone
        ws.send(data.toString());
    });

    pool.on('error', (err) => console.log('Bridge Error:', err));
    ws.on('close', () => pool.destroy());
});
