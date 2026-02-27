const WebSocket = require('ws');
const net = require('net');

// TARGETING THE EXACT FLEX PORT YOU DISCOVERED
const TARGET_HOST = 'flex.mine.zpool.ca';
const TARGET_PORT = 3581;

const wss = new WebSocket.Server({ port: process.env.PORT || 8080 });

wss.on('connection', (ws) => {
    console.log('--- NEW_PHONE_LINK_ESTABLISHED ---');

    // Open a direct TCP pipe to the Flex pool
    const stratum = new net.Socket();

    stratum.connect(TARGET_PORT, TARGET_HOST, () => {
        console.log('--- CONNECTED_TO_ZPOOL_FLEX_STRATUM ---');
    });

    // Pass data from Phone to Zpool
    ws.on('message', (buffer) => {
        stratum.write(buffer + '\n');
    });

    // Pass data from Zpool back to Phone
    stratum.on('data', (data) => {
        if (ws.readyState === WebSocket.OPEN) {
            ws.send(data.toString());
        }
    });

    stratum.on('error', (err) => {
        console.log('TCP_STRATUM_ERROR:', err.message);
        ws.close();
    });

    ws.on('close', () => {
        stratum.destroy();
        console.log('LINK_TERMINATED');
    });
});

console.log('DASH_PROXY_V14_PIPELINE_ACTIVE');
