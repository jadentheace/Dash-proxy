const WebSocket = require('ws');
const net = require('net');

const POOL = { host: 'flex.mine.zpool.ca', port: 3581 };
const wss = new WebSocket.Server({ port: process.env.PORT || 8080 });

wss.on('connection', (ws) => {
    console.log('--- [UPLINK] IPHONE_INITIATED ---');
    const stratum = new net.Socket();
    
    stratum.setKeepAlive(true, 1000);
    stratum.setNoDelay(true); // Disable Nagle's algorithm for instant packet delivery

    stratum.connect(POOL.port, POOL.host, () => {
        console.log('--- [!] CONNECTED_TO_ZPOOL_DIRECT ---');
    });

    ws.on('message', (msg) => {
        if (stratum.writable) {
            // Convert to raw Buffer to bypass string-handling filters
            stratum.write(Buffer.from(msg.toString().trim() + '\n', 'utf8'));
        }
    });

    stratum.on('data', (chunk) => {
        console.log('--- [JOB] DATA_STREAM_INBOUND ---');
        if (ws.readyState === WebSocket.OPEN) {
            ws.send(chunk.toString());
        }
    });

    stratum.on('error', (e) => console.log('NET_ERR:', e.message));
    stratum.on('close', () => ws.close());
    ws.on('close', () => stratum.destroy());
});

console.log('OBSIDIAN_V31_RAW_PIPE_ONLINE');
