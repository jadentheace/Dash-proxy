const WebSocket = require('ws');
const net = require('net');

const TARGET_HOST = 'pool.verus.io';
const TARGET_PORT = 9998;

const wss = new WebSocket.Server({ port: process.env.PORT || 8080 });

wss.on('connection', (ws) => {
    console.log(">> PROXY_UPLINK_START: VERUS_COMMUNITY_POOL");
    
    // Using a direct TCP net socket for better job delivery stability
    const client = new net.Socket();
    
    client.connect(TARGET_PORT, TARGET_HOST, () => {
        console.log(">> SUCCESS: TCP_TUNNEL_ESTABLISHED");
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
