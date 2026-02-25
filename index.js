const net = require('net');
const WebSocket = require('ws');

const POOL_HOST = 'dash.viabtc.top';
const POOL_PORT = 3333;
const PORT = process.env.PORT || 10000;

const wss = new WebSocket.Server({ port: PORT });

wss.on('connection', (ws) => {
    const pool = net.connect(POOL_PORT, POOL_HOST);
    pool.setNoDelay(true);

    // Keep-alive heartbeat to prevent pool timeout
    const heartbeat = setInterval(() => {
        if (!pool.destroyed) pool.write('{"id":20,"method":"mining.get_transactions","params":[]}\n');
    }, 25000);

    pool.on('data', (data) => {
        if (ws.readyState === WebSocket.OPEN) ws.send(data.toString());
    });

    ws.on('message', (msg) => {
        if (!pool.destroyed) pool.write(msg.trim() + "\n");
    });

    pool.on('error', () => pool.destroy());
    ws.on('close', () => {
        clearInterval(heartbeat);
        pool.destroy();
    });
});
