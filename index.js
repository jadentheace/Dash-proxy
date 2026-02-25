const WebSocket = require('ws');
const net = require('net');

const PORT = process.env.PORT || 10000;
const wss = new WebSocket.Server({ port: PORT });

// FIXED HOST: Using the most stable global address
const POOL_HOST = 'pool.verus.io'; 
const POOL_PORT = 9999; 

wss.on('connection', (ws) => {
    const pool = new net.Socket();
    
    // Enable keep-alive to prevent the "ENOTFOUND" or timeouts
    pool.setKeepAlive(true, 10000);

    pool.connect(POOL_PORT, POOL_HOST, () => {
        console.log('SUCCESS: CONNECTED TO VERUS POOL ENGINE');
    });

    ws.on('message', (message) => {
        // Newline is mandatory for Stratum protocol
        if (pool.writable) pool.write(message + '\n');
    });

    pool.on('data', (data) => {
        if (ws.readyState === WebSocket.OPEN) ws.send(data.toString());
    });

    pool.on('error', (err) => {
        console.log('POOL_CONNECTION_ERROR:', err.message);
        // Cleanly try to reconnect if DNS fails again
        setTimeout(() => {
            if(!pool.writable) pool.connect(POOL_PORT, POOL_HOST);
        }, 5000);
    });

    ws.on('close', () => pool.destroy());
});
