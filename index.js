const Net = require('net');
const WebSocket = require('ws');

// REDIRECTING FROM ZPOOL TO MINING-DUTCH
const POOL_HOST = 'dash.mining-dutch.nl';
const POOL_PORT = 3333; 

const wss = new WebSocket.Server({ port: process.env.PORT || 3000 });

wss.on('connection', (ws) => {
    const poolSocket = new Net.Socket();
    
    poolSocket.connect(POOL_PORT, POOL_HOST, () => {
        console.log("SUCCESS: Connected to Mining-Dutch X11");
    });

    ws.on('message', (data) => {
        poolSocket.write(data + '\n');
    });

    poolSocket.on('data', (data) => {
        ws.send(data.toString());
    });

    ws.on('close', () => poolSocket.destroy());
    poolSocket.on('error', (err) => {
        console.log("Pool Error: " + err.message);
        ws.terminate();
    });
});

console.log("DASH PROXY ONLINE");
