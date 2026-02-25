const WebSocket = require('ws');
const net = require('net');
const http = require('http');

const PORT = process.env.PORT || 10000;
const server = http.createServer((req, res) => { res.writeHead(200); res.end('Bridge Live'); });
const wss = new WebSocket.Server({ server });

const POOL_HOST = 'mining-dutch.nl';
const POOL_PORT = 3533; 

wss.on('connection', (ws) => {
    const pool = new net.Socket();
    pool.setKeepAlive(true, 5000);

    pool.connect(POOL_PORT, POOL_HOST, () => {
        console.log('Connected to Mining-Dutch');
    });

    ws.on('message', (msg) => { pool.write(msg + '\n'); });

    pool.on('data', (data) => {
        if (ws.readyState === WebSocket.OPEN) ws.send(data.toString());
    });

    ws.on('close', () => pool.destroy());
    pool.on('error', (err) => {
        if (ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify({err: err.message}));
        ws.close();
    });
});

server.listen(PORT);
