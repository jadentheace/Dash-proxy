const WebSocket = require('ws');
const tls = require('tls');

const POOL = { host: 'dash.viabtc.top', port: 443 };
const WALLET = "Xxo7XaZhnnkHz55mYSdQuGj93MWD3Bhcu1";

const wss = new WebSocket.Server({ port: process.env.PORT || 10000 });

wss.on('connection', (ws) => {
    console.log('--- [FINAL_STRIKE_UPLINK] ---');
    let stratum = null;
    let buffer = [];

    const connectPool = () => {
        stratum = tls.connect(POOL.port, POOL.host, { rejectUnauthorized: false }, () => {
            console.log('--- [HOT_LINK_ACTIVE] ---');
            // Force ultra-low difficulty and aggressive subscription
            stratum.write(JSON.stringify({"id":1,"method":"mining.subscribe","params":["Titan_V43"]}) + '\n');
            stratum.write(JSON.stringify({"id":2,"method":"mining.authorize","params":[WALLET + ".i14", "d=128,md=128"]}) + '\n');
        });

        stratum.on('data', (data) => {
            if (ws.readyState === WebSocket.OPEN) {
                ws.send(data.toString());
            }
        });

        stratum.on('error', (e) => {
            console.log('POOL_RECONNECTING...');
            setTimeout(connectPool, 2000);
        });
    };

    ws.on('message', (msg) => {
        const cmd = msg.toString();
        if (cmd === "POKE") {
            if (!stratum) connectPool();
        } else if (stratum && stratum.writable) {
            stratum.write(cmd.trim() + '\n');
        }
    });

    // Anti-Idle Heartbeat (Every 15s)
    const heart = setInterval(() => { if(ws.readyState === 1) ws.send('{"h":1}'); }, 15000);
    ws.on('close', () => { clearInterval(heart); if(stratum) stratum.destroy(); });
});
console.log('TITAN_V43_ULTIMATE_ONLINE');
