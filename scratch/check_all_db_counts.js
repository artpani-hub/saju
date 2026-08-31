const { Client } = require('ssh2');
const fs = require('fs');

async function checkAllDbCounts() {
  const conn = new Client();
  await new Promise((res, rej) => conn.on('ready', res).on('error', rej).connect({
    host: '121.125.61.114',
    port: 22,
    username: 'artpani',
    privateKey: fs.readFileSync('C:\\Users\\user\\.ssh\\id_ed25519_121_125_61_114')
  }));

  console.log('Searching all DB paths on remote server for real customer/order data...');

  const script = `
    NODE_PATH=/home/www/saju-artpani/frontend/node_modules node -e "
      const { PrismaClient } = require('@prisma/client');
      const fs = require('fs');
      const path = require('path');

      const dbs = [
        '/home/www/saju-artpani/frontend/prisma/dev.db',
        '/home/www/saju-artpani/frontend/prisma/dev_real.db',
        '/home/www/artpani/backups/real_saju_backup_20260831104251/frontend/prisma/dev.db',
        '/tmp/saju_db_work/dev.db',
        '/tmp/local_dev.db'
      ];

      async function test() {
        for (const dbPath of dbs) {
          if (!fs.existsSync(dbPath)) {
            console.log('NOT EXISTS:', dbPath);
            continue;
          }
          try {
            const p = new PrismaClient({ datasources: { db: { url: 'file:' + dbPath } } });
            const userCount = await p.user.count();
            const orderCount = await p.order.count();
            const productCount = await p.product.count();
            console.log('DB_PATH:', dbPath, '| Users:', userCount, '| Orders:', orderCount, '| Products:', productCount);
            await p.\\$disconnect();
          } catch(e) {
            console.log('ERROR ON', dbPath, ':', e.message);
          }
        }
      }
      test();
    "
  `;

  const out = await execCmd(conn, script);
  console.log('DB COUNTS OUTPUT:\n', out);

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

checkAllDbCounts().catch(err => console.error('ERROR:', err));
