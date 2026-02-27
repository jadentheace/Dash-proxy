const WebSocket = require('ws');
const net = require('net');

const POOL = { host: 'flex.mine.zpool.ca', port: 3581 };
const wss = new WebSocket.Server({ port: process.env.PORT || 8080 });

wss.on('connection', (ws) => {
    const stratum = new net.Socket();
    // Setting a low-latency keep-alive to stay "locked" to the pool
    stratum.setKeepAlive(true, 1000); 

    stratum.connect(POOL.port, POOL.host, () => {
        console.log('--- TUNNEL_LOCKED: BYPASSING_PROXY_FILTERS ---');
    });

    ws.on('message', (buffer) => {
        // We must append the HEX line-break for Zpool to 'wake up'
        if (stratum.writable) stratum.write(buffer.toString().trim() + '\n');
    });

    stratum.on('data', (chunk) => {
        // Send raw binary back to the iPhone
        if (ws.readyState === WebSocket.OPEN) ws.send(chunk.toString());
    });

    stratum.on('error', () => ws.close());
    stratum.on('close', () => ws.close());
    ws.on('close', () => stratum.destroy());
});
console.log('V28_RAW_PIPE_READY');
