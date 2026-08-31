const { Client } = require('ssh2');
const fs = require('fs');

async function bypassPermissionAndDeployArtpani() {
  const conn = new Client();
  await new Promise((res, rej) => conn.on('ready', res).on('error', rej).connect({
    host: '121.125.61.114',
    port: 22,
    username: 'artpani',
    privateKey: fs.readFileSync('C:\\Users\\user\\.ssh\\id_ed25519_121_125_61_114')
  }));

  const sftp = await new Promise((res, rej) => conn.sftp((err, s) => err ? rej(err) : res(s)));

  console.log('SFTP Uploading local src/app/artpani/page.js to /tmp/fresh_artpani_page.js...');

  await new Promise((res, rej) => {
    sftp.fastPut('src/app/artpani/page.js', '/tmp/fresh_artpani_page.js', err => err ? rej(err) : res());
  });

  console.log('Removing old page.js and replacing with fresh local artpani page.js...');

  const script = `
    # Move or remove old file
    mv /home/www/saju-artpani/frontend/src/app/artpani/page.js /home/www/saju-artpani/frontend/src/app/artpani/page.js.bak_\$(date +%s) 2>/dev/null || true
    rm -f /home/www/saju-artpani/frontend/src/app/artpani/page.js 2>/dev/null || true

    # Copy fresh page.js
    cp /tmp/fresh_artpani_page.js /home/www/saju-artpani/frontend/src/app/artpani/page.js
    chmod 666 /home/www/saju-artpani/frontend/src/app/artpani/page.js

    # Clean rebuild
    cd /home/www/saju-artpani/frontend &&
    rm -rf .next &&
    npx next build &&

    PM2_HOME=/home/www/saju-artpani/.pm2 pm2 delete saju-app 2>/dev/null || true
    PM2_HOME=/home/www/saju-artpani/.pm2 PORT=3012 pm2 start npm --name "saju-app" --cwd /home/www/saju-artpani/frontend -- start -- -p 3012
    PM2_HOME=/home/www/saju-artpani/.pm2 pm2 save
  `;

  const out = await execCmd(conn, script);
  console.log('BYPASS & REBUILD OUTPUT:\n', out);

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

bypassPermissionAndDeployArtpani().catch(err => console.error('ERROR:', err));
