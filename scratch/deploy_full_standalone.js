const { Client } = require('ssh2');
const fs = require('fs');
const path = require('path');

async function syncFullStandalone() {
  console.log('Syncing full local .next/standalone to remote...');

  const conn = new Client();
  await new Promise((resolve, reject) => {
    conn.on('ready', resolve).on('error', reject).connect({
      host: '121.125.61.114',
      port: 22,
      username: 'artpani',
      privateKey: fs.readFileSync('C:\\Users\\user\\.ssh\\id_ed25519_121_125_61_114')
    });
  });

  const sftp = await new Promise((resolve, reject) => {
    conn.sftp((err, s) => err ? reject(err) : resolve(s));
  });

  const localBase = path.join(__dirname, '..', '.next');
  const remoteBase = '/home/www/saju-artpani/frontend/.next/standalone/.next';

  // Recursive upload helper
  async function uploadDir(localDir, remoteDir) {
    await execCmd(conn, `mkdir -p "${remoteDir}"`);
    const entries = fs.readdirSync(localDir, { withFileTypes: true });

    for (const entry of entries) {
      const lPath = path.join(localDir, entry.name);
      const rPath = `${remoteDir}/${entry.name}`;

      if (entry.isDirectory()) {
        await uploadDir(lPath, rPath);
      } else {
        await new Promise((res, rej) => {
          sftp.fastPut(lPath, rPath, err => err ? rej(err) : res());
        });
      }
    }
  }

  console.log('Uploading .next build artifacts...');
  await uploadDir(localBase, remoteBase);

  console.log('Reloading PM2 saju-app...');
  const reloadOut = await execCmd(conn, 'PM2_HOME=/home/www/saju-artpani/.pm2 pm2 reload saju-app');
  console.log('PM2 Reload Result:\n', reloadOut);

  conn.end();
  console.log('FULL SYNC COMPLETED SUCCESSFULLY!');
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

syncFullStandalone().catch(err => console.error('SYNC ERROR:', err));
