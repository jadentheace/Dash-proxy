const net = require('net');
const WebSocket = require('ws');

// Using Zergpool's most stable Dash port
const POOL_HOST = 'dash.zergpool.com';
const POOL_PORT = 4253; 
const PORT = process.env.PORT || 10000;

const wss = new WebSocket.Server({ port: PORT }, () => {
    console.log(`BRIDGE_LIVE_PORT_${PORT}`);
});

wss.on('connection', (ws) => {
    const pool = new net.Socket();
    // Disable Nagle's Algorithm for instant data transfer
    pool.setNoDelay(true);

    pool.connect(POOL_PORT, POOL_HOST, () => {
        console.log('POOL_LINK_ESTABLISHED');
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
