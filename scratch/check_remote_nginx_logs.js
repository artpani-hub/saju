const { Client } = require('ssh2');
const path = require('path');
const fs = require('fs');

const conn = new Client();
conn.on('ready', () => {
  console.log('SSH Connected.');
  // sudo -S 를 이용해 패스워드를 stdin으로 흘려보내 안전하게 nginx access.log 조회
  const cmd = 'echo "Artpani!2026_x" | sudo -S cat /var/log/nginx/access.log | grep "payment-webhook" || true';
  conn.exec(cmd, (err, stream) => {
    if (err) throw err;
    let output = '';
    stream.on('close', () => {
      console.log('NGINX WEBHOOK LOGS:');
      console.log(output);
      conn.end();
      console.log('SSH Closed.');
    }).on('data', (data) => {
      output += data.toString();
    }).stderr.on('data', (data) => {
      // 패스워드 입력 에러 로그 등은 제외
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
