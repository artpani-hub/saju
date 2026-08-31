const fs = require('fs');
const path = require('path');
const os = require('os');
const { Client } = require('ssh2');

const keyPath1 = path.join(os.homedir(), '.ssh', 'id_ed25519_121_125_61_114');
const privateKey = fs.readFileSync(keyPath1);

const candidates = [
  { username: 'artpani', password: 'Artpani!2026_x' },
  { username: 'saju-artpani', password: 'Artpani!2026_x' },
  { username: 'root', password: 'Artpani!2026_x' },
  { username: 'saju-artpani', privateKey },
  { username: 'artpani', privateKey },
  { username: 'root', privateKey }
];

async function testUser(config) {
  return new Promise((resolve) => {
    const conn = new Client();
    conn.on('ready', () => {
      console.log(`SUCCESS! Connected with config: user=${config.username}, method=${config.password ? 'password' : 'key'}`);
      conn.end();
      resolve(true);
    }).on('error', (err) => {
      console.log(`Failed for user=${config.username}, method=${config.password ? 'password' : 'key'}: ${err.message}`);
      resolve(false);
    }).connect({
      host: '121.125.61.114',
      port: 22,
      ...config
    });
  });
}

async function runAll() {
  for (const c of candidates) {
    const ok = await testUser(c);
    if (ok) break;
  }
}

runAll();
