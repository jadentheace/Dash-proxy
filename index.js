const net = require('net');
const WebSocket = require('ws');

// Switch to a pool that doesn't block Cloud IPs: MiningDutch
const POOL_HOST = 'dash.miningdutch.nl';
const POOL_PORT = 4253; 
const PORT = process.env.PORT || 10000;

const wss = new WebSocket.Server({ port: PORT }, () => {
    console.log(`TUNNEL_ACTIVE_PORT_${PORT}`);
});

wss.on('connection', (ws) => {
    const pool = new net.Socket();
    pool.setNoDelay(true);

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
