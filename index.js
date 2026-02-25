const net = require('net');
const WebSocket = require('ws');

const TARGET_HOST = 'randomx.mine.zpool.ca';
const TARGET_PORT = 6234; 
const PROXY_PORT = process.env.PORT || 8080;

const wss = new WebSocket.Server({ port: PROXY_PORT });

wss.on('connection', (ws) => {
    const stratum = net.createConnection(TARGET_PORT, TARGET_HOST);
    stratum.setNoDelay(true);

    // HEARTBEAT: Force the pool to stay high-priority
    const heartbeat = setInterval(() => {
        if (stratum.writable) {
            stratum.write(JSON.stringify({"id":99,"method":"mining.suggest_difficulty","params":[0.0001]}) + '\n');
        }
    }, 5000); 

    ws.on('message', (msg) => { stratum.write(msg + '\n'); });

    stratum.on('data', (data) => {
        if (ws.readyState === WebSocket.OPEN) {
            ws.send(data.toString());
        }
    });

    ws.on('close', () => {
        clearInterval(heartbeat);
        stratum.destroy();
    });
    
    stratum.on('error', () => ws.close());
});

console.log(`Heartbeat Proxy Active: ${TARGET_HOST}:${TARGET_PORT}`);
