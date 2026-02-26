const WebSocket = require('ws');
const net = require('net');

const wss = new WebSocket.Server({ port: process.env.PORT || 8080 });

wss.on('connection', (ws) => {
    // HARD-CODED TO ZPOOL VERUSHASH PORT 3300
    const client = new net.Socket();
    client.connect(3300, 'verushash.mine.zpool.ca', () => {
        console.log('Zpool Connection Secured');
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
