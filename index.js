const WebSocket = require('ws');
const net = require('net');

// FORCE PORT 10000 AS SEEN IN YOUR LOGS
const port = process.env.PORT || 10000; 
const wss = new WebSocket.Server({ port: port });

const POOL_HOST = 'na.veruspool.io';
const POOL_PORT = 9999; 

console.log(`SERVER STARTING ON PORT: ${port}`);

wss.on('connection', (ws) => {
    const pool = new net.Socket();
    
    // Aggressive Reconnection Logic for "Pool Error" logs
    const connectPool = () => {
        pool.connect(POOL_PORT, POOL_HOST, () => {
            console.log('CONNECTED TO VERUSPOOL');
        });
    };

    connectPool();

    ws.on('message', (message) => {
        if (pool.writable) pool.write(message + '\n');
    });

    pool.on('data', (data) => {
        if (ws.readyState === WebSocket.OPEN) ws.send(data.toString());
    });

    pool.on('error', (err) => {
        console.log('Pool Error, Reconnecting...'); // Matches your red logs
        setTimeout(connectPool, 2000);
    });

    ws.on('close', () => pool.destroy());
});
