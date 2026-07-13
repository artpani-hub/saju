const { Client } = require('ssh2');
const conn = new Client();
conn.on('ready', () => {
  console.log('SSH Connected.');
  // pm2 logs 대신 실제 파일의 마지막 50줄 출력
  conn.exec('tail -n 50 /home/www/saju-artpani/.pm2/logs/saju-app-out.log', (err, stream) => {
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
  password: 'saju_artpani_ssh_2026!'
});
