const { Client } = require('ssh2');
const path = require('path');
const fs = require('fs');

const conn = new Client();
conn.on('ready', () => {
  console.log('SSH Connected.');
  // saju-app-out.log 파일의 마지막 2000줄에서 Webhook 및 api 호출 기록들을 상세 조회
  conn.exec('tail -n 2000 /home/www/saju-artpani/.pm2/logs/saju-app-out.log', (err, stream) => {
    if (err) throw err;
    let output = '';
    stream.on('close', () => {
      console.log('--- LOGS DUMP ---');
      const lines = output.split('\n');
      // Webhook 또는 api/orders 와 관련된 줄만 필터링하여 출력
      lines.forEach(line => {
        if (line.includes('Webhook') || line.includes('orders') || line.includes('order') || line.includes('payment')) {
          console.log(line);
        }
      });
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
