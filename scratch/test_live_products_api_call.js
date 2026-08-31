const { Client } = require('ssh2');
const fs = require('fs');

async function testLiveProductsApiCall() {
  const conn = new Client();
  await new Promise((res, rej) => conn.on('ready', res).on('error', rej).connect({
    host: '121.125.61.114',
    port: 22,
    username: 'artpani',
    privateKey: fs.readFileSync('C:\\Users\\user\\.ssh\\id_ed25519_121_125_61_114')
  }));

  console.log('Testing live local HTTP call to http://127.0.0.1:3012/api/admin/products...');

  const script = `
    curl -s http://127.0.0.1:3012/api/admin/products
  `;

  const out = await execCmd(conn, script);
  console.log('LIVE PRODUCTS API RESPONSE:\n', out);

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

testLiveProductsApiCall().catch(err => console.error('ERROR:', err));
