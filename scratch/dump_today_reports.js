const { Client } = require('ssh2');
const path = require('path');
const fs = require('fs');

const conn = new Client();
conn.on('ready', () => {
  console.log('SSH Connected.');

  // 원격지에서 SajuReport 테이블의 모든 레코드를 출력하여 createdAt과 status의 매치 상태 대조
  const nodeScript = `
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log("=== SajuReport Table Dump ===");
  const reports = await prisma.sajuReport.findMany({
    include: { user: true }
  });
  
  for (const r of reports) {
    const kstDate = new Date(r.createdAt.getTime() + (9 * 60 * 60 * 1000));
    console.log(\`Report ID: \${r.id} | User: \${r.user?.name} | Status: \${r.status} | CreatedAt UTC: \${r.createdAt.toISOString()} | CreatedAt KST: \${kstDate.toISOString()}\`);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
`;

  // 원격지에 쓰기
  conn.exec(`cat << 'EOF' > /home/www/saju-artpani/frontend/dump_today_reports.js\n${nodeScript}\nEOF`, (err, stream) => {
    if (err) throw err;
    stream.on('close', () => {
      console.log('dump_today_reports.js created on server. Executing it...');
      
      // 실행
      conn.exec('DATABASE_URL="file:/home/www/saju-artpani/frontend/prisma/dev.db" node /home/www/saju-artpani/frontend/dump_today_reports.js', (execErr, execStream) => {
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
