const { Client } = require('ssh2');
const fs = require('fs');
const path = require('path');

const conn = new Client();

conn.on('ready', () => {
  console.log('SSH Ready for today order checking');
  const cmd = `node -e 'const { PrismaClient } = require("@prisma/client"); const prisma = new PrismaClient(); async function main() { const orders = await prisma.order.findMany({ take: 30, orderBy: { id: "desc" } }); console.log(JSON.stringify(orders.map(o => ({ id: o.id, name: o.userName, amount: o.amount, status: o.status, date: o.createdAt })), null, 2)); } main().finally(() => prisma.$disconnect());'`;
  conn.exec(`cd /home/www/saju-artpani/frontend && ${cmd}`, (err, stream) => {
    if (err) throw err;
    let output = '';
    stream.on('data', (data) => output += data.toString());
    stream.on('close', () => {
      console.log('--- LATEST 30 ORDERS ---');
      console.log(output);
      conn.end();
    });
  });
}).connect({
  host: '121.125.61.114',
  port: 22,
  username: 'saju-artpani',
  privateKey: fs.readFileSync(path.join(require('os').homedir(), '.ssh', 'id_ed25519_121_125_61_114'))
});
