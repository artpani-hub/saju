const { Client } = require('ssh2');
const conn = new Client();
conn.on('ready', () => {
  console.log('SSH Connected.');
  // 원격 빌드의 result 관련 파일들 확인
  conn.exec('find /home/www/saju-artpani/frontend/.next -name "*result*"', (err, stream) => {
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
