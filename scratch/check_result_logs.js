const { Client } = require('ssh2');
const path = require('path');
const fs = require('fs');

const conn = new Client();
conn.on('ready', () => {
  console.log('SSH Connected.');
  // Nginx access.log 에서 /result? 또는 /api/ 가 들어간 로그 중 오늘(15/Jul/2026) 데이터 검색
  const cmd = 'echo "Artpani!2026_x" | sudo -S cat /var/log/nginx/access.log | grep -E "15/Jul/2026" | grep -E "/result\\?|/api/" || true';
  conn.exec(cmd, (err, stream) => {
    if (err) throw err;
    let output = '';
    stream.on('close', () => {
      console.log('NGINX ACCESS LOGS:');
      console.log(output);
      conn.end();
      console.log('SSH Closed.');
    }).on('data', (data) => {
      output += data.toString();
    }).stderr.on('data', (data) => {
      if (!data.toString().includes('[sudo]')) {
        process.stderr.write(data);
      }
    });
  });
}).connect({
  host: '121.125.61.114',
  port: 22,
  username: 'saju-artpani',
  privateKey: fs.readFileSync(path.join(require('os').homedir(), '.ssh', 'id_ed25519_121_125_61_114'))
});
