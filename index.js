const net = require('net');
const WebSocket = require('ws');

// SWITCHING TO RANDOMX FOR HIGH-SPEED JOB VOLUME
const TARGET_HOST = 'randomx.mine.zpool.ca';
const TARGET_PORT = 6234;
const PROXY_PORT = process.env.PORT || 8080;

const wss = new WebSocket.Server({ port: PROXY_PORT });

wss.on('connection', (ws) => {
    const stratum = net.createConnection(TARGET_PORT, TARGET_HOST);

    ws.on('message', (msg) => { stratum.write(msg + '\n'); });
    stratum.on('data', (data) => {
        if (ws.readyState === WebSocket.OPEN) { ws.send(data.toString()); }
    });

    ws.on('close', () => stratum.end());
    stratum.on('error', () => ws.close());
});
