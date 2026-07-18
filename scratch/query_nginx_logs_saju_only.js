const { Client } = require('ssh2');
const path = require('path');
const fs = require('fs');

const conn = new Client();
conn.on('ready', () => {
  console.log('SSH Connected.');
  
  // 가가님의 전화번호 '7526878' 또는 이름이 들어간 /result URL 요청 검색
  // 6769 주문번호 검색
  const command = `
    echo "=== Nginx Access Logs for 7526878 ==="
    sudo cat /var/log/nginx/access.log* 2>/dev/null | grep -E "7526878|6769" || echo "Not found in access logs"

    echo "=== Nginx Error Logs for 7526878 ==="
    sudo cat /var/log/nginx/error.log* 2>/dev/null | grep -E "7526878|6769" || echo "Not found in error logs"
  `;

  conn.exec(command, (err, stream) => {
    if (err) throw err;
    let stdout = '';
    let stderr = '';
    stream.on('close', () => {
      console.log('--- stdout ---');
      console.log(stdout);
      console.log('--- stderr ---');
      console.log(stderr);
      conn.end();
      console.log('SSH Closed.');
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
