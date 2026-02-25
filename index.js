const WebSocket = require('ws');
const net = require('net');
const http = require('http');

const PORT = process.env.PORT || 10000;

// Create a simple HTTP server to satisfy Render's health checks
const server = http.createServer((req, res) => {
    res.writeHead(200);
    res.end('Bridge is Live');
});

const wss = new WebSocket.Server({ server });

const POOL_HOST = 'mining-dutch.nl';
const POOL_PORT = 3533; 

wss.on('connection', (ws) => {
    console.log('iPhone Worker Connected');
    const pool = new net.Socket();
    pool.setKeepAlive(true, 10000);

    pool.connect(POOL_PORT, POOL_HOST, () => {
        console.log('Linked to Mining-Dutch TCP');
    });

    ws.on('message', (msg) => {
        pool.write(msg + '\n');
    });

    pool.on('data', (data) => {
        ws.send(data.toString());
    });

    ws.on('close', () => {
        console.log('iPhone Disconnected');
        pool.destroy();
    });
    
    pool.on('error', (err) => {
        console.error('Pool Error:', err.message);
        ws.close();
    });
});

server.listen(PORT, () => {
    console.log(`Proxy active on port ${PORT}`);
});
