const { Client } = require('ssh2');
const path = require('path');
const fs = require('fs');

const conn = new Client();
conn.on('ready', () => {
  console.log('SSH Connected.');

  // Nginx 설정 문법 검사 및 리로드 실행
  const command = `
    echo "=== Testing Nginx Config ===";
    sudo nginx -t;
    
    echo "\\n=== Reloading Nginx ===";
    sudo nginx -s reload || sudo systemctl reload nginx || service nginx reload;
  `;

  conn.exec(command, (err, stream) => {
    if (err) throw err;
    let stdout = '';
    let stderr = '';
    stream.on('close', () => {
      console.log('=== Nginx Reload Output ===');
      console.log(stdout);
      if (stderr) {
        console.log('=== Stderr ===');
        console.log(stderr);
      }
      conn.end();
    }).on('data', (data) => {
      stdout += data.toString();
    }).stderr.on('data', (data) => {
      stderr += data.toString();
    });
  });
}).connect({
  host: '121.125.61.114',
  port: 22,
  username: 'saju-artpani',
  privateKey: fs.readFileSync(path.join(require('os').homedir(), '.ssh', 'id_ed25519_121_125_61_114'))
});
