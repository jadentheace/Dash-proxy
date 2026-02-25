const net = require('net');
const WebSocket = require('ws');

// TARGETING THE HIGHEST VELOCITY CPU PORT FOR IPHONE 14
const TARGET_HOST = 'randomx.mine.zpool.ca';
const TARGET_PORT = 6234; 
const PROXY_PORT = process.env.PORT || 8080;

const wss = new WebSocket.Server({ port: PROXY_PORT });

wss.on('connection', (ws) => {
    const stratum = net.createConnection(TARGET_PORT, TARGET_HOST);
    stratum.setNoDelay(true); // ZERO-LATENCY MODE: FORCES IMMEDIATE DATA FLOW

    ws.on('message', (msg) => { stratum.write(msg + '\n'); });

    stratum.on('data', (data) => {
        if (ws.readyState === WebSocket.OPEN) {
            ws.send(data.toString());
        }
    });

    stratum.on('connect', () => console.log("NITRO_LINK_ESTABLISHED"));
    ws.on('close', () => stratum.destroy());
    stratum.on('error', () => ws.close());
});

console.log(`Nitro Proxy Active: ${PROXY_PORT} -> ${TARGET_HOST}:${TARGET_PORT}`);
