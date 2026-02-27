const WebSocket = require('ws');
const net = require('net');

// ZPOOL TARGETS
const HOST = 'flex.mine.zpool.ca';
const PORT = 3581;

const wss = new WebSocket.Server({ port: process.env.PORT || 8080 });

wss.on('connection', (ws) => {
    const stratum = new net.Socket();
    
    // Bypass Render's 30-second default timeout
    stratum.setKeepAlive(true, 5000); 

    stratum.connect(PORT, HOST, () => {
        console.log('--- LINKED_TO_ZPOOL ---');
    });

    ws.on('message', (msg) => {
        if (stratum.writable) stratum.write(msg + '\n');
    });

    stratum.on('data', (data) => {
        if (ws.readyState === WebSocket.OPEN) ws.send(data.toString());
    });

    stratum.on('error', () => ws.close());
    stratum.on('close', () => ws.close());
    ws.on('close', () => stratum.destroy());
});

console.log('PROXY_V19_IPHONE_OPTIMIZED');
