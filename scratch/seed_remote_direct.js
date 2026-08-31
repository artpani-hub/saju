const { Client } = require('ssh2');
const fs = require('fs');

async function seedRemoteDirect() {
  const conn = new Client();
  await new Promise((res, rej) => conn.on('ready', res).on('error', rej).connect({
    host: '121.125.61.114',
    port: 22,
    username: 'artpani',
    privateKey: fs.readFileSync('C:\\Users\\user\\.ssh\\id_ed25519_121_125_61_114')
  }));

  console.log('Copying seed-products.js to remote and running seeding script...');

  const script = `
    cp -f /tmp/saju_deploy_new/prisma/seed-products.js /home/www/saju-artpani/frontend/prisma/seed-products.js 2>/dev/null || true
    cd /home/www/saju-artpani/frontend &&
    node prisma/seed-products.js
  `;

  const out = await execCmd(conn, script);
  console.log('DIRECT REMOTE SEED OUTPUT:\n', out);

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

seedRemoteDirect().catch(err => console.error('ERROR:', err));
