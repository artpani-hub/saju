const { Client } = require('ssh2');
const fs = require('fs');

async function testLiveDashboardApi() {
  const conn = new Client();
  await new Promise((res, rej) => conn.on('ready', res).on('error', rej).connect({
    host: '121.125.61.114',
    port: 22,
    username: 'artpani',
    privateKey: fs.readFileSync('C:\\Users\\user\\.ssh\\id_ed25519_121_125_61_114')
  }));

  console.log('Querying Users and Orders from live database process...');

  const script = `
    NODE_PATH=/tmp/saju_runtime_frontend/node_modules node -e "
      require('dotenv').config({ path: '/tmp/saju_runtime_frontend/.env' });
      const { PrismaClient } = require('@prisma/client');
      console.log('LIVE DATABASE_URL:', process.env.DATABASE_URL);
      const prisma = new PrismaClient({
        datasources: { db: { url: process.env.DATABASE_URL } }
      });
      async function run() {
        const uCount = await prisma.user.count();
        const oCount = await prisma.order.count();
        const pCount = await prisma.product.count();
        console.log('LIVE DATABASE STATUS -> Users:', uCount, '| Orders:', oCount, '| Products:', pCount);
      }
      run().finally(() => prisma.\\$disconnect());
    "
  `;

  const out = await execCmd(conn, script);
  console.log('DASHBOARD API VERIFY OUTPUT:\n', out);

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

testLiveDashboardApi().catch(err => console.error('ERROR:', err));
