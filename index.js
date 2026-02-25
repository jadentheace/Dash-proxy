const WebSocket = require('ws');
const net = require('net');

// Binding to Port 10000 as required by your Render logs
const PORT = process.env.PORT || 10000;
const wss = new WebSocket.Server({ port: PORT });

const POOL_HOST = 'na.veruspool.io';
const POOL_PORT = 9999; 

wss.on('connection', (ws) => {
    const pool = new net.Socket();
    
    pool.connect(POOL_PORT, POOL_HOST, () => {
        console.log('--- STRATUM CONNECTION LIVE ---');
    });

    ws.on('message', (message) => {
        // MANDATORY FIX: Stratum pools require a newline to process commands
        if (pool.writable) {
            pool.write(message + '\n'); 
        }
    });

    pool.on('data', (data) => {
        if (ws.readyState === WebSocket.OPEN) {
            ws.send(data.toString());
        }
    });

    pool.on('error', (err) => {
        console.log('Pool side error:', err.message);
        if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({type: "error", msg: "POOL_DISCONNECT"}));
        }
    });

    ws.on('close', () => pool.destroy());
});
