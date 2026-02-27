const WebSocket = require('ws');
const tls = require('tls');

// ViaBTC Global - Optimized for high-frequency low-diff shares
const POOL = { host: 'dash.viabtc.top', port: 443 };
const WALLET = "Xxo7XaZhnnkHz55mYSdQuGj93MWD3Bhcu1";

const wss = new WebSocket.Server({ port: process.env.PORT || 10000 });

wss.on('connection', (ws) => {
    let stratum = null;

    ws.on('message', (msg) => {
        if (!stratum || stratum.destroyed) {
            stratum = tls.connect(POOL.port, POOL.host, { rejectUnauthorized: false }, () => {
                console.log('--- [ULTRA_LINK_ESTABLISHED] ---');
                
                // FORCE LOW DIFFICULTY (d=128) - This is the secret to instant jobs
                // md=128 ensures the pool never raises it back up
                const login = JSON.stringify({
                    "id":1, 
                    "method":"mining.authorize", 
                    "params":[WALLET + ".i14", "d=128,md=128"] 
                }) + '\n';
                
                stratum.write(JSON.stringify({"id":0,"method":"mining.subscribe","params":[]}) + '\n');
                stratum.write(login);
            });

            stratum.on('data', (data) => {
                if (ws.readyState === WebSocket.OPEN) ws.send(data.toString());
            });
            stratum.on('error', (e) => console.log('BRIDGE_ERR:', e.message));
        }

        if (stratum && stratum.writable && msg.toString().length > 10) {
            stratum.write(msg.toString().trim() + '\n');
        }
    });

    ws.on('close', () => { if(stratum) stratum.destroy(); });
});
console.log('TITAN_V41_CORE_ONLINE');
