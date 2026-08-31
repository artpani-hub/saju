const { Client } = require('ssh2');
const fs = require('fs');

const conn = new Client();
conn.on('ready', () => {
  console.log('Granting full 777 permissions on .next directory...');

  const cmd = `
    chmod -R 777 /home/www/saju-artpani/frontend/.next 2>/dev/null || true
    PM2_HOME=/home/www/saju-artpani/.pm2 pm2 restart saju-app
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
