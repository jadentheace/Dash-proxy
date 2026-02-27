const WebSocket = require('ws');
const net = require('net');

const POOL_HOST = 'flex.mine.zpool.ca';
const POOL_PORT = 3581;

const wss = new WebSocket.Server({ port: process.env.PORT || 8080 });

wss.on('connection', (ws) => {
    const stratum = new net.Socket();
    
    // Force the connection to stay alive
    stratum.setKeepAlive(true, 5000);

    stratum.connect(POOL_PORT, POOL_HOST, () => {
        console.log('ZPOOL_LINK_ESTABLISHED');
    });

    ws.on('message', (msg) => {
        if (stratum.writable) stratum.write(msg + '\n');
    });

    stratum.on('data', (data) => {
        if (ws.readyState === WebSocket.OPEN) ws.send(data.toString());
    });

    // Auto-reconnect on pool drop
    stratum.on('close', () => ws.close());
    ws.on('close', () => stratum.destroy());
});
console.log('IPHONE_14_PROXY_V20_ONLINE');
