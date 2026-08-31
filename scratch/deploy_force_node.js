const { Client } = require('ssh2');
const fs = require('fs');

async function forceDeployNode() {
  const conn = new Client();
  await new Promise((res, rej) => conn.on('ready', res).on('error', rej).connect({
    host: '121.125.61.114',
    port: 22,
    username: 'artpani',
    privateKey: fs.readFileSync('C:\\Users\\user\\.ssh\\id_ed25519_121_125_61_114')
  }));

  console.log('Running force node sync on remote server...');

  const remoteScript = `
    node -e "
      const { execSync } = require('child_process');
      const fs = require('fs');
      const path = require('path');

      try {
        execSync('rm -rf /tmp/unzipped_server && mkdir -p /tmp/unzipped_server', { stdio: 'inherit' });
        execSync('unzip -o /tmp/server_bundle.zip -d /tmp/unzipped_server/', { stdio: 'inherit' });
        
        function copyRecursive(src, dest) {
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
            } catch (err) {
              // If permission error, try chmod or fallback
              try {
                fs.chmodSync(dest, 0o777);
                const buf = fs.readFileSync(src);
                fs.writeFileSync(dest, buf, { flag: 'w' });
              } catch (e2) {
                console.error('Failed to overwrite ' + dest + ':', e2.message);
              }
            }
          }
        }

        const srcDir = '/tmp/unzipped_server/server';
        const destDir = '/home/www/saju-artpani/frontend/.next/standalone/.next/server';
        console.log('Force overwriting server bundles...');
        copyRecursive(srcDir, destDir);
        console.log('FORCE_COPY_COMPLETE');
      } catch (globalErr) {
        console.error('GLOBAL_ERR:', globalErr.message);
      }
    "
  `;

  const out = await execCmd(conn, remoteScript);
  console.log('FORCE COPY OUTPUT:\n', out);

  console.log('Reloading saju-app...');
  const reloadOut = await execCmd(conn, 'PM2_HOME=/home/www/saju-artpani/.pm2 pm2 reload saju-app');
  console.log('RELOAD OUTPUT:\n', reloadOut);

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

forceDeployNode().catch(err => console.error('DEPLOY ERROR:', err));
