const WebSocket = require('ws');
const net = require('net');

const POOL = { host: 'flex.mine.zpool.ca', port: 3581 };
const wss = new WebSocket.Server({ port: process.env.PORT || 8080 });

wss.on('connection', (ws) => {
    console.log('--- [!] IPHONE_14_CONNECTED_TO_PROXY ---');
    const stratum = new net.Socket();
    
    stratum.connect(POOL.port, POOL.host, () => {
        console.log('--- [!] PROXY_LINKED_TO_ZPOOL ---');
    });

    ws.on('message', (data) => {
        console.log('--- [->] IPHONE_SENDING_DATA: ' + data.toString().substring(0, 30));
        if (stratum.writable) stratum.write(data.toString().trim() + '\n');
    });

    stratum.on('data', (chunk) => {
        console.log('--- [<-] POOL_SENDING_JOB ---');
        if (ws.readyState === WebSocket.OPEN) ws.send(chunk.toString());
    });

    stratum.on('error', (e) => console.log('STRATUM_ERR:', e.message));
    stratum.on('close', () => ws.close());
    ws.on('close', () => stratum.destroy());
});

console.log('V29_DEEP_PIPE_ONLINE_READY');
