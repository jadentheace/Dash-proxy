const WebSocket = require('ws');
const net = require('net');

const TARGET = { host: 'flex.mine.zpool.ca', port: 3581 };
const wss = new WebSocket.Server({ port: process.env.PORT || 8080 });

wss.on('connection', (ws) => {
    // Immediate log to verify iPhone touch
    console.log('!!! IPHONE_HARDWARE_LINK_DETECTED !!!');
    
    const stratum = new net.Socket();
    stratum.setKeepAlive(true, 5000);

    stratum.connect(TARGET.port, TARGET.host, () => {
        console.log('>>> SUCCESS: ZPOOL_BRIDGE_STABLE <<<');
    });

    ws.on('message', (m) => {
        if(stratum.writable) stratum.write(m + '\n');
    });

    stratum.on('data', (d) => {
        const dataStr = d.toString();
        // Log outgoing jobs to Render console for debugging
        if(dataStr.includes('mining.notify')) console.log('JOB_DISPATCHED_TO_PHONE');
        if (ws.readyState === WebSocket.OPEN) ws.send(dataStr);
    });

    stratum.on('error', (e) => console.log('STRATUM_ERR:', e.message));
    stratum.on('close', () => ws.close());
    ws.on('close', () => stratum.destroy());
});

console.log('PROXY_V22_ULTRA_FORCE_READY');
