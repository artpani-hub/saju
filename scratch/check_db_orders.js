const { Client } = require('ssh2');
const path = require('path');
const fs = require('fs');

const conn = new Client();
const remoteRoot = '/home/www/saju-artpani/frontend';

conn.on('ready', () => {
  console.log('SSH Connected for checking DB orders.');
  
  // 원격 서버에 check_temp.js 작성 및 실행
  const scriptContent = `
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: 'desc' },
    take: 30,
    include: { user: true }
  });
  console.log("=== DB ORDERS ===");
  orders.forEach(o => {
    console.log(\`[\${o.createdAt.toISOString()}] ID: \${o.id} | Name: \${o.user.name} | Status: \${o.status} | Amount: \${o.amount} | Phone: \${o.user.phone}\`);
  });
}

main().catch(e => console.error(e)).finally(() => prisma.$disconnect());
  `;

  // 원격 서버에 scriptContent를 쓰고 실행
  const runCmd = `
    cd ${remoteRoot}
    cat << 'EOF' > scratch/check_temp.js
${scriptContent}
EOF
    node scratch/check_temp.js
    rm -f scratch/check_temp.js
  `;
  
  conn.exec(runCmd, (err, stream) => {
    if (err) throw err;
    stream.on('close', (code) => {
      conn.end();
    }).on('data', (data) => {
      process.stdout.write(data.toString());
    }).stderr.on('data', (data) => {
      process.stderr.write(data.toString());
    });
  });
}).connect({
  host: '121.125.61.114',
  port: 22,
  username: 'saju-artpani',
  privateKey: fs.readFileSync(path.join(require('os').homedir(), '.ssh', 'id_ed25519_121_125_61_114'))
});
