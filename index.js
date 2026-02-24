const WebSocket = require('ws');
const http = require('http');

// CRITICAL: process.env.PORT is how Render opens Port 443 to the world
const port = process.env.PORT || 4444; 

const server = http.createServer((req, res) => {
    res.writeHead(200);
    res.end("DASH PROXY ACTIVE ON PORT 443");
});

const wss = new WebSocket.Server({ server });

wss.on('connection', (ws) => {
    console.log("iPhone Connected via Port 443 Tunnel");
    
    // Replace with your Mining-Dutch details
    const poolSocket = new WebSocket('wss://mining-dutch.nl:4444'); 

    ws.on('message', (message) => {
        if (poolSocket.readyState === WebSocket.OPEN) {
            poolSocket.send(message);
        }
    });

    poolSocket.on('message', (data) => {
        ws.send(data);
    });
});

server.listen(port, () => {
    console.log(`Server live on internal port: ${port}`);
});
