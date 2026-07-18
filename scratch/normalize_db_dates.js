const { Client } = require('ssh2');
const path = require('path');
const fs = require('fs');

const conn = new Client();
conn.on('ready', () => {
  console.log('SSH Connected.');

  // 원격지에서 실행하여 SQLite 내의 모든 createdAt TEXT 타입을 INTEGER 타임스탬프로 일괄 변환하는 스크립트
  const nodeScript = `
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function normalizeTable(tableName) {
  console.log(\`\\n=== Normalizing table: \${tableName} ===\`);
  
  // prisma.$queryRaw로 날짜 컬럼 정보와 타입을 직접 조회
  const rows = await prisma.$queryRawUnsafe(\`SELECT id, createdAt, typeof(createdAt) as db_type FROM "\${tableName}"\`);
  console.log(\`Total rows in \${tableName}: \${rows.length}\`);
  
  let updateCount = 0;
  for (const row of rows) {
    if (row.db_type === 'text') {
      const dateStr = String(row.createdAt).trim();
      let dateObj;
      
      // ISO 포맷 보정 (공백을 T로 바꾸고 Z를 붙여 UTC로 강제 인식)
      if (!dateStr.includes('Z') && !dateStr.includes('+')) {
        dateObj = new Date(dateStr.replace(' ', 'T') + 'Z');
      } else {
        dateObj = new Date(dateStr);
      }
      
      const timestamp = dateObj.getTime();
      if (!isNaN(timestamp)) {
        await prisma.$executeRawUnsafe(\`UPDATE "\${tableName}" SET createdAt = \${timestamp} WHERE id = '\${row.id}'\`);
        updateCount++;
      } else {
        console.warn(\`Failed to parse date: \${dateStr} for ID: \${row.id}\`);
      }
    }
  }
  console.log(\`Successfully normalized \${updateCount} TEXT rows to INTEGER timestamp in \${tableName}.\`);
}

async function main() {
  try {
    await normalizeTable("Order");
    await normalizeTable("User");
    await normalizeTable("SajuReport");
    console.log("\\n=== All tables date normalization completed successfully! ===");
  } catch (err) {
    console.error("Migration error:", err);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
`;

  // 원격지에 쓰기
  conn.exec(`cat << 'EOF' > /home/www/saju-artpani/frontend/normalize_db_dates.js\n${nodeScript}\nEOF`, (err, stream) => {
    if (err) throw err;
    stream.on('close', () => {
      console.log('normalize_db_dates.js created on server. Executing it...');
      
      // 실행
      conn.exec('DATABASE_URL="file:/home/www/saju-artpani/frontend/prisma/dev.db" node /home/www/saju-artpani/frontend/normalize_db_dates.js', (execErr, execStream) => {
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
