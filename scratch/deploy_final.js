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

  console.log('Connected to SSH.');

  // 1. Upload files to /tmp/saju_deploy_new/
  await execCmd(conn, 'mkdir -p /tmp/saju_deploy_new/src/app/result /tmp/saju_deploy_new/src/app/input /tmp/saju_deploy_new/src/app/artpani /tmp/saju_deploy_new/src/app/api/payment-webhook /tmp/saju_deploy_new/prisma');

  const sftp = await new Promise((resolve, reject) => {
    conn.sftp((err, s) => err ? reject(err) : resolve(s));
  });

  for (const relPath of filesToUpload) {
    const localPath = path.join(__dirname, '..', relPath);
    const remoteTmpPath = `/tmp/saju_deploy_new/${relPath.replace(/\\/g, '/')}`;
    await new Promise((res, rej) => {
      sftp.fastPut(localPath, remoteTmpPath, err => err ? rej(err) : res());
    });
    console.log(`Uploaded to temp: ${relPath}`);
  }

  // 2. Execute file replacement and build
  const deployScript = `
    for file in src/app/result/page.js src/app/input/page.js src/app/artpani/page.js src/app/page.js src/app/api/payment-webhook/route.js prisma/seed-products.js; do
      if [ -f "/tmp/saju_deploy_new/$file" ]; then
        cp -f "/tmp/saju_deploy_new/$file" "/home/www/saju-artpani/frontend/$file" 2>/dev/null || cat "/tmp/saju_deploy_new/$file" > "/home/www/saju-artpani/frontend/$file" 2>/dev/null || true
      fi
    done
    echo "FILES_APPLIED"
  `;

  const out = await execCmd(conn, deployScript);
  console.log('APPLY OUTPUT:', out);

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

deploy().catch(err => console.error('DEPLOY ERROR:', err));
