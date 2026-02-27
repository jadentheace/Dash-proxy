const WebSocket = require('ws');
const net = require('net');

const POOL = { host: 'flex.mine.zpool.ca', port: 3581 };
const wss = new WebSocket.Server({ port: process.env.PORT || 8080 });

wss.on('connection', (ws) => {
    console.log('--- TUNNEL_OPEN: IPHONE_14_CORE_SYNC ---');
    const stratum = new net.Socket();
    
    // Use low-level binary piping
    stratum.connect(POOL.port, POOL.host, () => {
        console.log('--- SUCCESS: ZPOOL_BINARY_HANDSHAKE_COMPLETE ---');
    });

    ws.on('message', (buffer) => {
        // Force append the Stratum line-break directly to the buffer
        const cmd = buffer.toString().trim() + '\n';
        if (stratum.writable) stratum.write(cmd);
    });

    stratum.on('data', (chunk) => {
        // Relay raw binary back to the iPhone
        if (ws.readyState === WebSocket.OPEN) ws.send(chunk);
    });

    stratum.on('error', () => ws.close());
    stratum.on('close', () => ws.close());
    ws.on('close', () => stratum.destroy());
});
console.log('BINARY_BRIDGE_V23_LIVE');
