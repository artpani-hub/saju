const { Client } = require('ssh2');
const fs = require('fs');

async function restoreCustomerAndOrderDb() {
  const conn = new Client();
  await new Promise((res, rej) => conn.on('ready', res).on('error', rej).connect({
    host: '121.125.61.114',
    port: 22,
    username: 'artpani',
    privateKey: fs.readFileSync('C:\\Users\\user\\.ssh\\id_ed25519_121_125_61_114')
  }));

  console.log('Linking 347 Users / 547 Orders Database into runtime environment...');

  const script = `
    # Copy 347 Users / 547 Orders DB into runtime environment
    mkdir -p /tmp/saju_runtime_frontend/prisma
    cp /tmp/saju_db_work/dev.db /tmp/saju_runtime_frontend/prisma/dev.db 2>/dev/null || true
    chmod 777 /tmp/saju_runtime_frontend/prisma/dev.db* 2>/dev/null || true

    # Update .env in /tmp/saju_runtime_frontend
    node -e "
      const fs = require('fs');
      const envPath = '/tmp/saju_runtime_frontend/.env';
      let content = fs.readFileSync(envPath, 'utf8');
      content = content.replace(/DATABASE_URL=.*/, 'DATABASE_URL=\"file:/tmp/saju_db_work/dev.db\"');
      try { fs.chmodSync(envPath, 0o666); } catch(e) {}
      fs.writeFileSync(envPath, content, 'utf8');
      console.log('ENV_DATABASE_URL_UPDATED_TO_REAL_DB');
    "

    # Reload PM2 process
    PM2_HOME=/home/www/saju-artpani/.pm2 pm2 reload saju-app || PM2_HOME=/home/www/saju-artpani/.pm2 pm2 restart saju-app
  `;

  const out = await execCmd(conn, script);
  console.log('RESTORE OUTPUT:\n', out);

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

restoreCustomerAndOrderDb().catch(err => console.error('ERROR:', err));
