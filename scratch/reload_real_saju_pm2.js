const { Client } = require('ssh2');
const fs = require('fs');

const conn = new Client();
conn.on('ready', () => {
  console.log('Reloading real saju-app PM2 process...');
  
  const reloadCmd = `
    PM2_HOME=/home/www/saju-artpani/.pm2 pm2 reload saju-app || PM2_HOME=/home/www/saju-artpani/.pm2 pm2 restart saju-app
  `;

  conn.exec(reloadCmd, (err, stream) => {
    if (err) throw err;
    stream.on('close', (code) => {
      console.log('REAL PM2 Reload Exit Code:', code);
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
