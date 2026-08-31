const { Client } = require('ssh2');
const fs = require('fs');

async function restoreNext100Percent() {
  const conn = new Client();
  await new Promise((res, rej) => conn.on('ready', res).on('error', rej).connect({
    host: '121.125.61.114',
    port: 22,
    username: 'artpani',
    privateKey: fs.readFileSync('C:\\Users\\user\\.ssh\\id_ed25519_121_125_61_114')
  }));

  console.log('Restoring 100% original working .next directory from backup...');

  const script = `
    node -e "
      const { execSync } = require('child_process');
      const fs = require('fs');

      try {
        const srcDir = '/home/www/artpani/backups/real_saju_backup_20260831104251/src_bak';
        const destDir = '/home/www/saju-artpani/frontend/src';
        
        function copyRecursive(src, dest) {
          if (!fs.existsSync(src)) return;
          const stats = fs.statSync(src);
          if (stats.isDirectory()) {
            if (!fs.existsSync(dest)) {
              try { fs.mkdirSync(dest, { recursive: true }); } catch (e) {}
            }
            const entries = fs.readdirSync(src);
            for (const entry of entries) {
              copyRecursive(path.join(src, entry), path.join(dest, entry));
            }
          } else {
            try {
              const buf = fs.readFileSync(src);
              fs.writeFileSync(dest, buf, { flag: 'w' });
            } catch (err) {}
          }
        }

        const path = require('path');
        copyRecursive(srcDir, destDir);
        console.log('SRC_RESTORE_DONE');
      } catch (e) {
        console.error('RESTORE_ERR:', e.message);
      }
    "

    # Restore PM2 to point to original standalone
    PM2_HOME=/home/www/saju-artpani/.pm2 pm2 delete saju-app 2>/dev/null || true
    PM2_HOME=/home/www/saju-artpani/.pm2 PORT=3012 pm2 start /home/www/saju-artpani/frontend/.next/standalone/server.js --name saju-app --cwd /home/www/saju-artpani/frontend/.next/standalone
    PM2_HOME=/home/www/saju-artpani/.pm2 pm2 save
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

restoreNext100Percent().catch(err => console.error('RESTORE ERROR:', err));
