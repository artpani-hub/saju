const { Client } = require('ssh2');
const fs = require('fs');

async function pointEnvToWorkDb() {
  const conn = new Client();
  await new Promise((res, rej) => conn.on('ready', res).on('error', rej).connect({
    host: '121.125.61.114',
    port: 22,
    username: 'artpani',
    privateKey: fs.readFileSync('C:\\Users\\user\\.ssh\\id_ed25519_121_125_61_114')
  }));

  console.log('Updating DATABASE_URL in remote .env to point to /tmp/saju_db_work/dev.db...');

  const script = `
    node -e "
      const fs = require('fs');
      const envPath = '/home/www/saju-artpani/frontend/.env';
      let content = fs.readFileSync(envPath, 'utf8');
      content = content.replace(/DATABASE_URL=.*/, 'DATABASE_URL=\"file:/tmp/saju_db_work/dev.db\"');
      try { fs.chmodSync(envPath, 0o666); } catch(e) {}
      fs.writeFileSync(envPath, content, 'utf8');
      console.log('ENV_UPDATED_SUCCESSFULLY');
    "

    PM2_HOME=/home/www/saju-artpani/.pm2 pm2 reload saju-app || PM2_HOME=/home/www/saju-artpani/.pm2 pm2 restart saju-app
  `;

  const out = await execCmd(conn, script);
  console.log('POINT ENV OUTPUT:\n', out);

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

pointEnvToWorkDb().catch(err => console.error('ERROR:', err));
