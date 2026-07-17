const { Client } = require('ssh2');
const path = require('path');
const fs = require('fs');

const conn = new Client();
conn.on('ready', () => {
  console.log('SSH Connected.');

  const nodeScript = `
const { PrismaClient } = require('@prisma/client');
process.env.DATABASE_URL = "file:/home/www/saju-artpani/frontend/prisma/dev.db";
const prisma = new PrismaClient();

async function main() {
  console.log('--- Querying DB orders ---');
  const count = await prisma.order.count();
  console.log('Total Orders Count:', count);

  const recentOrders = await prisma.order.findMany({
    take: 10,
    orderBy: { createdAt: 'desc' },
    include: {
      user: true
    }
  });

  console.log('Recent 10 Orders:');
  recentOrders.forEach(o => {
    console.log(\`[\${o.createdAt.toISOString()}] ID: \${o.id} | Name: \${o.user.name} | Phone: \${o.user.phone} | Product: \${o.productName} | Amount: \${o.amount} | Status: \${o.status}\`);
  });
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
`;

  conn.exec(`cat << 'EOF' > /home/www/saju-artpani/frontend/dump_orders_query.js\n${nodeScript}\nEOF`, (err, stream) => {
    if (err) throw err;
    stream.on('close', () => {
      console.log('Script created on remote server. Running query...');
      
      conn.exec('node /home/www/saju-artpani/frontend/dump_orders_query.js', (execErr, execStream) => {
        if (execErr) throw execErr;
        let execOutput = '';
        execStream.on('close', () => {
          console.log('Query Result:\n', execOutput);
          conn.end();
        }).on('data', (data) => {
          execOutput += data.toString();
        });
      });
    });
  });
}).connect({
  host: '121.125.61.114',
  port: 22,
  username: 'saju-artpani',
  privateKey: fs.readFileSync(path.join(require('os').homedir(), '.ssh', 'id_ed25519_121_125_61_114'))
});
