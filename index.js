const WebSocket = require('ws');
const net = require('net');

const wss = new WebSocket.Server({ port: process.env.PORT || 8080 });

wss.on('connection', (ws) => {
    // FORCING ZPOOL STRATUM HUB
    const client = new net.Socket();
    client.connect(3300, 'verushash.mine.zpool.ca', () => {
        console.log('Connected to Zpool Stratum');
    });

    ws.on('message', (msg) => {
        client.write(msg + '\n');
    });

    client.on('data', (data) => {
        ws.send(data.toString());
    });

    client.on('close', () => ws.close());
    ws.on('close', () => client.destroy());
});
