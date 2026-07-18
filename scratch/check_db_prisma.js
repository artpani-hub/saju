const { Client } = require('ssh2');
const path = require('path');
const fs = require('fs');

const conn = new Client();
conn.on('ready', () => {
  console.log('SSH Connected.');

  const nodeScript = `
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log("=== Checking DB Backup Files ===");
  const fs = require('fs');
  const backupFiles = fs.readdirSync('/home/www/saju-artpani/frontend/data_backup').filter(f => f.includes('db'));
  console.log("Available backups:", backupFiles);

  console.log("\\n=== Sample Orders (Original vs Current) ===");
  const orders = await prisma.order.findMany({
    select: { id: true, createdAt: true, userName: true, status: true },
    take: 5
  });
  console.log(JSON.stringify(orders, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
`;

  conn.exec(`cat << 'EOF' > /home/www/saju-artpani/frontend/check_db_prisma.js\n${nodeScript}\nEOF`, (err, stream) => {
    if (err) throw err;
    stream.on('close', () => {
      conn.exec('DATABASE_URL="file:/home/www/saju-artpani/frontend/prisma/dev.db" node /home/www/saju-artpani/frontend/check_db_prisma.js', (execErr, execStream) => {
        if (execErr) throw execErr;
        let execOutput = '';
        execStream.on('close', () => {
          console.log(execOutput);
          conn.end();
        }).on('end', () => {});
        execStream.on('data', (data) => {
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
