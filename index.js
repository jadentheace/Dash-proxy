const WebSocket = require('ws');
const net = require('net');

const wss = new WebSocket.Server({ port: process.env.PORT || 8080 });

// TARGET POOL: ZergPool is fast and compatible with this setup
const POOL_HOST = 'dash.mine.zergpool.com';
const POOL_PORT = 3433;

wss.on('connection', (ws) => {
    console.log('MINER LINKED');
    const pool = new net.Socket();

    pool.connect(POOL_PORT, POOL_HOST, () => {
        console.log('POOL LINKED');
    });

    pool.on('data', (data) => {
        if (ws.readyState === WebSocket.OPEN) {
            ws.send(data.toString());
        }
    });

    ws.on('message', (message) => {
        pool.write(message + '\n');
    });

    ws.on('close', () => pool.destroy());
    pool.on('error', () => ws.close());
});
