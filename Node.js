const WebSocket = require('ws');
const net = require('net');

const wss = new WebSocket.Server({ port: process.env.PORT || 8080 });

// TARGET POOL SETTINGS - SWITCHING TO ZERGPOOL FOR FASTER HANDSHAKES
const POOL_HOST = 'dash.mine.zergpool.com';
const POOL_PORT = 3433;

wss.on('connection', (ws) => {
    console.log('MINER LINKED TO BRIDGE');

    // Create a direct TCP socket to the mining pool
    const pool = new net.Socket();

    pool.connect(POOL_PORT, POOL_HOST, () => {
        console.log('BRIDGE LINKED TO POOL');
    });

    // Send data from Pool to Miner (Blogger)
    pool.on('data', (data) => {
        if (ws.readyState === WebSocket.OPEN) {
            ws.send(data.toString());
        }
    });

    // Send data from Miner (Blogger) to Pool
    ws.on('message', (message) => {
        // High-speed forwarding: NO parsing, just blasting raw stratum
        pool.write(message + '\n');
    });

    ws.on('close', () => {
        pool.destroy();
        console.log('MINER DISCONNECTED');
    });

    pool.on('error', (err) => {
        console.error('POOL ERROR:', err);
        ws.close();
    });
});

console.log('RENDER BRIDGE ACTIVE ON PORT ' + (process.env.PORT || 8080));
