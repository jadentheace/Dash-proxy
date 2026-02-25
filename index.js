const net = require('net');
const WebSocket = require('ws');

const POOL_HOST = 'dash.viabtc.top';
const POOL_PORT = 3333; 
const PORT = process.env.PORT || 10000;

const wss = new WebSocket.Server({ port: PORT });

wss.on('connection', (ws) => {
    // Establish raw TCP connection
    const pool = net.connect(POOL_PORT, POOL_HOST);
    
    // Ensure data is sent to pool immediately
    pool.setNoDelay(true);

    pool.on('data', (data) => {
        if (ws.readyState === WebSocket.OPEN) {
            ws.send(data.toString());
        }
    });

    ws.on('message', (msg) => {
        if (!pool.destroyed) {
            // Perfect shape: ensure exactly one newline per command
            pool.write(msg.trim() + "\n");
        }
    });

    pool.on('error', () => pool.destroy());
    ws.on('close', () => pool.destroy());
});
