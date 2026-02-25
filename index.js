const net = require('net');
const WebSocket = require('ws');

// TARGETING THE UNIVERSAL HUB - ACCEPTS ALL ALGORITHMS
const TARGET_HOST = 'mine.zpool.ca'; 
const TARGET_PORT = 6234; 
const PROXY_PORT = process.env.PORT || 8080;

const wss = new WebSocket.Server({ port: PROXY_PORT });

wss.on('connection', (ws) => {
    const stratum = net.createConnection(TARGET_PORT, TARGET_HOST);
    stratum.setNoDelay(true); 

    ws.on('message', (msg) => { stratum.write(msg + '\n'); });

    stratum.on('data', (data) => {
        if (ws.readyState === WebSocket.OPEN) {
            ws.send(data.toString());
        }
    });

    ws.on('close', () => stratum.destroy());
    stratum.on('error', () => ws.close());
});

console.log(`Universal Profit Proxy Active: Listening for all Algos on Port ${TARGET_PORT}`);
