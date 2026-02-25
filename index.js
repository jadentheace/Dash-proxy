// NEW RENDER PROXY FOR ZPOOL (Yescrypt Algo)
const net = require('net');
const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 10000 });
const POOL_HOST = 'yescrypt.na.mine.zpool.ca'; // North America Stratum
const POOL_PORT = 6233; // Port for Yescrypt

wss.on('connection', (ws) => {
    console.log("SYNC: Mobile connected to ZPool Bridge");
    const stratum = net.createConnection(POOL_PORT, POOL_HOST);

    stratum.on('data', (data) => ws.send(data.toString()));
    ws.on('message', (msg) => stratum.write(msg + '\n'));

    stratum.on('error', (err) => console.log("ZPOOL_ERR: " + err.message));
    ws.on('close', () => console.log("ZPOOL_DISCONNECT"));
});
