const WebSocket = require('ws');
const net = require('net');

const wss = new WebSocket.Server({ port: process.env.PORT || 8080 });
const POOL_HOST = 'na.veruspool.io';
const POOL_PORT = 9999; 

wss.on('connection', (ws) => {
    console.log('--- NEW BLOG CONNECTION DETECTED ---');
    const pool = new net.Socket();
    
    pool.connect(POOL_PORT, POOL_HOST, () => {
        console.log('CONNECTED TO VERUSPOOL CLUSTER');
    });

    ws.on('message', (message) => {
        // Log the login attempt to your Render dashboard
        console.log('DATA FROM BLOG:', message.toString());
        if (pool.writable) {
            pool.write(message + '\n');
        }
    });

    pool.on('data', (data) => {
        // Send real pool data back to the blog terminal
        ws.send(data.toString());
    });

    pool.on('error', (err) => {
        console.log('POOL ERROR:', err.message);
        ws.send(JSON.stringify({type: "error", msg: "POOL_TIMEOUT"}));
    });

    ws.on('close', () => {
        console.log('BLOG DISCONNECTED');
        pool.destroy();
    });
});

console.log('PROXY ACTIVE ON PORT', process.env.PORT || 8080);
