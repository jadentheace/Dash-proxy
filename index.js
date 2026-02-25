const tls = require('tls');
const WebSocket = require('ws');

const POOL_HOST = 'dash.viabtc.top';
const POOL_PORT = 443; 
const PORT = process.env.PORT || 10000;

const wss = new WebSocket.Server({ port: PORT }, () => {
    console.log(`UNIT_V208_ONLINE`);
});

wss.on('connection', (ws) => {
    const pool = tls.connect(POOL_PORT, POOL_HOST, { rejectUnauthorized: false }, () => {
        console.log('TUNNEL_STABILIZED');
    });

    ws.on('message', (msg) => {
        if (!pool.destroyed) pool.write(msg + '\n');
    });

    pool.on('data', (data) => {
        if (ws.readyState === WebSocket.OPEN) ws.send(data.toString());
    });

    // Send a keep-alive every 20 seconds to prevent ViaBTC from idling
    const heart = setInterval(() => {
        if (!pool.destroyed) pool.write('{"id":30,"method":"mining.noop","params":[]}\n');
    }, 20000);

    ws.on('close', () => { clearInterval(heart); pool.destroy(); });
    pool.on('error', () => pool.destroy());
});
