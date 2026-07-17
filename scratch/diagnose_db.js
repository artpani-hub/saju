const { Client } = require('ssh2');
const path = require('path');
const fs = require('fs');

const conn = new Client();
const remoteRoot = '/home/www/saju-artpani/frontend';

conn.on('ready', () => {
  console.log('SSH Client Connected for Diagnosis');
  
  // 1. 디렉토리 구조 및 .env 확인
  const cmd = `
    echo "=== INQUIRIES JSON HEAD ==="
    head -n 20 ${remoteRoot}/data/inquiries.json
  `;
  
  conn.exec(cmd, (err, stream) => {
    if (err) throw err;
    
    stream.on('close', (code) => {
      console.log(`Diagnosis finished with code: ${code}`);
      conn.end();
    }).on('data', (data) => {
      process.stdout.write(data.toString());
    }).stderr.on('data', (data) => {
      process.stderr.write(data.toString());
    });
  });
}).connect({
  host: '121.125.61.114',
  port: 22,
  username: 'saju-artpani',
  privateKey: fs.readFileSync(path.join(require('os').homedir(), '.ssh', 'id_ed25519_121_125_61_114'))
});
