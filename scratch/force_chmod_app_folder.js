const { Client } = require('ssh2');
const fs = require('fs');

const conn = new Client();
conn.on('ready', () => {
  console.log('Force 777 on standalone server app folder...');
  
  const cmd = `
    chmod -R 777 /home/www/saju-artpani/frontend/.next/standalone/.next/server/app 2>/dev/null || true
    echo "FORCE_APP_777_DONE"
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
