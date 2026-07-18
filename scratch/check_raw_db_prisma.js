const { Client } = require('ssh2');
const path = require('path');
const fs = require('fs');

const conn = new Client();
conn.on('ready', () => {
  console.log('SSH Connected.');

  // 원격지에서 prisma.$queryRaw를 사용하여 SQLite의 Order 테이블 내 createdAt 원시 값을 그대로 출력
  const nodeScript = `
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log("=== Querying Raw Order Table createdAt Values ===");
  const rawOrders = await prisma.$queryRaw\`SELECT id, status, createdAt, typeof(createdAt) as db_type FROM "Order" ORDER BY createdAt DESC LIMIT 15\`;
  
  for (const o of rawOrders) {
    console.log(\`Order ID: \${o.id} | Status: \${o.status} | Raw createdAt in SQLite: \${o.createdAt} | DB Type: \${o.db_type}\`);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
`;

  // 원격지에 쓰기
  conn.exec(`cat << 'EOF' > /home/www/saju-artpani/frontend/check_raw_db_prisma.js\n${nodeScript}\nEOF`, (err, stream) => {
    if (err) throw err;
    stream.on('close', () => {
      console.log('check_raw_db_prisma.js created on server. Executing it...');
      
      // 실행
      conn.exec('DATABASE_URL="file:/home/www/saju-artpani/frontend/prisma/dev.db" node /home/www/saju-artpani/frontend/check_raw_db_prisma.js', (execErr, execStream) => {
        if (execErr) throw execErr;
        let execOutput = '';
        execStream.on('close', () => {
          console.log('Output from remote server:\n', execOutput);
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
