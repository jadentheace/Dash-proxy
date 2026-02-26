const WebSocket = require('ws');
const net = require('net');

const wss = new WebSocket.Server({ port: process.env.PORT || 8080 });

wss.on('connection', (ws) => {
    // FORCE CONNECTION TO ZPOOL VERUSHASH PORT
    const zpool = net.connect(3300, 'verushash.mine.zpool.ca', () => {
        console.log('CONNECTED TO ZPOOL STRATUM');
    });

    ws.on('message', (data) => {
        // Ensure every message ends with a newline for Stratum protocol
        zpool.write(data + '\n');
    });

    zpool.on('data', (data) => {
        ws.send(data.toString());
    });

    zpool.on('error', (err) => console.log('ZPOOL_ERR:', err.message));
    ws.on('close', () => zpool.destroy());
    zpool.on('close', () => ws.close());
});
