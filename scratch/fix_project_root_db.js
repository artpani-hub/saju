const { Client } = require('ssh2');
const path = require('path');
const fs = require('fs');

const conn = new Client();
conn.on('ready', () => {
  console.log('SSH Connected.');

  // 프로젝트 루트 DB (/home/www/saju-artpani/frontend/prisma/dev.db)를 타겟으로 날짜 정규화 및 결제완료 건수 복구
  conn.exec('DATABASE_URL="file:/home/www/saju-artpani/frontend/prisma/dev.db" node /home/www/saju-artpani/frontend/fix_real_standalone_db.js', (execErr, execStream) => {
    if (execErr) throw execErr;
    let execOutput = '';
    execStream.on('close', () => {
      console.log('Output from remote server:\n', execOutput);
      conn.end();
    }).on('data', (data) => {
      execOutput += data.toString();
    });
  });
}).connect({
  host: '121.125.61.114',
  port: 22,
  username: 'saju-artpani',
  privateKey: fs.readFileSync(path.join(require('os').homedir(), '.ssh', 'id_ed25519_121_125_61_114'))
});
