const { Client } = require('ssh2');
const fs = require('fs');

const conn = new Client();
conn.on('ready', () => {
  console.log('Chmodding index.html and executing replace...');
  
  const cmd = `
    chmod 666 /home/www/saju-artpani/frontend/.next/standalone/.next/server/app/index.html 2>/dev/null || true
    chmod 666 /home/www/saju-artpani/frontend/.next/standalone/.next/server/app/page.html 2>/dev/null || true
    
    node -e "
      const fs = require('fs');
      const files = [
        '/home/www/saju-artpani/frontend/.next/standalone/.next/server/app/index.html',
        '/home/www/saju-artpani/frontend/.next/standalone/.next/server/app/page.html'
      ];
      for (const f of files) {
        if (fs.existsSync(f)) {
          try {
            let content = fs.readFileSync(f, 'utf8');
            content = content.replace(/무료 사주 보기/g, '사주 체험판 보기');
            content = content.replace(/내 사주 무료 확인하기/g, '사주 체험판 보러 가기');
            fs.writeFileSync(f, content, 'utf8');
            console.log('SUCCESSFULLY_UPDATED: ' + f);
          } catch(e) {
            console.error('Error on ' + f + ':', e.message);
          }
        }
      }
    "

    PM2_HOME=/home/www/saju-artpani/.pm2 pm2 reload saju-app
  `;

  conn.exec(cmd, (err, stream) => {
    if (err) throw err;
    stream.on('close', () => conn.end())
    .on('data', data => console.log(data.toString()));
  });
}).connect({
  host: '121.125.61.114',
  port: 22,
  username: 'artpani',
  privateKey: fs.readFileSync('C:\\Users\\user\\.ssh\\id_ed25519_121_125_61_114')
});
