const { Client } = require('ssh2');
const fs = require('fs');

async function deployCleanRealDb() {
  const conn = new Client();
  await new Promise((res, rej) => conn.on('ready', res).on('error', rej).connect({
    host: '121.125.61.114',
    port: 22,
    username: 'artpani',
    privateKey: fs.readFileSync('C:\\Users\\user\\.ssh\\id_ed25519_121_125_61_114')
  }));

  console.log('Deploying clean real database and setting up standard PM2 process...');

  const script = `
    cd /home/www/saju-artpani/frontend &&

    # Copy local DB to dev_real.db with full 777 permissions
    cp /tmp/local_dev.db /home/www/saju-artpani/frontend/prisma/dev_real.db 2>/dev/null || true
    chmod 777 /home/www/saju-artpani/frontend/prisma/dev_real.db* 2>/dev/null || true

    # Point DATABASE_URL to dev_real.db in .env
    node -e "
      const fs = require('fs');
      const envPath = '/home/www/saju-artpani/frontend/.env';
      let content = fs.readFileSync(envPath, 'utf8');
      content = content.replace(/DATABASE_URL=.*/, 'DATABASE_URL=\"file:/home/www/saju-artpani/frontend/prisma/dev_real.db\"');
      try { fs.chmodSync(envPath, 0o666); } catch(e) {}
      fs.writeFileSync(envPath, content, 'utf8');
    "

    # Clean rebuild
    rm -rf .next
    npm run build

    # Restart PM2 using npm run start
    PM2_HOME=/home/www/saju-artpani/.pm2 pm2 delete saju-app 2>/dev/null || true
    PM2_HOME=/home/www/saju-artpani/.pm2 PORT=3012 pm2 start npm --name "saju-app" --cwd /home/www/saju-artpani/frontend -- start -- -p 3012
    PM2_HOME=/home/www/saju-artpani/.pm2 pm2 save
  `;

  const out = await execCmd(conn, script);
  console.log('CLEAN REAL DB & PM2 START OUTPUT:\n', out);

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

deployCleanRealDb().catch(err => console.error('ERROR:', err));
