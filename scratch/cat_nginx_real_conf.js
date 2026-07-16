const { Client } = require('ssh2');
const path = require('path');
const fs = require('fs');

const conn = new Client();
conn.on('ready', () => {
  console.log('SSH Connected.');
  // Nginx 설정 폴더 목록을 조회하고 saju 관련 설정 찾아서 출력
  conn.exec('ls -la /etc/nginx/sites-enabled/ && cat /etc/nginx/sites-enabled/*saju* || cat /etc/nginx/conf.d/*saju* || true', (err, stream) => {
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
