const WebSocket = require('ws');
const net = require('net');

const TARGET = { host: 'flex.mine.zpool.ca', port: 3581 };
const wss = new WebSocket.Server({ port: process.env.PORT || 8080 });

wss.on('connection', (ws) => {
    console.log('--- IPHONE_CORE_ATTACHED ---');
    const stratum = new net.Socket();
    
    // Crucial: Set a 5-second keepalive to prevent Render drop-outs
    stratum.setKeepAlive(true, 5000);

    stratum.connect(TARGET.port, TARGET.host, () => {
        console.log('--- TUNNEL_TO_ZPOOL_LOCKED ---');
    });

    ws.on('message', (msg) => {
        // Ensure every command ends with the mandatory newline
        if (stratum.writable) stratum.write(msg.toString().trim() + '\n');
    });

    stratum.on('data', (data) => {
        // Relay pool jobs back to iPhone immediately
        if (ws.readyState === WebSocket.OPEN) ws.send(data.toString());
    });

    stratum.on('error', (e) => console.log('STRATUM_ERR:', e.message));
    stratum.on('close', () => ws.close());
    ws.on('close', () => stratum.destroy());
});
console.log('DASH_BRIDGE_V25_ONLINE');
