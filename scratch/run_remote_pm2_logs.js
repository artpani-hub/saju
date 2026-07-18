const { Client } = require('ssh2');
const path = require('path');
const fs = require('fs');

const conn = new Client();
const remoteRoot = '/home/www/saju-artpani/frontend';

conn.on('ready', () => {
  console.log('SSH Connection Established. Fetching PM2 logs from remote server...');
  const cmd = `pm2 log saju-app --lines 150 --raw --no-color`;
  
  conn.exec(cmd, (err, stream) => {
    if (err) {
      console.error('Execution error:', err);
      conn.end();
      return;
    }
    
    // 5초 후에 강제 커넥션 종료하여 실시간 대기 방지
    setTimeout(() => {
      console.log('=== Log Fetching Timeout (5s) ===');
      conn.end();
    }, 5000);

    stream.on('close', (code) => {
      console.log(`Command closed with code: ${code}`);
      conn.end();
    }).on('data', (data) => {
      console.log(String(data));
    }).stderr.on('data', (data) => {
      console.error('STDERR: ' + data);
    });
  });
}).connect({
  host: '121.125.61.114',
  port: 22,
  username: 'saju-artpani',
  privateKey: fs.readFileSync(path.join(require('os').homedir(), '.ssh', 'id_ed25519_121_125_61_114'))
});
