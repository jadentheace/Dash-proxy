const WebSocket = require('ws');
const net = require('net');

const PORT = process.env.PORT || 10000;
const wss = new WebSocket.Server({ port: PORT });

// Change these to switch pools globally, or let the HTML decide
const DEFAULT_HOST = 'mining-dutch.nl';
const DEFAULT_PORT = 3533; 

wss.on('connection', (ws) => {
    console.log('iPhone connected to Bridge');
    const pool = new net.Socket();
    
    // Safety: don't let the connection hang forever
    pool.setKeepAlive(true, 30000);

    pool.connect(DEFAULT_PORT, DEFAULT_HOST, () => {
        console.log(`Connected to Pool: ${DEFAULT_HOST}:${DEFAULT_PORT}`);
    });

    ws.on('message', (message) => {
        // Forward Phone -> Pool
        pool.write(message + '\n');
    });

    pool.on('data', (data) => {
        // Forward Pool -> Phone (This populates your log)
        ws.send(data.toString());
    });

    pool.on('error', (err) => {
        console.error('Pool Error:', err.message);
        ws.send(JSON.stringify({error: "Pool Connection Failed"}));
    });

    ws.on('close', () => pool.destroy());
});

console.log(`Bridge Server active on port ${PORT}`);
