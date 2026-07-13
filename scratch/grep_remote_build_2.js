const { Client } = require('ssh2');
const conn = new Client();
conn.on('ready', () => {
  console.log('SSH Connected.');
  // 전체 .next 디렉토리 내에서 grep 검색
  conn.exec('grep -rn "모의 결제를 즉시 실행합니다" /home/www/saju-artpani/frontend/.next/', (err, stream) => {
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
