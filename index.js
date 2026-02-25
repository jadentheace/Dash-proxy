const net = require('net');
const WebSocket = require('ws');

// STRICTLY VIABTC AS REQUESTED
const POOL_HOST = 'dash.viabtc.top';
const POOL_PORT = 8888; 
const PORT = process.env.PORT || 10000;

const wss = new WebSocket.Server({ port: PORT }, () => {
    console.log(`VIABTC_BRIDGE_ACTIVE_${PORT}`);
});

wss.on('connection', (ws) => {
    const pool = new net.Socket();
    pool.setKeepAlive(true, 5000); 

    pool.connect(POOL_PORT, POOL_HOST, () => {
        console.log('VIABTC_LINK_ESTABLISHED');
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
