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
    
    // KEEP-ALIVE SYSTEM TO PREVENT RENDER TIMEOUTS
    const heartbeat = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) ws.ping();
    }, 30000);

    pool.connect(POOL_PORT, POOL_HOST, () => {
        console.log('ZERGPOOL_STABLE_LINK_ESTABLISHED');
    });

    ws.on('message', (msg) => {
        if (pool.writable) pool.write(msg + '\n');
    });

    pool.on('data', (data) => {
        if (ws.readyState === WebSocket.OPEN) ws.send(data.toString());
    });

    ws.on('close', () => {
        clearInterval(heartbeat);
        pool.destroy();
    });
    pool.on('close', () => ws.close());
    pool.on('error', () => pool.destroy());
});
