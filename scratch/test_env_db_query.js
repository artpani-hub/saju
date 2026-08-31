const { Client } = require('ssh2');
const fs = require('fs');

async function testEnvDbQuery() {
  const conn = new Client();
  await new Promise((res, rej) => conn.on('ready', res).on('error', rej).connect({
    host: '121.125.61.114',
    port: 22,
    username: 'artpani',
    privateKey: fs.readFileSync('C:\\Users\\user\\.ssh\\id_ed25519_121_125_61_114')
  }));

  console.log('Testing DB Query reading .env DATABASE_URL...');

  const script = `
    NODE_PATH=/home/www/saju-artpani/frontend/node_modules node -e "
      require('dotenv').config({ path: '/home/www/saju-artpani/frontend/.env' });
      const { PrismaClient } = require('@prisma/client');
      console.log('ENV DATABASE_URL:', process.env.DATABASE_URL);
      const prisma = new PrismaClient({
        datasources: { db: { url: process.env.DATABASE_URL } }
      });
      async function run() {
        const count = await prisma.product.count();
        console.log('REAL LIVE DB PRODUCT COUNT:', count);
        const freeSample = await prisma.product.findFirst({ where: { reportType: 'free' } });
        console.log('FREE SAMPLE PRODUCT RECORD:', freeSample);
      }
      run().finally(() => prisma.\\$disconnect());
    "
  `;

  const out = await execCmd(conn, script);
  console.log('REAL DB QUERY RESULT:\n', out);

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

testEnvDbQuery().catch(err => console.error('ERROR:', err));
