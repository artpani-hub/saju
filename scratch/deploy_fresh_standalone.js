const { Client } = require('ssh2');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

async function deployFresh() {
  console.log('Building local zip of full standalone app...');
  const zipPath = path.join(__dirname, '..', 'full_standalone.zip');
  if (fs.existsSync(zipPath)) fs.unlinkSync(zipPath);

  const localStandalone = path.join(__dirname, '..', '.next', 'standalone');
  const psCmd = `powershell -Command "Compress-Archive -Path '${localStandalone}\\*' -DestinationPath '${zipPath}' -Force"`;
  execSync(psCmd, { stdio: 'inherit' });
  console.log('Local standalone zip created!');

  const conn = new Client();
  await new Promise((res, rej) => conn.on('ready', res).on('error', rej).connect({
    host: '121.125.61.114',
    port: 22,
    username: 'artpani',
    privateKey: fs.readFileSync('C:\\Users\\user\\.ssh\\id_ed25519_121_125_61_114')
  }));

  const sftp = await new Promise((res, rej) => conn.sftp((err, s) => err ? rej(err) : res(s)));

  const remoteZip = '/tmp/full_standalone.zip';
  console.log(`SFTP Uploading ${zipPath} -> ${remoteZip}`);
  await new Promise((res, rej) => sftp.fastPut(zipPath, remoteZip, err => err ? rej(err) : res()));

  console.log('Unzipping to /tmp/clean_standalone and pointing PM2...');
  const remoteCmd = `
    rm -rf /tmp/clean_standalone && mkdir -p /tmp/clean_standalone
    unzip -o /tmp/full_standalone.zip -d /tmp/clean_standalone/
    
    # Copy prisma dev.db to clean standalone prisma
    mkdir -p /tmp/clean_standalone/prisma
    cp /home/www/saju-artpani/frontend/prisma/dev.db /tmp/clean_standalone/prisma/dev.db 2>/dev/null || true

    PM2_HOME=/home/www/saju-artpani/.pm2 pm2 delete saju-app 2>/dev/null || true
    PM2_HOME=/home/www/saju-artpani/.pm2 pm2 start /tmp/clean_standalone/server.js --name saju-app --cwd /tmp/clean_standalone --env PORT=3012
    PM2_HOME=/home/www/saju-artpani/.pm2 pm2 save
  `;

  const out = await execCmd(conn, remoteCmd);
  console.log('PM2 REDIRECT OUTPUT:\n', out);

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

deployFresh().catch(err => console.error('DEPLOY ERROR:', err));
