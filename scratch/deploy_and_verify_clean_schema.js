const { Client } = require('ssh2');
const fs = require('fs');

async function deployAndVerifyCleanSchema() {
  const conn = new Client();
  await new Promise((res, rej) => conn.on('ready', res).on('error', rej).connect({
    host: '121.125.61.114',
    port: 22,
    username: 'artpani',
    privateKey: fs.readFileSync('C:\\Users\\user\\.ssh\\id_ed25519_121_125_61_114')
  }));

  const sftp = await new Promise((res, rej) => conn.sftp((err, s) => err ? rej(err) : res(s)));

  console.log('SFTP Uploading cleaned src/app/api/admin/products/route.js matching DB schema...');

  await new Promise((res, rej) => {
    sftp.fastPut('src/app/api/admin/products/route.js', '/tmp/saju_runtime_frontend/src/app/api/admin/products/route.js', err => err ? rej(err) : res());
  });

  console.log('Rebuilding runtime app with strict DB schema matching...');

  const script = `
    cd /tmp/saju_runtime_frontend &&
    rm -rf .next &&
    npx next build &&

    PM2_HOME=/home/www/saju-artpani/.pm2 pm2 delete saju-app 2>/dev/null || true
    PM2_HOME=/home/www/saju-artpani/.pm2 PORT=3012 pm2 start npm --name "saju-app" --cwd /tmp/saju_runtime_frontend -- start -- -p 3012
    PM2_HOME=/home/www/saju-artpani/.pm2 pm2 save

    sleep 3

    echo "=== EXECUTING LIVE HTTP PUT TEST ==="
    NODE_PATH=/tmp/saju_runtime_frontend/node_modules node -e "
      const http = require('http');
      const data = JSON.stringify({
        adminPassword: 'artpani1234',
        key: 'free_sample',
        id: '6169b6ad-72d7-488e-9654-4cdd1a2fd5e4',
        price: 2000,
        name: '사주 체험판 리포트'
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
        res.on('end', () => console.log('VERIFIED LIVE HTTP PUT RESULT:', res.statusCode, body));
      });

      req.on('error', e => console.error('REQ ERROR:', e));
      req.write(data);
      req.end();
    "
  `;

  const out = await execCmd(conn, script);
  console.log('CLEAN SCHEMA VERIFY DEPLOY OUTPUT:\n', out);

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

deployAndVerifyCleanSchema().catch(err => console.error('ERROR:', err));
