const { Client } = require('ssh2');
const conn = new Client();
conn.on('ready', () => {
  console.log('SSH Connected.');
  // 원격 서버의 Nginx 임시 캐시 및 PM2 완전 하드 리부트
  conn.exec('pm2 reload saju-app', (err, stream) => {
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
