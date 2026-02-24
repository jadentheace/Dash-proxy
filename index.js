const Net = require('net');
const WebSocket = require('ws');

// THE CORE PIPE: Blog -> Render -> Mining-Dutch
const POOL_HOST = 'dash.mining-dutch.nl';
const POOL_PORT = 3333; // X11 Port

const wss = new WebSocket.Server({ port: process.env.PORT || 3000 });

wss.on('connection', (ws) => {
    const client = new Net.Socket();
    client.connect(POOL_PORT, POOL_HOST, () => {
        console.log("CONNECTED TO DUTCH POOL");
    });

    ws.on('message', (msg) => { client.write(msg + '\n'); });
    client.on('data', (data) => { ws.send(data.toString()); });
    
    ws.on('close', () => client.destroy());
    client.on('error', () => ws.terminate());
});
console.log("PROXY ENGINE ACTIVE");
