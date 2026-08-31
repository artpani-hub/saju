const { Client } = require('ssh2');
const fs = require('fs');

async function deployFullDynamicPriceLinking() {
  const conn = new Client();
  await new Promise((res, rej) => conn.on('ready', res).on('error', rej).connect({
    host: '121.125.61.114',
    port: 22,
    username: 'artpani',
    privateKey: fs.readFileSync('C:\\Users\\user\\.ssh\\id_ed25519_121_125_61_114')
  }));

  const sftp = await new Promise((res, rej) => conn.sftp((err, s) => err ? rej(err) : res(s)));

  console.log('SFTP Uploading updated input/page.js and products/route.js...');

  await new Promise((res, rej) => {
    sftp.fastPut('src/app/input/page.js', '/tmp/saju_runtime_frontend/src/app/input/page.js', err => err ? rej(err) : res());
  });
  await new Promise((res, rej) => {
    sftp.fastPut('src/app/api/products/route.js', '/tmp/saju_runtime_frontend/src/app/api/products/route.js', err => err ? rej(err) : res());
  });

  console.log('Rebuilding runtime app with 100% dynamic DB price linking...');

  const script = `
    cd /tmp/saju_runtime_frontend &&
    rm -rf .next &&
    npx next build &&

    PM2_HOME=/home/www/saju-artpani/.pm2 pm2 delete saju-app 2>/dev/null || true
    PM2_HOME=/home/www/saju-artpani/.pm2 PORT=3012 pm2 start npm --name "saju-app" --cwd /tmp/saju_runtime_frontend -- start -- -p 3012
    PM2_HOME=/home/www/saju-artpani/.pm2 pm2 save

    sleep 3

    echo "=== VERIFYING DYNAMIC DB PRICE FETCH ==="
    NODE_PATH=/tmp/saju_runtime_frontend/node_modules node -e "
      const http = require('http');
      http.get('http://127.0.0.1:3012/api/products', (res) => {
        let body = '';
        res.on('data', chunk => body += chunk);
        res.on('end', () => {
          const parsed = JSON.parse(body);
          console.log('PUBLIC PRODUCTS LIST FROM DB:', parsed.products.map(p => ({ id: p.id, key: p.key, reportType: p.reportType, price: p.price })));
        });
      });
    "
  `;

  const out = await execCmd(conn, script);
  console.log('DYNAMIC LINKING DEPLOY OUTPUT:\n', out);

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

deployFullDynamicPriceLinking().catch(err => console.error('ERROR:', err));
