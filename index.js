const WebSocket = require('ws');
const net = require('net');

const TARGET_HOST = 'flex.mine.zpool.ca';
const TARGET_PORT = 3581;

const wss = new WebSocket.Server({ port: process.env.PORT || 8080 });

wss.on('connection', (ws) => {
    console.log('FRONTEND_UPLINK_ESTABLISHED');
    const stratum = new net.Socket();
    
    // Set a timeout to prevent the immediate "Terminated" loop
    stratum.setTimeout(30000);

    stratum.connect(TARGET_PORT, TARGET_HOST, () => {
        console.log('POOL_CONNECTED');
    });

    ws.on('message', (msg) => {
        if (stratum.writable) stratum.write(msg + '\n');
    });

    stratum.on('data', (data) => {
        if (ws.readyState === WebSocket.OPEN) ws.send(data.toString());
    });

    stratum.on('error', (e) => console.log('STRATUM_ERR:', e.message));
    stratum.on('close', () => {
        console.log('UPLINK_TERMINATED');
        ws.close();
    });
    
    ws.on('close', () => stratum.destroy());
});

console.log('PROXY_V16_ACTIVE');
