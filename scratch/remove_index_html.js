const { Client } = require('ssh2');
const fs = require('fs');

const conn = new Client();
conn.on('ready', () => {
  console.log('Truncating index.html to allow dynamic SSR...');
  
  const cmd = `
    node -e "
      const fs = require('fs');
      try {
        fs.writeFileSync('/home/www/saju-artpani/frontend/.next/standalone/.next/server/app/index.html', '', 'utf8');
        console.log('TRUNCATE_SUCCESS');
      } catch (e) {
        console.error('TRUNCATE_ERR:', e.message);
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
