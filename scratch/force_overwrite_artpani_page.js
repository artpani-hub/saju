const { Client } = require('ssh2');
const fs = require('fs');

async function forceOverwriteArtpaniPage() {
  const conn = new Client();
  await new Promise((res, rej) => conn.on('ready', res).on('error', rej).connect({
    host: '121.125.61.114',
    port: 22,
    username: 'artpani',
    privateKey: fs.readFileSync('C:\\Users\\user\\.ssh\\id_ed25519_121_125_61_114')
  }));

  const sftp = await new Promise((res, rej) => conn.sftp((err, s) => err ? rej(err) : res(s)));

  console.log('Force chmodding and uploading local src/app/artpani/page.js to remote...');

  // Upload local page.js to /tmp/local_artpani_page.js first
  await new Promise((res, rej) => {
    sftp.fastPut('src/app/artpani/page.js', '/tmp/local_artpani_page.js', err => err ? rej(err) : res());
  });

  const script = `
    # Force overwrite /home/www/saju-artpani/frontend/src/app/artpani/page.js
    node -e "
      const fs = require('fs');
      const srcBuf = fs.readFileSync('/tmp/local_artpani_page.js');
      const target = '/home/www/saju-artpani/frontend/src/app/artpani/page.js';
      try { fs.chmodSync(target, 0o666); } catch(e) {}
      fs.writeFileSync(target, srcBuf, { flag: 'w' });
      console.log('ARTPANI_PAGE_OVERWRITTEN_SUCCESSFULLY');
    "

    # Also upload next.config.mjs to ensure no standalone conflict
    node -e "
      const fs = require('fs');
      const envPath = '/home/www/saju-artpani/frontend/next.config.mjs';
      try { fs.chmodSync(envPath, 0o666); } catch(e) {}
      fs.writeFileSync(envPath, '/** @type {import(\\'next\\').NextConfig} */\\nconst nextConfig = {};\\nexport default nextConfig;\\n', 'utf8');
    "

    cd /home/www/saju-artpani/frontend &&
    rm -rf .next &&
    npx next build &&

    PM2_HOME=/home/www/saju-artpani/.pm2 pm2 delete saju-app 2>/dev/null || true
    PM2_HOME=/home/www/saju-artpani/.pm2 PORT=3012 pm2 start npm --name "saju-app" --cwd /home/www/saju-artpani/frontend -- start -- -p 3012
    PM2_HOME=/home/www/saju-artpani/.pm2 pm2 save
  `;

  const out = await execCmd(conn, script);
  console.log('OVERWRITE & REBUILD OUTPUT:\n', out);

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

forceOverwriteArtpaniPage().catch(err => console.error('ERROR:', err));
