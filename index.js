const net = require('net');
const WebSocket = require('ws');

// Using MiningDutch - High compatibility for mobile tunnels
const POOL_HOST = 'dash.miningdutch.nl';
const POOL_PORT = 4253; 
const PORT = process.env.PORT || 10000;

const wss = new WebSocket.Server({ port: PORT }, () => {
    console.log(`TUNNEL_SYSTEM_ONLINE_${PORT}`);
});

wss.on('connection', (ws) => {
    const pool = new net.Socket();
    pool.setKeepAlive(true, 5000); // Prevents the 'Lost Signal' loop

    pool.connect(POOL_PORT, POOL_HOST, () => {
        console.log('TUNNEL_LINK_SUCCESS');
    });

    ws.on('message', (msg) => {
        if (pool.writable) pool.write(msg + '\n');
    });

    pool.on('data', (data) => {
        if (ws.readyState === WebSocket.OPEN) ws.send(data.toString());
    });

    ws.on('close', () => pool.destroy());
    pool.on('error', () => pool.destroy());
});
