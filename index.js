const net = require('net');
const WebSocket = require('ws');

const POOL_HOST = 'dash.zergpool.com';
const POOL_PORT = 4253; 
const PORT = process.env.PORT || 10000;

const wss = new WebSocket.Server({ port: PORT }, () => {
    console.log(`BRIDGE_LOCKED_ON_${PORT}`);
});

wss.on('connection', (ws) => {
    const pool = new net.Socket();
    pool.setKeepAlive(true, 10000); // FORCES CONNECTION TO STAY OPEN

    pool.connect(POOL_PORT, POOL_HOST, () => {
        console.log('ZERGPOOL_VAR_DIFF_LOCKED');
    });

    ws.on('message', (msg) => {
        if (pool.writable) pool.write(msg + '\n');
    });

    pool.on('data', (data) => {
        if (ws.readyState === WebSocket.OPEN) ws.send(data.toString());
    });

    ws.on('close', () => pool.destroy());
    pool.on('close', () => ws.close());
    pool.on('error', () => pool.destroy());
});
