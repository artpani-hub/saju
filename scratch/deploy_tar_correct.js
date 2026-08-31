const { Client } = require('ssh2');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

async function deployTarCorrect() {
  console.log('Building clean tar.gz using wsl or node tar script...');
  const tarPath = path.join(__dirname, '..', 'clean_bundle.tar.gz');
  if (fs.existsSync(tarPath)) fs.unlinkSync(tarPath);

  // Archive local .next/server folder
  try {
    execSync(`tar -czf "${tarPath}" -C "${path.join(__dirname, '..', '.next')}" server`, { stdio: 'inherit' });
    console.log('Clean tar archive created successfully!');
  } catch (e) {
    console.error('Failed tar command:', e.message);
    return;
  }

  const conn = new Client();
  await new Promise((res, rej) => conn.on('ready', res).on('error', rej).connect({
    host: '121.125.61.114',
    port: 22,
    username: 'artpani',
    privateKey: fs.readFileSync('C:\\Users\\user\\.ssh\\id_ed25519_121_125_61_114')
  }));

  const sftp = await new Promise((res, rej) => conn.sftp((err, s) => err ? rej(err) : res(s)));

  const remoteTar = '/tmp/clean_bundle.tar.gz';
  console.log(`SFTP Uploading ${tarPath} -> ${remoteTar}`);
  await new Promise((res, rej) => sftp.fastPut(tarPath, remoteTar, err => err ? rej(err) : res()));
  console.log('Tar archive uploaded successfully!');

  console.log('Extracting tar archive on remote node server...');
  const remoteNodeCmd = `
    node -e "
      const { execSync } = require('child_process');
      const fs = require('fs');

      try {
        execSync('rm -rf /tmp/tar_server && mkdir -p /tmp/tar_server', { stdio: 'inherit' });
        execSync('tar -xzf /tmp/clean_bundle.tar.gz -C /tmp/tar_server/', { stdio: 'inherit' });
        
        console.log('Extracted tar. Now copying files with node...');
        
        const path = require('path');
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
              try {
                fs.chmodSync(dest, 0o777);
                const buf = fs.readFileSync(src);
                fs.writeFileSync(dest, buf, { flag: 'w' });
              } catch (e2) {
                console.error('Failed overwrite ' + dest + ':', e2.message);
              }
            }
          }
        }

        copyRecursive('/tmp/tar_server/server', '/home/www/saju-artpani/frontend/.next/standalone/.next/server');
        console.log('TAR_SYNC_FINISHED_SUCCESS');
      } catch (err) {
        console.error('TAR_ERR:', err.message);
      }
    "
  `;

  const out = await execCmd(conn, remoteNodeCmd);
  console.log('TAR SYNC OUTPUT:\n', out);

  console.log('Reloading saju-app PM2...');
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

deployTarCorrect().catch(err => console.error('DEPLOY ERROR:', err));
