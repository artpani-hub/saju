const { Client } = require('ssh2');
const path = require('path');
const fs = require('fs');

const conn = new Client();
conn.on('ready', () => {
  console.log('SSH Connected.');

  // 원격 서버 혜안당 프로젝트 루트의 .env 파일과 standalone 안의 .env 내용을 각각 출력
  const command = `
    echo "=== Contents of /home/www/saju-artpani/frontend/.env ===";
    cat /home/www/saju-artpani/frontend/.env 2>/dev/null || echo "Not found";
    
    echo "\\n=== Contents of /home/www/saju-artpani/frontend/.next/standalone/.env ===";
    cat /home/www/saju-artpani/frontend/.next/standalone/.env 2>/dev/null || echo "Not found";
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
