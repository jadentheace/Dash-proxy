const WebSocket = require('ws');
const net = require('net');

const POOL_HOST = 'flex.mine.zpool.ca';
const POOL_PORT = 3581;

const wss = new WebSocket.Server({ port: process.env.PORT || 8080 });

wss.on('connection', (ws) => {
    console.log('--- [!] INCOMING_IPHONE_14_STRIKE ---');
    const stratum = new net.Socket();
    
    // Low-level TCP keep-alive to prevent the "Silent Drop"
    stratum.setKeepAlive(true, 5000);

    stratum.connect(POOL_PORT, POOL_HOST, () => {
        console.log('--- [SUCCESS] ZPOOL_HANDSHAKE_COMPLETE ---');
    });

    ws.on('message', (msg) => {
        // Convert WebSocket packet to Raw Stratum Binary
        if (stratum.writable) {
            stratum.write(msg.toString().trim() + '\n');
        }
    });

    stratum.on('data', (chunk) => {
        // If we get data, it is a JOB. Send it to the phone immediately.
        if (ws.readyState === WebSocket.OPEN) {
            ws.send(chunk.toString());
        }
    });

    stratum.on('error', (e) => console.log('BRIDGE_ERR:', e.message));
    stratum.on('close', () => ws.close());
    ws.on('close', () => stratum.destroy());
});

console.log('V30_TITAN_BRIDGE_ACTIVE');
