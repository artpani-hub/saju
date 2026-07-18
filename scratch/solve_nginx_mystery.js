const { Client } = require('ssh2');
const path = require('path');
const fs = require('fs');

const conn = new Client();
conn.on('ready', () => {
  console.log('SSH Connected.');

  // 1. 현재 3000 포트를 점유하고 있는 프로세스 확인
  // 2. /etc/nginx/conf.d/icit.conf (활성 파일) 내용 확인
  const command = `
    echo "=== 3000 Port Process ===";
    ss -lntp | grep 3000 || netstat -lntp | grep 3000 || lsof -i :3000 || echo "No process on 3000";
    
    echo "\\n=== Active Nginx Config Files ===";
    ls -la /etc/nginx/conf.d/;
    
    echo "\\n=== Contents of /etc/nginx/conf.d/icit.conf ===";
    cat /etc/nginx/conf.d/icit.conf 2>/dev/null || echo "icit.conf not found";
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
