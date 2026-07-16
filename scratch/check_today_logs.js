const { Client } = require('ssh2');
const path = require('path');
const fs = require('fs');

const conn = new Client();
conn.on('ready', () => {
  console.log('SSH Connected.');
  // saju-app-out.log 파일에서 오늘 날짜(2026-07-15) 혹은 최근 로그 중 Webhook 이나 orders 관련 로그를 grep
  conn.exec('grep -i -C 3 "2026-07-15" /home/www/saju-artpani/.pm2/logs/saju-app-out.log || tail -n 1000 /home/www/saju-artpani/.pm2/logs/saju-app-out.log | grep -i -C 2 "Webhook" || true', (err, stream) => {
    if (err) throw err;
    let output = '';
    stream.on('close', () => {
      console.log('--- TODAY OUT LOGS ---');
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
