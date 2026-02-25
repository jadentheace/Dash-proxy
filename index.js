const net = require('net');
const WebSocket = require('ws');

// PORT 6233 is the high-speed CPU lane for ZPool
const TARGET_HOST = 'yescrypt.mine.zpool.ca';
const TARGET_PORT = 6233;
const PROXY_PORT = process.env.PORT || 8080;

const wss = new WebSocket.Server({ port: PROXY_PORT });

wss.on('connection', (ws) => {
    console.log('CLIENT_CONNECTED -> BRIDGE_OPEN');

    const stratum = net.createConnection(TARGET_PORT, TARGET_HOST, () => {
        console.log(`LINKED_TO_ZPOOL_ALGO: ${TARGET_HOST}:${TARGET_PORT}`);
    });

    ws.on('message', (message) => {
        // Relay from phone to ZPool
        stratum.write(message + '\n');
    });

    stratum.on('data', (data) => {
        // Relay from ZPool to phone
        if (ws.readyState === WebSocket.OPEN) {
            ws.send(data.toString());
        }
    });

    ws.on('close', () => {
        console.log('CLIENT_DISCONNECTED');
        stratum.end();
    });

    stratum.on('error', (err) => {
        console.log('STRATUM_ERR: ' + err.message);
        ws.close();
    });

    ws.on('error', (err) => {
        console.log('WS_ERR: ' + err.message);
        stratum.end();
    });
});

console.log(`PROXY_ACTIVE_ON_PORT_${PROXY_PORT}`);
