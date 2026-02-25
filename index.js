const WebSocket = require('ws');
const net = require('net');

// This forces the bridge to lock onto port 10000 immediately
const wss = new WebSocket.Server({ port: 10000 }); 

wss.on('connection', (ws) => {
    const pool = new net.Socket();
    pool.connect(3433, 'dash.mine.zergpool.com');

    pool.on('data', (data) => {
        if (ws.readyState === WebSocket.OPEN) ws.send(data.toString());
    });

    ws.on('message', (message) => {
        pool.write(message + '\n');
    });

    ws.on('close', () => pool.destroy());
    pool.on('error', () => ws.close());
});

console.log("BRIDGE_LOCKED_ON_10000");
