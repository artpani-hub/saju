const { Client } = require('ssh2');
const fs = require('fs');

async function deployInputFixToRuntime() {
  const conn = new Client();
  await new Promise((res, rej) => conn.on('ready', res).on('error', rej).connect({
    host: '121.125.61.114',
    port: 22,
    username: 'artpani',
    privateKey: fs.readFileSync('C:\\Users\\user\\.ssh\\id_ed25519_121_125_61_114')
  }));

  const sftp = await new Promise((res, rej) => conn.sftp((err, s) => err ? rej(err) : res(s)));

  console.log('SFTP Uploading fresh local src/app/input/page.js to /tmp/saju_runtime_frontend/src/app/input/page.js...');
  
  await new Promise((res, rej) => {
    sftp.fastPut('src/app/input/page.js', '/tmp/saju_runtime_frontend/src/app/input/page.js', err => err ? rej(err) : res());
  });

  console.log('Verifying 1,000 KRW free sample price in runtime input page...');

  const script = `
    grep -n "reportGrade === \\"free\\" ? 1000" /tmp/saju_runtime_frontend/src/app/input/page.js | head -n 3

    cd /tmp/saju_runtime_frontend &&
    rm -rf .next &&
    npx next build &&

    PM2_HOME=/home/www/saju-artpani/.pm2 pm2 delete saju-app 2>/dev/null || true
    PM2_HOME=/home/www/saju-artpani/.pm2 PORT=3012 pm2 start npm --name "saju-app" --cwd /tmp/saju_runtime_frontend -- start -- -p 3012
    PM2_HOME=/home/www/saju-artpani/.pm2 pm2 save
  `;

  const out = await execCmd(conn, script);
  console.log('INPUT FIX RUNTIME REBUILD OUTPUT:\n', out);

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

deployInputFixToRuntime().catch(err => console.error('ERROR:', err));
