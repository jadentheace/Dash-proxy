const WebSocket = require('ws');
const net = require('net');

const POOL = { host: 'flex.mine.zpool.ca', port: 3581 };
const wss = new WebSocket.Server({ port: process.env.PORT || 8080 });

wss.on('connection', (ws) => {
    const stratum = new net.Socket();
    stratum.setKeepAlive(true, 10000); // Prevents "UPLINK_TERMINATED"

    stratum.connect(POOL.port, POOL.host, () => {
        console.log('--- TCP_BRIDGE_ESTABLISHED ---');
    });

    ws.on('message', (data) => {
        // Ensure data is sent as a clean Stratum line
        if (stratum.writable) stratum.write(data.toString().trim() + '\n');
    });

    stratum.on('data', (chunk) => {
        if (ws.readyState === WebSocket.OPEN) ws.send(chunk.toString());
    });

    stratum.on('error', () => ws.close());
    stratum.on('close', () => ws.close());
    ws.on('close', () => stratum.destroy());
});
console.log('V26_HARDENED_PROXY_READY');
