const { Client } = require('ssh2');
const fs = require('fs');

async function deployArtpaniFix() {
  const conn = new Client();
  await new Promise((res, rej) => conn.on('ready', res).on('error', rej).connect({
    host: '121.125.61.114',
    port: 22,
    username: 'artpani',
    privateKey: fs.readFileSync('C:\\Users\\user\\.ssh\\id_ed25519_121_125_61_114')
  }));

  const sftp = await new Promise((res, rej) => conn.sftp((err, s) => err ? rej(err) : res(s)));

  console.log('SFTP Uploading updated src/app/artpani/page.js to remote...');
  await new Promise((res, rej) => {
    sftp.fastPut('src/app/artpani/page.js', '/tmp/saju_deploy_new/src/app/artpani/page.js', err => err ? rej(err) : res());
  });

  console.log('Applying updated artpani page.js and rebuilding production app...');

  const script = `
    cp -f /tmp/saju_deploy_new/src/app/artpani/page.js /home/www/saju-artpani/frontend/src/app/artpani/page.js 2>/dev/null || true
    
    cd /home/www/saju-artpani/frontend &&
    mv .next .next_bak_\$(date +%s) 2>/dev/null || true &&
    mkdir -p .next &&
    chmod 777 .next &&
    npx next build &&
    PM2_HOME=/home/www/saju-artpani/.pm2 pm2 reload saju-app || PM2_HOME=/home/www/saju-artpani/.pm2 pm2 restart saju-app
  `;

  const out = await execCmd(conn, script);
  console.log('REBUILD OUTPUT:\n', out);

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

deployArtpaniFix().catch(err => console.error('ERROR:', err));
