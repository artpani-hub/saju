const { Client } = require('ssh2');
const path = require('path');
const fs = require('fs');

const conn = new Client();
conn.on('ready', () => {
  console.log('SSH Connected.');

  // SQLite 내의 모든 createdAt 값을 ISO8601 문자열("YYYY-MM-DDTHH:mm:ss.sssZ")로 정규화하는 스크립트
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
      // 타임스탬프 숫자인 경우
      dateObj = new Date(Number(row.createdAt));
    } else if (row.db_type === 'text') {
      // 텍스트 날짜인 경우
      const dateStr = String(row.createdAt).trim();
      if (!dateStr.includes('Z') && !dateStr.includes('+')) {
        dateObj = new Date(dateStr.replace(' ', 'T') + 'Z');
      } else {
        dateObj = new Date(dateStr);
      }
    }
    
    if (dateObj && !isNaN(dateObj.getTime())) {
      const isoStr = dateObj.toISOString(); // "2026-07-18T00:45:14.402Z"
      await prisma.$executeRawUnsafe(\`UPDATE "\${tableName}" SET createdAt = '\${isoStr}' WHERE id = '\${row.id}'\`);
      updateCount++;
    } else {
      console.warn(\`Could not convert row ID: \${row.id}, raw: \${row.createdAt}\`);
    }
  }
  
  console.log(\`Successfully converted \${updateCount} rows to ISO string in \${tableName}.\`);
}

async function main() {
  try {
    await convertTableToIso("Order");
    await convertTableToIso("User");
    await convertTableToIso("SajuReport");
    console.log("\\n=== Date conversion to ISO string completed successfully! ===");
  } catch (err) {
    console.error("Migration error:", err);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
`;

  // 원격지에 쓰기
  conn.exec(`cat << 'EOF' > /home/www/saju-artpani/frontend/convert_dates_to_iso.js\n${nodeScript}\nEOF`, (err, stream) => {
    if (err) throw err;
    stream.on('close', () => {
      console.log('convert_dates_to_iso.js created on server. Executing it...');
      
      // 실행
      conn.exec('DATABASE_URL="file:/home/www/saju-artpani/frontend/prisma/dev.db" node /home/www/saju-artpani/frontend/convert_dates_to_iso.js', (execErr, execStream) => {
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
