const WebSocket = require('ws');
const net = require('net');

const TARGET = { host: 'flex.mine.zpool.ca', port: 3581 };
const wss = new WebSocket.Server({ port: process.env.PORT || 8080 });

wss.on('connection', (ws) => {
    console.log('--- !!! INCOMING_IPHONE_STRIKE !!! ---');
    const stratum = new net.Socket();
    
    stratum.connect(TARGET.port, TARGET.host, () => {
        console.log('--- POOL_BRIDGE_ACTIVE ---');
    });

    ws.on('message', (m) => { if(stratum.writable) stratum.write(m + '\n'); });
    
    stratum.on('data', (d) => {
        if (ws.readyState === WebSocket.OPEN) ws.send(d.toString());
    });

    stratum.on('error', () => ws.close());
    stratum.on('close', () => ws.close());
    ws.on('close', () => stratum.destroy());
});
console.log('V21_FORCE_READY');
