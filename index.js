const WebSocket = require('ws');
const net = require('net');

// Target: ViaBTC Dash (Using TCP Port 3333 for maximum speed)
const POOL = { host: 'dash.viabtc.top', port: 3333 }; 
const wss = new WebSocket.Server({ port: process.env.PORT || 8080 });

wss.on('connection', (ws) => {
    const stratum = new net.Socket();
    
    stratum.connect(POOL.port, POOL.host, () => {
        console.log('--- PIPE_CONNECTED_TO_VIABTC ---');
    });

    // Move data from Phone to Pool
    ws.on('message', (msg) => {
        if (stratum.writable) stratum.write(msg + '\n');
    });

    // Move data from Pool to Phone
    stratum.on('data', (data) => {
        if (ws.readyState === WebSocket.OPEN) ws.send(data.toString());
    });

    stratum.on('error', () => stratum.destroy());
    stratum.on('close', () => ws.close());
    ws.on('close', () => stratum.destroy());
});

console.log('DIRECT_PIPE_V36_READY');
