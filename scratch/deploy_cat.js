const { Client } = require('ssh2');
const fs = require('fs');
const path = require('path');

const filesToUpload = [
  'src/app/result/page.js',
  'src/app/input/page.js',
  'src/app/artpani/page.js',
  'src/app/page.js',
  'src/app/api/payment-webhook/route.js',
  'prisma/seed-products.js'
];

async function deploy() {
  const conn = new Client();
  
  await new Promise((resolve, reject) => {
    conn.on('ready', resolve).on('error', reject).connect({
      host: '121.125.61.114',
      port: 22,
      username: 'artpani',
      privateKey: fs.readFileSync('C:\\Users\\user\\.ssh\\id_ed25519_121_125_61_114')
    });
  });

  console.log('SSH Connection Ready.');

  await execCmd(conn, 'mkdir -p /tmp/saju_files/src/app/result /tmp/saju_files/src/app/input /tmp/saju_files/src/app/artpani /tmp/saju_files/src/app/api/payment-webhook /tmp/saju_files/prisma');

  const sftp = await new Promise((resolve, reject) => {
    conn.sftp((err, s) => err ? reject(err) : resolve(s));
  });

  for (const relPath of filesToUpload) {
    const localPath = path.join(__dirname, '..', relPath);
    const remoteTmpPath = `/tmp/saju_files/${relPath.replace(/\\/g, '/')}`;
    await new Promise((res, rej) => {
      sftp.fastPut(localPath, remoteTmpPath, err => err ? rej(err) : res());
    });
    console.log(`Uploaded to tmp: ${relPath}`);
  }

  // cat redirection overwrites without removing file
  console.log('Overwriting via cat redirection...');
  const remoteCmd = `
    cat /tmp/saju_files/src/app/result/page.js > /home/www/saju-artpani/frontend/src/app/result/page.js &&
    cat /tmp/saju_files/src/app/input/page.js > /home/www/saju-artpani/frontend/src/app/input/page.js &&
    cat /tmp/saju_files/src/app/artpani/page.js > /home/www/saju-artpani/frontend/src/app/artpani/page.js &&
    cat /tmp/saju_files/src/app/page.js > /home/www/saju-artpani/frontend/src/app/page.js &&
    cat /tmp/saju_files/src/app/api/payment-webhook/route.js > /home/www/saju-artpani/frontend/src/app/api/payment-webhook/route.js &&
    cat /tmp/saju_files/prisma/seed-products.js > /home/www/saju-artpani/frontend/prisma/seed-products.js &&
    echo "CAT_OVERWRITE_SUCCESS"
  `;

  const output = await execCmd(conn, remoteCmd);
  console.log('CAT OUTPUT:\n', output);

  conn.end();
}

function execCmd(conn, cmd) {
  return new Promise((resolve, reject) => {
    conn.exec(cmd, (err, stream) => {
      if (err) return reject(err);
      let stdout = '';
      let stderr = '';
      stream.on('close', (code) => {
        resolve(stdout + '\n' + stderr);
      });
      stream.on('data', data => stdout += data.toString());
      stream.stderr.on('data', data => stderr += data.toString());
    });
  });
}

deploy().catch(err => console.error('DEPLOY ERROR:', err));
