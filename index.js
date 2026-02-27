const WebSocket = require('ws');
const net = require('net');

const TARGET = { host: 'flex.mine.zpool.ca', port: 3581 };
const wss = new WebSocket.Server({ port: process.env.PORT || 8080 });

wss.on('connection', (ws) => {
    const stratum = new net.Socket();
    stratum.setKeepAlive(true, 1000); 

    stratum.connect(TARGET.port, TARGET.host, () => {
        console.log('--- CONNECTED_TO_ZPOOL_PORT_3581 ---');
    });

    ws.on('message', (msg) => {
        // FIXED: Force trailing newline and convert to buffer for raw TCP delivery
        if (stratum.writable) {
            const payload = msg.toString().trim() + '\n';
            stratum.write(Buffer.from(payload, 'utf8'));
        }
    });

    stratum.on('data', (chunk) => {
        if (ws.readyState === WebSocket.OPEN) {
            ws.send(chunk.toString());
        }
    });

    stratum.on('error', () => ws.close());
    stratum.on('close', () => ws.close());
    ws.on('close', () => stratum.destroy());
});

console.log('PRODUCTION_ENGINE_V28_LOCKED');
