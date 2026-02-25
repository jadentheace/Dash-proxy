const net = require('net');
const WebSocket = require('ws');

// STRIPPED DOWN: NO MULTI-ALGO, NO ZAP. ONLY SPEED.
const TARGET_HOST = 'randomx.mine.zpool.ca';
const TARGET_PORT = 6234; 
const PROXY_PORT = process.env.PORT || 8080;

const wss = new WebSocket.Server({ port: PROXY_PORT });

wss.on('connection', (ws) => {
    const stratum = net.createConnection(TARGET_PORT, TARGET_HOST);
    stratum.setNoDelay(true); // Kills data buffering for instant job delivery

    ws.on('message', (msg) => { stratum.write(msg + '\n'); });

    stratum.on('data', (data) => {
        if (ws.readyState === WebSocket.OPEN) {
            ws.send(data.toString());
        }
    });

    ws.on('close', () => { stratum.destroy(); });
    stratum.on('error', () => ws.close());
});

console.log(`Nitro Proxy Locked to RandomX: Port ${TARGET_PORT}`);
