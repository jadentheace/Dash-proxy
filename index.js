const WebSocket = require('ws');
const net = require('net');

const wss = new WebSocket.Server({ port: process.env.PORT || 8080 });
const POOL_HOST = 'na.veruspool.io';
const POOL_PORT = 9999; 

wss.on('connection', (ws) => {
    let pool = new net.Socket();
    
    const connectToPool = () => {
        pool.connect(POOL_PORT, POOL_HOST, () => {
            console.log('CONNECTED TO VERUSPOOL');
        });
    };

    connectToPool();

    ws.on('message', (message) => {
        if (pool.writable) {
            pool.write(message + '\n');
        }
    });

    pool.on('data', (data) => {
        if (ws.readyState === WebSocket.OPEN) {
            ws.send(data.toString());
        }
    });

    // Solve the Timeout: If the pool drops, wait 2 seconds and force reconnect
    pool.on('error', (err) => {
        console.log('Pool Error, Reconnecting...');
        setTimeout(connectToPool, 2000);
    });

    ws.on('close', () => { pool.destroy(); });
});
