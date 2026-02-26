const WebSocket = require('ws');

// THE TARGET: Forced to Verus Community Pool
const TARGET_POOL = 'pool.verus.io:9998'; 

const wss = new WebSocket.Server({ port: process.env.PORT || 8080 });

wss.on('connection', (browserWs) => {
    console.log('--- TARGETING VERUS COMMUNITY POOL (PORT 9998) ---');

    // Create a direct TCP/Stratum connection to Verus, NOT Luckpool
    const poolSocket = new WebSocket(`ws://${TARGET_POOL}`);

    // Forward messages from your phone to the Verus pool
    browserWs.on('message', (message) => {
        if (poolSocket.readyState === WebSocket.OPEN) {
            poolSocket.send(message);
        }
    });

    // Forward jobs from the Verus pool back to your phone
    poolSocket.on('message', (data) => {
        if (browserWs.readyState === WebSocket.OPEN) {
            browserWs.send(data);
        }
    });

    poolSocket.on('open', () => {
        console.log('>> SUCCESS: UPLINK ESTABLISHED TO VERUS_POOL');
    });

    poolSocket.on('error', (err) => {
        console.error('>> POOL_CONNECTION_ERROR:', err.message);
    });

    browserWs.on('close', () => {
        poolSocket.close();
        console.log('--- CONNECTION TERMINATED ---');
    });
});

console.log('GOD_PROXY_ACTIVE ON PORT', process.env.PORT || 8080);
