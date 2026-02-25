const tls = require('tls');
const WebSocket = require('ws');

const POOL_HOST = 'dash.viabtc.top';
const POOL_PORT = 443; 
const PORT = process.env.PORT || 10000;

const wss = new WebSocket.Server({ port: PORT }, () => {
    console.log(`GHOST_NODE_ON_${PORT}`);
});

wss.on('connection', (ws) => {
    const pool = tls.connect(POOL_PORT, POOL_HOST, { rejectUnauthorized: false }, () => {
        console.log('ENCRYPTED_HANDSHAKE_SUCCESS');
    });

    ws.on('message', (msg) => {
        if (!pool.destroyed) pool.write(msg + '\n');
    });

    pool.on('data', (data) => {
        if (ws.readyState === WebSocket.OPEN) ws.send(data.toString());
    });

    // 15s Heartbeat to keep ViaBTC from dropping the ghost link
    const pulse = setInterval(() => {
        if (!pool.destroyed) pool.write('{"id":20,"method":"mining.noop","params":[]}\n');
    }, 15000);

    ws.on('close', () => { clearInterval(pulse); pool.destroy(); });
    pool.on('error', () => pool.destroy());
});
