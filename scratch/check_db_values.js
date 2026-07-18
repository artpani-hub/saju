const { Client } = require('ssh2');
const path = require('path');
const fs = require('fs');

const conn = new Client();
conn.on('ready', () => {
  console.log('SSH Connected.');

  // 백업된 DB 파일이 존재하는지 확인하고, 현재 DB의 Order 날짜 분포를 상위 5개 출력하여 진단
  const command = `
    echo "=== DB Backups ===";
    ls -la /home/www/saju-artpani/frontend/prisma/ || ls -la /home/www/saju-artpani/frontend/data_backup/;
    
    echo "\\n=== Current Order CreatedAt Samples ===";
    sqlite3 /home/www/saju-artpani/frontend/prisma/dev.db "SELECT id, createdAt FROM \\"Order\\" LIMIT 5;" 2>/dev/null || echo "sqlite3 command failed";
  `;

  conn.exec(command, (err, stream) => {
    if (err) throw err;
    let stdout = '';
    stream.on('close', () => {
      console.log(stdout);
      conn.end();
    }).on('data', (data) => {
      stdout += data.toString();
    });
  });
}).connect({
  host: '121.125.61.114',
  port: 22,
  username: 'saju-artpani',
  privateKey: fs.readFileSync(path.join(require('os').homedir(), '.ssh', 'id_ed25519_121_125_61_114'))
});
