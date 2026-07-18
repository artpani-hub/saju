const { Client } = require('ssh2');
const path = require('path');
const fs = require('fs');

const conn = new Client();
conn.on('ready', () => {
  console.log('SSH Connected.');
  
  // sqlite3 CLI로 Order 테이블의 원시(raw) 데이터 조회
  const command = `sqlite3 /home/www/saju-artpani/frontend/prisma/dev.db "SELECT id, status, createdAt FROM \\"Order\\" ORDER BY createdAt DESC LIMIT 15;"`;

  conn.exec(command, (err, stream) => {
    if (err) throw err;
    let stdout = '';
    let stderr = '';
    stream.on('close', () => {
      console.log('=== Raw DB Output ===');
      console.log(stdout);
      if (stderr) {
        console.log('=== Stderr ===');
        console.log(stderr);
      }
      conn.end();
    }).on('data', (data) => {
      stdout += data.toString();
    }).stderr.on('data', (data) => {
      stderr += data.toString();
    });
  });
}).connect({
  host: '121.125.61.114',
  port: 22,
  username: 'saju-artpani',
  privateKey: fs.readFileSync(path.join(require('os').homedir(), '.ssh', 'id_ed25519_121_125_61_114'))
});
