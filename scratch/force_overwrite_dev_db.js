const { Client } = require('ssh2');
const fs = require('fs');

async function forceOverwriteDevDb() {
  const conn = new Client();
  await new Promise((res, rej) => conn.on('ready', res).on('error', rej).connect({
    host: '121.125.61.114',
    port: 22,
    username: 'artpani',
    privateKey: fs.readFileSync('C:\\Users\\user\\.ssh\\id_ed25519_121_125_61_114')
  }));

  console.log('Force overwriting /home/www/saju-artpani/frontend/prisma/dev.db...');

  const script = `
    node -e "
      const fs = require('fs');
      try {
        const seededBuf = fs.readFileSync('/tmp/saju_db_work/dev.db');
        const targetPath = '/home/www/saju-artpani/frontend/prisma/dev.db';
        try { fs.chmodSync(targetPath, 0o777); } catch(e) {}
        fs.writeFileSync(targetPath, seededBuf, { flag: 'w' });
        console.log('FORCE_WRITE_DATABASE_SUCCESS');
      } catch (err) {
        console.error('FORCE_WRITE_ERR:', err.message);
      }
    "

    PM2_HOME=/home/www/saju-artpani/.pm2 pm2 reload saju-app || PM2_HOME=/home/www/saju-artpani/.pm2 pm2 restart saju-app
  `;

  const out = await execCmd(conn, script);
  console.log('FORCE WRITE OUTPUT:\n', out);

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

forceOverwriteDevDb().catch(err => console.error('ERROR:', err));
