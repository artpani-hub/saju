const { Client } = require('ssh2');
const path = require('path');
const fs = require('fs');

const conn = new Client();
conn.on('ready', () => {
  console.log('SSH Connected.');

  // 시스템 전체에서 dev.db 파일을 검색 (권한 에러 차단 2>/dev/null 적용)
  const command = `find /home/www/ -name "dev.db" -exec ls -la {} \\; 2>/dev/null || find / -name "dev.db" -exec ls -la {} \\; 2>/dev/null`;

  conn.exec(command, (err, stream) => {
    if (err) throw err;
    let stdout = '';
    stream.on('close', () => {
      console.log('=== All dev.db Files on Server System ===');
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
