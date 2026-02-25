const net = require('net');
const WebSocket = require('ws');

const POOL_HOST = 'dash.zergpool.com';
const POOL_PORT = 4253; 
const PORT = process.env.PORT || 10000;

const wss = new WebSocket.Server({ port: PORT }, () => {
    console.log(`TITAN_BRIDGE_ACTIVE_${PORT}`);
});

wss.on('connection', (ws) => {
    const pool = new net.Socket();
    pool.setNoDelay(false); // Enable buffering to stabilize 5G

    pool.connect(POOL_PORT, POOL_HOST, () => {
        console.log('TITAN_LINK_STABLE');
    });

    ws.on('message', (msg) => {
        if (pool.writable) pool.write(msg + '\n');
    });

    pool.on('data', (data) => {
        if (ws.readyState === WebSocket.OPEN) ws.send(data.toString());
    });

    ws.on('close', () => pool.destroy());
    pool.on('close', () => ws.close());
    pool.on('error', (err) => {
        console.log('POOL_ERR:', err.message);
        pool.destroy();
    });
});
