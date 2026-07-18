const { Client } = require('ssh2');
const path = require('path');
const fs = require('fs');

const conn = new Client();
conn.on('ready', () => {
  console.log('SSH Connected.');
  
  // pm2 show 실행하여 실행 중인 파일 경로(cwd, script path)를 상세 조회
  conn.exec(`pm2 show saju-app`, (err, stream) => {
    if (err) throw err;
    let stdout = '';
    stream.on('close', () => {
      console.log('=== PM2 Show saju-app ===');
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
