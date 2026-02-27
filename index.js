const WebSocket = require('ws');
const net = require('net');

const POOL = { host: 'flex.mine.zpool.ca', port: 3581 };
const wss = new WebSocket.Server({ port: process.env.PORT || 8080 });

wss.on('connection', (ws) => {
    const stratum = new net.Socket();
    // High-frequency keep-alive prevents Render from killing the connection
    stratum.setKeepAlive(true, 3000); 

    stratum.connect(POOL.port, POOL.host, () => {
        console.log('--- SYSTEM: RAW_STRATUM_BRIDGE_ACTIVE ---');
    });

    ws.on('message', (msg) => {
        // Append raw line-break for Flex protocol compatibility
        if (stratum.writable) stratum.write(msg.toString().trim() + '\n');
    });

    stratum.on('data', (chunk) => {
        if (ws.readyState === WebSocket.OPEN) ws.send(chunk.toString());
    });

    stratum.on('error', () => ws.close());
    stratum.on('close', () => ws.close());
    ws.on('close', () => stratum.destroy());
});

console.log('FINAL_ENGINE_V27_DEPLOYED');
