const net = require('net');
const WebSocket = require('ws');

// SWITCHING TO VARIABLE DIFFICULTY PORT FOR MOBILE STABILITY
const POOL_HOST = 'dash.zergpool.com';
const POOL_PORT = 4253; 
const PORT = process.env.PORT || 10000;

const wss = new WebSocket.Server({ port: PORT }, () => {
    console.log(`BRIDGE_LOCKED_ON_${PORT}`);
});

wss.on('connection', (ws) => {
    console.log('MOBILE_DEVICE_LINKED');
    const pool = new net.Socket();

    pool.connect(POOL_PORT, POOL_HOST, () => {
        console.log('ZERGPOOL_VAR_DIFF_CONNECTED');
    });

    ws.on('message', (msg) => {
        if (pool.writable) {
            pool.write(msg + '\n');
        }
    });

    pool.on('data', (data) => {
        if (ws.readyState === WebSocket.OPEN) {
            ws.send(data.toString());
        }
    });

    pool.on('error', () => console.log('POOL_SYNC_ERROR'));
    ws.on('close', () => pool.destroy());
    pool.on('close', () => ws.close());
});
