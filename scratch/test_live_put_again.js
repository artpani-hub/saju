const { Client } = require('ssh2');
const fs = require('fs');

async function testLivePutAgain() {
  const conn = new Client();
  await new Promise((res, rej) => conn.on('ready', res).on('error', rej).connect({
    host: '121.125.61.114',
    port: 22,
    username: 'artpani',
    privateKey: fs.readFileSync('C:\\Users\\user\\.ssh\\id_ed25519_121_125_61_114')
  }));

  console.log('Running HTTP PUT test after PM2 warm up...');

  const script = `
    NODE_PATH=/tmp/saju_runtime_frontend/node_modules node -e "
      const http = require('http');
      const data = JSON.stringify({
        adminPassword: 'artpani1234',
        key: 'free_sample',
        id: '6169b6ad-72d7-488e-9654-4cdd1a2fd5e4',
        price: 2000,
        name: '사주 체험판 리포트',
        tag: '인기 체험',
        badge: '인기',
        isSale: true,
        description: '혜안당 사주 오행 핵심 분석'
      });

      const req = http.request({
        hostname: '127.0.0.1',
        port: 3012,
        path: '/api/admin/products',
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(data)
        }
      }, (res) => {
        let body = '';
        res.on('data', chunk => body += chunk);
        res.on('end', () => console.log('LIVE HTTP PUT FINAL TEST RESULT:', res.statusCode, body));
      });

      req.on('error', e => console.error('REQ ERROR:', e));
      req.write(data);
      req.end();
    "
  `;

  const out = await execCmd(conn, script);
  console.log('FINAL PUT TEST OUTPUT:\n', out);

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

testLivePutAgain().catch(err => console.error('ERROR:', err));
