const net = require('net');
const WebSocket = require('ws');

// SWITCHING TO LUCKPOOL (MORE MOBILE FRIENDLY)
const POOL_HOST = 'dash.luckpool.net';
const POOL_PORT = 3105; 
const PORT = process.env.PORT || 10000;

const wss = new WebSocket.Server({ port: PORT }, () => {
    console.log(`BRIDGE_LOCKED_ON_${PORT}`);
});

wss.on('connection', (ws) => {
    const pool = new net.Socket();
    pool.setKeepAlive(true, 5000);

    pool.connect(POOL_PORT, POOL_HOST, () => {
        console.log('LUCKPOOL_CONNECTED');
    });

    ws.on('message', (msg) => {
        // ADDING SMALL DELAY TO STABILIZE 5G HANDSHAKE
        setTimeout(() => {
            if (pool.writable) pool.write(msg + '\n');
        }, 100);
    });

    pool.on('data', (data) => {
        if (ws.readyState === WebSocket.OPEN) ws.send(data.toString());
    });

    ws.on('close', () => pool.destroy());
    pool.on('close', () => ws.close());
    pool.on('error', () => pool.destroy());
});
