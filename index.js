const WebSocket = require('ws');
const net = require('net');

// ZPOOL TARGETS
const STRATUM_HOST = 'flex.mine.zpool.ca';
const STRATUM_PORT = 3581; 

const wss = new WebSocket.Server({ port: process.env.PORT || 8080 });

wss.on('connection', (ws) => {
    console.log('FRONTEND_UPLINK_ESTABLISHED');

    // Create the TCP socket to Zpool
    const stratum = new net.Socket();

    stratum.connect(STRATUM_PORT, STRATUM_HOST, () => {
        console.log(`CONNECTED_TO_ZPOOL_FLEX_ALGO`);
    });

    // Bridge: Phone -> Proxy -> Zpool
    ws.on('message', (message) => {
        if (stratum.writable) {
            stratum.write(message + '\n');
        }
    });

    // Bridge: Zpool -> Proxy -> Phone
    stratum.on('data', (data) => {
        if (ws.readyState === WebSocket.OPEN) {
            ws.send(data.toString());
        }
    });

    stratum.on('error', (err) => {
        console.log('STRATUM_CONNECTION_ERROR:', err.message);
        ws.close();
    });

    ws.on('close', () => {
        stratum.destroy();
        console.log('UPLINK_TERMINATED');
    });
});

console.log('DASH_PROXY_RUNNING_ON_V14_PROTOCOL');
