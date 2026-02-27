const WebSocket = require('ws');
const tls = require('tls');

// VIA_BTC DASH SSL (Port 443 is best for avoiding Render firewalls)
const POOL = { host: 'dash.viabtc.top', port: 443 };
const WALLET = "Xxo7XaZhnnkHz55mYSdQuGj93MWD3Bhcu1";

const wss = new WebSocket.Server({ port: process.env.PORT || 10000 });

wss.on('connection', (ws) => {
    console.log('--- [!] IPHONE_HANDSHAKE_RECEIVED ---');
    let stratum = null;

    ws.on('message', (msg) => {
        // Only open the pool connection when the phone actually pokes us
        if (!stratum || stratum.destroyed) {
            stratum = tls.connect(POOL.port, POOL.host, { rejectUnauthorized: false }, () => {
                console.log('--- [SUCCESS] VIABTC_BRIDGE_ACTIVE ---');
                stratum.write(JSON.stringify({"id":1,"method":"mining.subscribe","params":[]}) + '\n');
                stratum.write(JSON.stringify({"id":2,"method":"mining.authorize","params":[WALLET + ".i14", "x"]}) + '\n');
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

    ws.on('close', () => { if(stratum) stratum.destroy(); });
});
console.log('V39_STABLE_DASH_BRIDGE_ONLINE');
