const { Client } = require('ssh2');
const fs = require('fs');

async function deployCorrectFreeTo14900BarFlow() {
  const conn = new Client();
  await new Promise((res, rej) => conn.on('ready', res).on('error', rej).connect({
    host: '121.125.61.114',
    port: 22,
    username: 'artpani',
    privateKey: fs.readFileSync('C:\\Users\\user\\.ssh\\id_ed25519_121_125_61_114')
  }));

  const sftp = await new Promise((res, rej) => conn.sftp((err, s) => err ? rej(err) : res(s)));

  console.log('SFTP Uploading updated src/app/result/page.js showing 14900 KRW bar after free trial payment...');

  await new Promise((res, rej) => {
    sftp.fastPut('src/app/result/page.js', '/tmp/saju_runtime_frontend/src/app/result/page.js', err => err ? rej(err) : res());
  });

  console.log('Rebuilding runtime app with correct free trial to 14,900 KRW bar flow...');

  const script = `
    cd /tmp/saju_runtime_frontend &&
    rm -rf .next &&
    npx next build &&

    PM2_HOME=/home/www/saju-artpani/.pm2 pm2 delete saju-app 2>/dev/null || true
    PM2_HOME=/home/www/saju-artpani/.pm2 PORT=3012 pm2 start npm --name "saju-app" --cwd /tmp/saju_runtime_frontend -- start -- -p 3012
    PM2_HOME=/home/www/saju-artpani/.pm2 pm2 save
  `;

  const out = await execCmd(conn, script);
  console.log('FREE TRIAL TO 14900 FLOW DEPLOY OUTPUT:\n', out);

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

deployCorrectFreeTo14900BarFlow().catch(err => console.error('ERROR:', err));
