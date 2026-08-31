const { Client } = require('ssh2');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

async function zipDeploy() {
  console.log('Zipping .next/server folder using powershell...');
  const zipPath = path.join(__dirname, '..', 'server_bundle.zip');
  const nextServerPath = path.join(__dirname, '..', '.next', 'server');

  if (fs.existsSync(zipPath)) fs.unlinkSync(zipPath);

  const psCmd = `powershell -Command "Compress-Archive -Path '${nextServerPath}' -DestinationPath '${zipPath}' -Force"`;
  execSync(psCmd, { stdio: 'inherit' });
  console.log('Zip file created successfully!');

  const conn = new Client();
  await new Promise((res, rej) => conn.on('ready', res).on('error', rej).connect({
    host: '121.125.61.114',
    port: 22,
    username: 'artpani',
    privateKey: fs.readFileSync('C:\\Users\\user\\.ssh\\id_ed25519_121_125_61_114')
  }));

  const sftp = await new Promise((res, rej) => conn.sftp((err, s) => err ? rej(err) : res(s)));

  const remoteZip = '/tmp/server_bundle.zip';
  console.log(`SFTP Uploading ${zipPath} -> ${remoteZip}`);
  await new Promise((res, rej) => sftp.fastPut(zipPath, remoteZip, err => err ? rej(err) : res()));
  console.log('Zip file uploaded!');

  console.log('Unzipping and updating standalone server on remote...');
  const unzipperCmd = `
    node -e "
      const { execSync } = require('child_process');
      try {
        execSync('unzip -o /tmp/server_bundle.zip -d /home/www/saju-artpani/frontend/.next/standalone/.next/', { stdio: 'inherit' });
        console.log('UNZIP_SUCCESS');
      } catch (e) {
        console.error('UNZIP_ERR:', e.message);
      }
    "
  `;

  const output = await execCmd(conn, unzipperCmd);
  console.log('UNZIP OUTPUT:\n', output);

  console.log('Reloading real saju-app PM2...');
  const reloadOut = await execCmd(conn, 'PM2_HOME=/home/www/saju-artpani/.pm2 pm2 reload saju-app');
  console.log('RELOAD OUTPUT:\n', reloadOut);

  conn.end();
  console.log('🎉 ZIP DEPLOYMENT & PM2 RELOAD COMPLETED SUCCESSFULLY!');
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

zipDeploy().catch(err => console.error('DEPLOY ERROR:', err));
