const { Client } = require('ssh2');
const fs = require('fs');

async function seedWithNodePath() {
  const conn = new Client();
  await new Promise((res, rej) => conn.on('ready', res).on('error', rej).connect({
    host: '121.125.61.114',
    port: 22,
    username: 'artpani',
    privateKey: fs.readFileSync('C:\\Users\\user\\.ssh\\id_ed25519_121_125_61_114')
  }));

  console.log('Running seed script with NODE_PATH...');

  const script = `
    NODE_PATH=/home/www/saju-artpani/frontend/node_modules node /tmp/seed-products.js
  `;

  const out = await execCmd(conn, script);
  console.log('SEEDING RESULT:\n', out);

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

seedWithNodePath().catch(err => console.error('ERROR:', err));
