const { Client } = require('ssh2');
const fs = require('fs');

const conn = new Client();
conn.on('ready', () => {
  console.log('Cleaning remote Next.js build cache and restarting...');

  const cleanCmd = `
    rm -rf /home/www/saju-artpani/frontend/.next/cache 2>/dev/null || true
    rm -rf /home/www/saju-artpani/frontend/.next/standalone/.next/cache 2>/dev/null || true
    rm -rf /home/www/saju-artpani/frontend/.next/standalone/.next/server/app/index.html 2>/dev/null || true
    rm -rf /home/www/saju-artpani/frontend/.next/standalone/.next/server/app/page.html 2>/dev/null || true
    
    cd /home/www/saju-artpani/frontend &&
    pm2 reload all || pm2 restart all
  `;

  conn.exec(cleanCmd, (err, stream) => {
    if (err) throw err;
    stream.on('close', (code) => {
      console.log('Cache Clean Exit Code:', code);
      conn.end();
    }).on('data', data => console.log('STDOUT:', data.toString()))
    .stderr.on('data', data => console.error('STDERR:', data.toString()));
  });
}).connect({
  host: '121.125.61.114',
  port: 22,
  username: 'artpani',
  privateKey: fs.readFileSync('C:\\Users\\user\\.ssh\\id_ed25519_121_125_61_114')
});
