const { Client } = require('ssh2');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

async function deployTar() {
  console.log('Archiving local .next folder to tar.gz...');
  const tarPath = path.join(__dirname, '..', 'next_build.tar.gz');
  
  try {
    execSync(`tar -czf "${tarPath}" -C "${path.join(__dirname, '..')}" .next`, { stdio: 'inherit' });
    console.log('Tar archive created successfully!');
  } catch (e) {
    console.error('Failed to create tar archive:', e.message);
    return;
  }

  const conn = new Client();
  await new Promise((resolve, reject) => {
    conn.on('ready', resolve).on('error', reject).connect({
      host: '121.125.61.114',
      port: 22,
      username: 'artpani',
      privateKey: fs.readFileSync('C:\\Users\\user\\.ssh\\id_ed25519_121_125_61_114')
    });
  });

  console.log('SSH Connection Ready for Tar Deploy...');

  const sftp = await new Promise((resolve, reject) => {
    conn.sftp((err, s) => err ? reject(err) : resolve(s));
  });

  const remoteTarPath = '/tmp/next_build.tar.gz';
  console.log(`SFTP Uploading ${tarPath} -> ${remoteTarPath}`);
  
  await new Promise((res, rej) => {
    sftp.fastPut(tarPath, remoteTarPath, err => err ? rej(err) : res());
  });
  console.log('Tar archive uploaded to remote /tmp.');

  console.log('Extracting tar archive into standalone directory...');
  const extractCmd = `
    node -e "
      const { execSync } = require('child_process');
      try {
        execSync('tar -xzf /tmp/next_build.tar.gz -C /home/www/saju-artpani/frontend/.next/standalone/', { stdio: 'inherit' });
        console.log('EXTRACT_SUCCESS');
      } catch (e) {
        console.error('EXTRACT_ERR:', e.message);
      }
    "
  `;

  const extractOut = await execCmd(conn, extractCmd);
  console.log('EXTRACT OUTPUT:\n', extractOut);

  console.log('Reloading real saju-app PM2...');
  const reloadOut = await execCmd(conn, 'PM2_HOME=/home/www/saju-artpani/.pm2 pm2 reload saju-app');
  console.log('RELOAD OUTPUT:\n', reloadOut);

  conn.end();
  console.log('🎉 TAR DEPLOYMENT & PM2 RELOAD COMPLETED SUCCESSFULLY!');
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

deployTar().catch(err => console.error('DEPLOY ERROR:', err));
