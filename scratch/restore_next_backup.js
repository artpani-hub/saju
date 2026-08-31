const { Client } = require('ssh2');
const fs = require('fs');

const conn = new Client();
conn.on('ready', () => {
  console.log('Fully restoring original working .next directory...');

  const cmd = `
    node -e "
      const { execSync } = require('child_process');
      try {
        execSync('cp -rf /home/www/artpani/backups/real_saju_backup_20260831104251/src_bak/* /home/www/saju-artpani/frontend/src/ 2>/dev/null || true', { stdio: 'inherit' });
      } catch (e) {}
    "
    PM2_HOME=/home/www/saju-artpani/.pm2 pm2 delete saju-app 2>/dev/null || true
    PM2_HOME=/home/www/saju-artpani/.pm2 PORT=3012 pm2 start /home/www/saju-artpani/frontend/.next/standalone/server.js --name saju-app --cwd /home/www/saju-artpani/frontend/.next/standalone
    PM2_HOME=/home/www/saju-artpani/.pm2 pm2 save
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
