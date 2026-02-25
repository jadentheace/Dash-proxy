const net = require('net');
const WebSocket = require('ws');

// STRICTLY VIABTC - DASH PORT 8888
const POOL_HOST = 'dash.viabtc.top';
const POOL_PORT = 8888; 
const PORT = process.env.PORT || 10000;

const wss = new WebSocket.Server({ port: PORT }, () => {
    console.log(`VIABTC_OMEGA_ACTIVE_${PORT}`);
});

wss.on('connection', (ws) => {
    const pool = new net.Socket();
    pool.setKeepAlive(true, 15000); // 15s heartbeat to stop ViaBTC timeouts

    pool.connect(POOL_PORT, POOL_HOST, () => {
        console.log('VIABTC_LINK_ESTABLISHED');
    });

    ws.on('message', (msg) => {
        if (pool.writable) pool.write(msg + '\n');
    });

    pool.on('data', (data) => {
        if (ws.readyState === WebSocket.OPEN) ws.send(data.toString());
    });

    ws.on('close', () => pool.destroy());
    pool.on('close', () => ws.close());
    pool.on('error', (err) => {
        console.log('VIA_BRIDGE_ERR:', err.message);
        pool.destroy();
    });
});
