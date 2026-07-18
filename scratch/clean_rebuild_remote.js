const { Client } = require('ssh2');
const path = require('path');
const fs = require('fs');

const conn = new Client();
conn.on('ready', () => {
  console.log('SSH Connected.');

  // 빌드 캐시 디렉토리 .next 를 완전히 삭제하고 클린 리빌드 진행
  const command = `
    cd /home/www/saju-artpani/frontend
    echo "=== Cleaning Next.js Build Cache ==="
    rm -rf .next
    
    echo "=== Running Clean Build ==="
    npm run build
    
    echo "=== Restarting saju-app via PM2 ==="
    pm2 restart saju-app || pm2 start .next/standalone/server.js --name saju-app
  `;

  conn.exec(command, (err, stream) => {
    if (err) throw err;
    let stdout = '';
    stream.on('close', () => {
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
