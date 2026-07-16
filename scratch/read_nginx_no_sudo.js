const { Client } = require('ssh2');
const path = require('path');
const fs = require('fs');

const conn = new Client();
conn.on('ready', () => {
  console.log('SSH Connected.');
  // sudo 없이 직접 cat 명령어로 access.log 조회를 시도
  conn.exec('cat /var/log/nginx/access.log | grep -E "15/Jul/2026" | grep -E "/result\\?|/api/" || true', (err, stream) => {
    if (err) throw err;
    let output = '';
    stream.on('close', () => {
      console.log('NGINX ACCESS LOGS WITHOUT SUDO:');
      console.log(output);
      conn.end();
      console.log('SSH Closed.');
    }).on('data', (data) => {
      output += data.toString();
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
