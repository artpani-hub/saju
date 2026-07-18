const { Client } = require('ssh2');
const path = require('path');
const fs = require('fs');

const conn = new Client();
conn.on('ready', () => {
  console.log('SSH Connected.');

  // 진짜 실시간 DB (/home/www/saju-artpani/frontend/.next/standalone/prisma/dev.db)를 대상으로 정규화 및 갱신 수행
  const nodeScript = `
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function convertTableToIso(tableName) {
  console.log(\`\\n=== Converting dates in table: \${tableName} ===\`);
  const rows = await prisma.$queryRawUnsafe(\`SELECT id, createdAt, typeof(createdAt) as db_type FROM "\${tableName}"\`);
  console.log(\`Total rows in \${tableName}: \${rows.length}\`);
  
  let updateCount = 0;
  for (const row of rows) {
    let dateObj = null;
    
    if (row.db_type === 'integer' || row.db_type === 'numeric') {
      dateObj = new Date(Number(row.createdAt));
    } else if (row.db_type === 'text') {
      const dateStr = String(row.createdAt).trim();
      if (!dateStr.includes('Z') && !dateStr.includes('+')) {
        dateObj = new Date(dateStr.replace(' ', 'T') + 'Z');
      } else {
        dateObj = new Date(dateStr);
      }
    }
    
    if (dateObj && !isNaN(dateObj.getTime())) {
      const isoStr = dateObj.toISOString();
      await prisma.$executeRawUnsafe(\`UPDATE "\${tableName}" SET createdAt = '\${isoStr}' WHERE id = '\${row.id}'\`);
      updateCount++;
    }
  }
  console.log(\`Converted \${updateCount} rows to ISO string in \${tableName}.\`);
}

async function main() {
  try {
    // 1. 날짜 타입 정규화 (SQLite 비교 에러 차단)
    await convertTableToIso("Order");
    await convertTableToIso("User");
    await convertTableToIso("SajuReport");

    // 2. 가가님 등 기존 '결제 완료' 리포트 상태를 '보고서 생성 완료'로 소급 갱신
    console.log("\\n=== Updating '결제 완료' Reports to '보고서 생성 완료' ===");
    const updateRes = await prisma.sajuReport.updateMany({
      where: { status: "결제 완료" },
      data: { status: "보고서 생성 완료" }
    });
    console.log(\`Successfully updated \${updateRes.count} SajuReport records.\`);
    console.log("\\n=== Standalone Real DB successfully normalized! ===");
  } catch (err) {
    console.error("Migration error:", err);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
`;

  // 원격지에 쓰기
  conn.exec(`cat << 'EOF' > /home/www/saju-artpani/frontend/fix_real_standalone_db.js\n${nodeScript}\nEOF`, (err, stream) => {
    if (err) throw err;
    stream.on('close', () => {
      console.log('fix_real_standalone_db.js created on server. Executing it...');
      
      // 진짜 실시간 DB 환경변수 주입하여 실행
      conn.exec('DATABASE_URL="file:/home/www/saju-artpani/frontend/.next/standalone/prisma/dev.db" node /home/www/saju-artpani/frontend/fix_real_standalone_db.js', (execErr, execStream) => {
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
