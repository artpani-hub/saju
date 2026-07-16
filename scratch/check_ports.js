const { Client } = require('ssh2');
const path = require('path');
const fs = require('fs');

const conn = new Client();
conn.on('ready', () => {
  console.log('SSH Connected.');
  // 포트 3000과 3012를 점검하고, 프로세스가 어디서 작동 중인지 ls -la /proc/<pid>/cwd 로 실행 경로 확인
  conn.exec('ss -lntp | grep -E "3000|3012" && ps -ef | grep node', (err, stream) => {
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
  privateKey: fs.readFileSync(path.join(require('os').homedir(), '.ssh', 'id_ed25519_121_125_61_114'))
});
