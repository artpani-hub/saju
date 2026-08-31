const { Client } = require('ssh2');
const fs = require('fs');

async function switchToStandardNextStart() {
  const conn = new Client();
  await new Promise((res, rej) => conn.on('ready', res).on('error', rej).connect({
    host: '121.125.61.114',
    port: 22,
    username: 'artpani',
    privateKey: fs.readFileSync('C:\\Users\\user\\.ssh\\id_ed25519_121_125_61_114')
  }));

  const sftp = await new Promise((res, rej) => conn.sftp((err, s) => err ? rej(err) : res(s)));

  console.log('Uploading local DB and latest source files to remote...');

  // Upload local db to /tmp/local_dev.db
  await new Promise((res, rej) => {
    sftp.fastPut('prisma/dev.db', '/tmp/local_dev.db', err => err ? rej(err) : res());
  });

  console.log('Building Next.js in standard mode and starting via PM2 next start...');

  const script = `
    cd /home/www/saju-artpani/frontend &&

    # Overwrite DB with local seeded DB
    chmod 777 prisma 2>/dev/null || true
    cp /tmp/local_dev.db /home/www/saju-artpani/frontend/prisma/dev.db 2>/dev/null || cat /tmp/local_dev.db > /home/www/saju-artpani/frontend/prisma/dev.db 2>/dev/null || true
    chmod 666 /home/www/saju-artpani/frontend/prisma/dev.db* 2>/dev/null || true

    # Fix .env DATABASE_URL
    node -e "
      const fs = require('fs');
      const envPath = '/home/www/saju-artpani/frontend/.env';
      let content = fs.readFileSync(envPath, 'utf8');
      content = content.replace(/DATABASE_URL=.*/, 'DATABASE_URL=\"file:/home/www/saju-artpani/frontend/prisma/dev.db\"');
      try { fs.chmodSync(envPath, 0o666); } catch(e) {}
      fs.writeFileSync(envPath, content, 'utf8');
    "

    # Clean rebuild in frontend
    rm -rf .next
    npm run build

    # Delete PM2 standalone process and start standard Next server on port 3012
    PM2_HOME=/home/www/saju-artpani/.pm2 pm2 delete saju-app 2>/dev/null || true
    PM2_HOME=/home/www/saju-artpani/.pm2 PORT=3012 pm2 start "npx next start -p 3012" --name saju-app --cwd /home/www/saju-artpani/frontend
    PM2_HOME=/home/www/saju-artpani/.pm2 pm2 save
  `;

  const out = await execCmd(conn, script);
  console.log('STANDARD BUILD & RESTART OUTPUT:\n', out);

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

switchToStandardNextStart().catch(err => console.error('ERROR:', err));
