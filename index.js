const WebSocket = require('ws');
const tls = require('tls');

const POOL = { host: 'dash.viabtc.top', port: 443 };
const WALLET = "Xxo7XaZhnnkHz55mYSdQuGj93MWD3Bhcu1";

const wss = new WebSocket.Server({ port: process.env.PORT || 10000 });

wss.on('connection', (ws) => {
    let stratum = null;

    ws.on('message', (msg) => {
        if (msg.toString() === "POKE" && (!stratum || stratum.destroyed)) {
            stratum = tls.connect(POOL.port, POOL.host, { rejectUnauthorized: false }, () => {
                console.log('--- [ULTRA_BRIDGE_ESTABLISHED] ---');
                // Force Difficulty d=128 so the iPhone gets jobs instantly
                stratum.write(JSON.stringify({"id":1,"method":"mining.subscribe","params":[]}) + '\n');
                stratum.write(JSON.stringify({"id":2,"method":"mining.authorize","params":[WALLET + ".i14", "d=128"]}) + '\n');
            });

            stratum.on('data', (data) => {
                if (ws.readyState === WebSocket.OPEN) ws.send(data.toString());
            });
            stratum.on('error', (e) => console.log('POOL_ERR:', e.message));
        }

        if (stratum && stratum.writable && msg.toString() !== "POKE") {
            stratum.write(msg.toString().trim() + '\n');
        }
    });

    // Send a silent ping to Render every 20s to prevent 5-min timeout
    const pinger = setInterval(() => { if(ws.readyState === 1) ws.send('{"ping":1}'); }, 20000);
    ws.on('close', () => { clearInterval(pinger); if(stratum) stratum.destroy(); });
});
console.log('TITAN_V42_CHROMA_ONLINE');
