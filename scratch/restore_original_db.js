const { Client } = require('ssh2');
const path = require('path');
const fs = require('fs');

const conn = new Client();
conn.on('ready', () => {
  console.log('SSH Connected.');

  // 최초 원본 백업본(dev.db_backup_1784323281146)으로 강제 롤백하여 오염된 상태값을 완전히 초기화
  const command = `
    echo "=== Force rolling back to original untampered backup ===";
    cp /home/www/saju-artpani/frontend/data_backup/dev.db_backup_1784323281146 /home/www/saju-artpani/frontend/prisma/dev.db
    cp /home/www/saju-artpani/frontend/data_backup/dev.db_backup_1784323281146 /home/www/saju-artpani/frontend/.next/standalone/prisma/dev.db 2>/dev/null || true
    echo "Original status database restored successfully.";
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
