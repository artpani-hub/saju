const { Client } = require('ssh2');
const path = require('path');
const fs = require('fs');

const conn = new Client();
conn.on('ready', () => {
  console.log('SSH Connected.');
  // saju_artpani_db 데이터베이스의 테이블 목록과 각 테이블의 행 수를 출력
  const query = `
    SELECT TABLE_NAME, TABLE_ROWS 
    FROM INFORMATION_SCHEMA.TABLES 
    WHERE TABLE_SCHEMA = 'saju_artpani_db';
  `;
  conn.exec(`mysql -h 127.0.0.1 -u saju_user -p"Saju!2026_x" saju_artpani_db -e "${query}"`, (err, stream) => {
    if (err) throw err;
    stream.on('close', () => {
      conn.end();
      console.log('SSH Closed.');
    }).on('data', (data) => {
      process.stdout.write(data);
    }).stderr.on('data', (data) => {
      process.stderr.write(data);
    });
  });
}).connect({
  host: '121.125.61.114',
  port: 22,
  username: 'saju-artpani',
  privateKey: fs.readFileSync(path.join(require('os').homedir(), '.ssh', 'id_ed25519_121_125_61_114'))
});
