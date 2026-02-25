const net = require('net');
const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 10000 }); // Render uses port 10000
const POOL_HOST = 'dash.viabtc.top'; 
const POOL_PORT = 8888;

wss.on('connection', (ws) => {
    console.log("LOG: Phone connected to Proxy");
    const stratum = net.createConnection(POOL_PORT, POOL_HOST);

    stratum.on('connect', () => {
        console.log("LOG: Proxy connected to Viabtc Dash Pool");
    });

    // Pipe data from Pool to Phone
    stratum.on('data', (data) => {
        console.log("LOG: Job received from Pool -> Sending to Phone");
        ws.send(data.toString());
    });

    // Pipe data from Phone to Pool
    ws.on('message', (msg) => {
        stratum.write(msg + '\n');
    });

    stratum.on('error', (err) => console.log("POOL_ERROR: " + err.message));
    ws.on('error', (err) => console.log("PHONE_ERROR: " + err.message));
});

console.log("Proxy Bridge Active on Port 10000");
