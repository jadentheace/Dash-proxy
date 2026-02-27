const WebSocket = require('ws');
const net = require('net');

// ZPOOL FLEX TARGET
const POOL_HOST = 'flex.mine.zpool.ca';
const POOL_PORT = 3581;

const wss = new WebSocket.Server({ port: process.env.PORT || 8080 });

wss.on('connection', (ws) => {
    console.log('--- IPHONE_UPLINK_LOCKED ---');
    const stratum = new net.Socket();
    
    stratum.connect(POOL_PORT, POOL_HOST, () => {
        console.log('--- CONNECTED_TO_ZPOOL ---');
    });

    ws.on('message', (msg) => {
        if (stratum.writable) stratum.write(msg + '\n');
    });

    stratum.on('data', (data) => {
        if (ws.readyState === WebSocket.OPEN) ws.send(data.toString());
    });

    stratum.on('error', (e) => console.log('POOL_ERR:', e.message));
    stratum.on('close', () => {
        console.log('UPLINK_TERMINATED_BY_POOL');
        if (ws.readyState === WebSocket.OPEN) ws.close();
    });
    
    ws.on('close', () => stratum.destroy());
});
console.log('V19_DASH_PROXY_READY');
