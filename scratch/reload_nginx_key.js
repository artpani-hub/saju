const { Client } = require('ssh2');
const path = require('path');
const fs = require('fs');

const conn = new Client();
conn.on('ready', () => {
  console.log('SSH Connected as artpani using Key!');

  // artpani 계정 권한으로 nginx reload 강제 실행
  const command = 'echo "Artpani!2026_x" | sudo -S nginx -s reload';

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
  username: 'artpani',
  privateKey: fs.readFileSync(path.join(require('os').homedir(), '.ssh', 'id_ed25519_121_125_61_114'))
});
