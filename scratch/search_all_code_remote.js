const { Client } = require('ssh2');
const path = require('path');
const fs = require('fs');

const conn = new Client();
conn.on('ready', () => {
  console.log('SSH Connected.');

  // 원격지 홈 디렉토리 내부에서 '보고서 생성 완료' 단어가 들어간 소스 코드 위치를 전수 조사
  conn.exec('grep -rn "보고서 생성 완료" /home/www/saju-artpani/', (err, stream) => {
    if (err) throw err;
    let stdout = '';
    stream.on('close', () => {
      console.log('=== Grep "보고서 생성 완료" Remote ===');
      console.log(stdout);
      conn.end();
    }).on('data', (data) => {
      stdout += data.toString();
    });
  });
}).connect({
  host: '121.125.61.114',
  port: 22,
  username: 'saju-artpani',
  privateKey: fs.readFileSync(path.join(require('os').homedir(), '.ssh', 'id_ed25519_121_125_61_114'))
});
