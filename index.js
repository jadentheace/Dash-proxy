const net = require('net');
const WebSocket = require('ws');

const TARGET_HOST = 'yespower.mine.zpool.ca'; 
const TARGET_PORT = 6233; 
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

console.log(`Ghost Proxy Active: Port ${TARGET_PORT}`);
