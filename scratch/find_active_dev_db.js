const { Client } = require('ssh2');
const fs = require('fs');

async function findActiveDevDb() {
  const conn = new Client();
  await new Promise((res, rej) => conn.on('ready', res).on('error', rej).connect({
    host: '121.125.61.114',
    port: 22,
    username: 'artpani',
    privateKey: fs.readFileSync('C:\\Users\\user\\.ssh\\id_ed25519_121_125_61_114')
  }));

  console.log('Finding active dev.db locations and seeding all of them...');

  const script = `
    node -e "
      const { execSync } = require('child_process');
      const fs = require('fs');

      const dbs = [
        '/home/www/saju-artpani/frontend/prisma/dev.db',
        '/home/www/saju-artpani/frontend/.next/standalone/prisma/dev.db',
        '/tmp/clean_standalone/prisma/dev.db',
        '/tmp/saju_app_build/.next/standalone/prisma/dev.db'
      ];

      for (const target of dbs) {
        try {
          fs.chmodSync(target, 0o666);
        } catch(e) {}
        try {
          const buf = fs.readFileSync('/tmp/saju_db_work/dev.db');
          fs.writeFileSync(target, buf, { flag: 'w' });
          console.log('Successfully wrote seeded DB to: ' + target);
        } catch(e) {
          console.error('Failed to write to ' + target + ':', e.message);
        }
      }
    "

    PM2_HOME=/home/www/saju-artpani/.pm2 pm2 reload saju-app
  `;

  const out = await execCmd(conn, script);
  console.log('ALL DB OVERWRITE OUTPUT:\n', out);

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

findActiveDevDb().catch(err => console.error('ERROR:', err));
