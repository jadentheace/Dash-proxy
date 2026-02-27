const WebSocket = require('ws');
const net = require('net');

const TARGET_HOST = 'flex.mine.zpool.ca';
const TARGET_PORT = 3581;

const wss = new WebSocket.Server({ port: process.env.PORT || 8080 });

wss.on('connection', (ws) => {
    const stratum = new net.Socket();
    
    stratum.connect(TARGET_PORT, TARGET_HOST, () => {
        console.log('--- LINKED_TO_ZPOOL_FLEX ---');
    });

    // Pipe from Phone to Zpool
    ws.on('message', (msg) => {
        stratum.write(msg + '\n');
    });

    // Pipe from Zpool to Phone with Activity Log
    stratum.on('data', (data) => {
        const raw = data.toString();
        if (raw.includes('mining.notify')) {
            console.log('--- INBOUND_JOB_DETECTED ---');
        }
        if (ws.readyState === WebSocket.OPEN) {
            ws.send(raw);
        }
    });

    stratum.on('error', () => ws.close());
    ws.on('close', () => stratum.destroy());
});

console.log('DASH_PROXY_V15_READY');
