const WebSocket = require('ws');
const net = require('net');

// This uses whatever port Render gives us automatically
const wss = new WebSocket.Server({ port: process.env.PORT || 8080 });

wss.on('connection', (ws) => {
    // Connects directly to the Dash pool
    const pool = new net.Socket();
    pool.connect(3433, 'dash.mine.zergpool.com');

    pool.on('data', (data) => {
        if (ws.readyState === WebSocket.OPEN) ws.send(data.toString());
    });

    ws.on('message', (message) => {
        pool.write(message + '\n');
    });

    ws.on('close', () => pool.destroy());
    pool.on('error', () => ws.close());
});

console.log("Bridge is online and waiting for Blogger...");
