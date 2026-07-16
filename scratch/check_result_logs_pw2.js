const { Client } = require('ssh2');
const path = require('path');
const fs = require('fs');

const conn = new Client();
conn.on('ready', () => {
  console.log('SSH Connected.');
  // saju_artpani_ssh_2026! 비밀번호를 넣어 sudo 실행 시도
  const cmd = 'echo "saju_artpani_ssh_2026!" | sudo -S cat /var/log/nginx/access.log | grep -E "15/Jul/2026" | grep -E "/result\\?|/api/" || true';
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
