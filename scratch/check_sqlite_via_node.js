const { Client } = require('ssh2');
const fs = require('fs');

async function checkSqliteViaNode() {
  const conn = new Client();
  await new Promise((res, rej) => conn.on('ready', res).on('error', rej).connect({
    host: '121.125.61.114',
    port: 22,
    username: 'artpani',
    privateKey: fs.readFileSync('C:\\Users\\user\\.ssh\\id_ed25519_121_125_61_114')
  }));

  console.log('Inspecting Product table schema via Prisma raw / node...');

  const script = `
    NODE_PATH=/home/www/saju-artpani/frontend/node_modules node -e "
      const { PrismaClient } = require('@prisma/client');
      const prisma = new PrismaClient();
      async function run() {
        const columns = await prisma.\\$queryRawUnsafe('PRAGMA table_info(Product);');
        console.log('COLUMNS:', columns);
        const products = await prisma.product.findMany();
        console.log('CURRENT PRODUCTS COUNT:', products.length);
        console.log('FIRST PRODUCT:', products[0]);
      }
      run().finally(() => prisma.\\$disconnect());
    "
  `;

  const out = await execCmd(conn, script);
  console.log('SCHEMA OUTPUT:\n', out);

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

checkSqliteViaNode().catch(err => console.error('ERROR:', err));
