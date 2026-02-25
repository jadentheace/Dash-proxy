const net = require('net');
const WebSocket = require('ws');

const TARGET_HOST = 'randomx.mine.zpool.ca';
const TARGET_PORT = 6234; 
const PROXY_PORT = process.env.PORT || 8080;

const wss = new WebSocket.Server({ port: PROXY_PORT });

wss.on('connection', (ws) => {
    let stratum = null;

    const connectStratum = () => {
        if (stratum) stratum.destroy();
        stratum = net.createConnection(TARGET_PORT, TARGET_HOST);

        stratum.on('data', (data) => {
            if (ws.readyState === WebSocket.OPEN) {
                ws.send(data.toString());
            }
            // SESSION_GLITCH: If the pool sends a job, we prep for a reset to stay "New"
            if (data.toString().includes('mining.notify')) {
                console.log("INITIAL_JOB_GULPED: Resetting for next high-priority dump...");
            }
        });

        stratum.on('error', () => setTimeout(connectStratum, 1000));
    };

    connectStratum();

    ws.on('message', (msg) => {
        if (stratum) stratum.write(msg + '\n');
    });

    ws.on('close', () => { if (stratum) stratum.destroy(); });
});
