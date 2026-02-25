const tls = require('tls');
const WebSocket = require('ws');

// Explicitly targeting the secure stratum port
const POOL_HOST = 'dash.viabtc.top';
const POOL_PORT = 443; 
const PORT = process.env.PORT || 10000;

const wss = new WebSocket.Server({ port: PORT }, () => {
    console.log(`V213_LIVE_BRIDGE_ACTIVE_ON_${PORT}`);
});

wss.on('connection', (ws) => {
    // Create the secure outbound tunnel
    const pool = tls.connect(POOL_PORT, POOL_HOST, { rejectUnauthorized: false }, () => {
        console.log('>>> TUNNEL_OUTBOUND_ESTABLISHED');
    });

    ws.on('message', (msg) => {
        // Forward iPhone data to ViaBTC
        if (!pool.destroyed) {
            pool.write(msg + '\n');
            console.log('TX_POOL:', msg.toString().trim());
        }
    });

    pool.on('data', (data) => {
        // Forward ViaBTC data to iPhone
        if (ws.readyState === WebSocket.OPEN) {
            ws.send(data.toString());
            console.log('RX_POOL:', data.toString().trim());
        }
    });

    ws.on('close', () => pool.destroy());
    pool.on('error', (e) => console.log('BRIDGE_ERR:', e.message));
});
