const { Client } = require('ssh2');
const fs = require('fs');

async function testLiveProductsApiNode() {
  const conn = new Client();
  await new Promise((res, rej) => conn.on('ready', res).on('error', rej).connect({
    host: '121.125.61.114',
    port: 22,
    username: 'artpani',
    privateKey: fs.readFileSync('C:\\Users\\user\\.ssh\\id_ed25519_121_125_61_114')
  }));

  console.log('Testing live local HTTP call via Node.js http module...');

  const script = `
    node -e "
      const http = require('http');
      http.get('http://127.0.0.1:3012/api/admin/products', (res) => {
        let data = '';
        res.on('data', c => data += c);
        res.on('end', () => console.log('API_RESPONSE:', data));
      });
    "
  `;

  const out = await execCmd(conn, script);
  console.log('NODE HTTP TEST RESULT:\n', out);

  conn.end();
}

function execCmd(conn, cmd) {
  return new Promise((resolve, reject) => {
    conn.exec(cmd, (err, stream) => {
      if (err) return reject(err);
      let stdout = '';
      let stderr = '';
      stream.on('close', () => resolve(stdout + '\n' + stderr));
      stream.on('data', data => stdout += data.toString());
      stream.stderr.on('data', data => stderr += data.toString());
    });
  });
}

testLiveProductsApiNode().catch(err => console.error('ERROR:', err));
