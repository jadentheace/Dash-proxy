const WebSocket = require('ws');
const net = require('net');

const port = process.env.PORT || 10000; 
const wss = new WebSocket.Server({ port: port });

const POOL_HOST = 'na.veruspool.io';
const POOL_PORT = 9999; 

wss.on('connection', (ws) => {
    const pool = new net.Socket();
    pool.connect(POOL_PORT, POOL_HOST, () => {
        console.log('HANDSHAKE_READY');
    });

    ws.on('message', (message) => {
        let msgStr = message.toString().trim();
        // FORCE the pool to read the command by adding the newline
        if (pool.writable) {
            pool.write(msgStr + '\n');
        }
    });

    pool.on('data', (data) => {
        if (ws.readyState === WebSocket.OPEN) {
            ws.send(data.toString());
        }
    });

    pool.on('error', () => {
        setTimeout(() => pool.connect(POOL_PORT, POOL_HOST), 1000);
    });

    ws.on('close', () => pool.destroy());
});
