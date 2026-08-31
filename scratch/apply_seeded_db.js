const { Client } = require('ssh2');
const fs = require('fs');

async function applySeededDb() {
  const conn = new Client();
  await new Promise((res, rej) => conn.on('ready', res).on('error', rej).connect({
    host: '121.125.61.114',
    port: 22,
    username: 'artpani',
    privateKey: fs.readFileSync('C:\\Users\\user\\.ssh\\id_ed25519_121_125_61_114')
  }));

  console.log('Applying seeded DB to production application...');

  const script = `
    # Force copy seeded database into frontend/prisma and standalone/prisma
    rm -f /home/www/saju-artpani/frontend/prisma/dev.db 2>/dev/null || true
    cp /tmp/saju_db_work/dev.db /home/www/saju-artpani/frontend/prisma/dev.db 2>/dev/null || true

    mkdir -p /home/www/saju-artpani/frontend/.next/standalone/prisma
    rm -f /home/www/saju-artpani/frontend/.next/standalone/prisma/dev.db 2>/dev/null || true
    cp /tmp/saju_db_work/dev.db /home/www/saju-artpani/frontend/.next/standalone/prisma/dev.db 2>/dev/null || true

    PM2_HOME=/home/www/saju-artpani/.pm2 pm2 reload saju-app || PM2_HOME=/home/www/saju-artpani/.pm2 pm2 restart saju-app
  `;

  const out = await execCmd(conn, script);
  console.log('APPLY DB OUTPUT:\n', out);

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

applySeededDb().catch(err => console.error('ERROR:', err));
