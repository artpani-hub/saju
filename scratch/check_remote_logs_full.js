const { Client } = require('ssh2');
const path = require('path');
const fs = require('fs');

const conn = new Client();
conn.on('ready', () => {
  console.log('SSH Connected.');
  // saju-app-out.log 의 파일 마지막 200줄을 덤프
  conn.exec('tail -n 200 /home/www/saju-artpani/.pm2/logs/saju-app-out.log', (err, stream) => {
    if (err) throw err;
    let output = '';
    stream.on('close', () => {
      console.log('--- PM2 OUT LOG FILE ---');
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
