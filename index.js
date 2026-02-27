const WebSocket = require('ws');
const net = require('net');

// ZPOOL FLEX TARGET
const POOL = { host: 'flex.mine.zpool.ca', port: 3581 };
const wss = new WebSocket.Server({ port: process.env.PORT || 8080 });

wss.on('connection', (ws) => {
    console.log('--- [SIGNAL] IPHONE_14_UPLINK_FOUND ---');
    const stratum = new net.Socket();
    
    // Force the TCP socket to stay open even if the phone screen dims
    stratum.setKeepAlive(true, 5000); 

    stratum.connect(POOL.port, POOL.host, () => {
        console.log('--- [SUCCESS] CONNECTED_TO_ZPOOL_PORT_3581 ---');
    });

    ws.on('message', (msg) => {
        // Zpool requires raw strings terminated with exactly \n
        if (stratum.writable) {
            stratum.write(msg.toString().trim() + '\n');
        }
    });

    stratum.on('data', (chunk) => {
        // Log to Render so you can see the jobs coming in
        console.log('--- [JOB] DATA_RECEIVED_FROM_POOL ---');
        if (ws.readyState === WebSocket.OPEN) {
            ws.send(chunk.toString());
        }
    });

    stratum.on('error', (err) => console.log('STRATUM_ERROR:', err.message));
    stratum.on('close', () => ws.close());
    ws.on('close', () => stratum.destroy());
});

console.log('TITAN_LINK_V29_PRODUCTION_READY');
