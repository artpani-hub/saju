const { Client } = require('ssh2');
const path = require('path');
const fs = require('fs');

const conn = new Client();
conn.on('ready', () => {
  console.log('SSH Connected.');

  // 진짜 최신 백업 파일(dev.db_backup_1784329098485)로 DB를 다시 복구
  const command = `
    echo "=== Restoring database from LATEST original backup ===";
    cp /home/www/saju-artpani/frontend/data_backup/dev.db_backup_1784329098485 /home/www/saju-artpani/frontend/prisma/dev.db
    cp /home/www/saju-artpani/frontend/data_backup/dev.db_backup_1784329098485 /home/www/saju-artpani/frontend/.next/standalone/prisma/dev.db 2>/dev/null || true
    echo "Latest database restored successfully.";
    
    echo "\\n=== PM2 Error Logs ===";
    tail -n 30 /home/www/saju-artpani/.pm2/logs/saju-app-error.log 2>/dev/null || echo "No logs";
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
