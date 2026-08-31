const { Client } = require('ssh2');
const fs = require('fs');

const conn = new Client();
conn.on('ready', () => {
  console.log('Granting group write permission to full frontend folder...');

  const cmd = `
    chmod -R g+rw /home/www/saju-artpani/frontend 2>/dev/null || true
    chmod -R g+rwx /home/www/saju-artpani/frontend/.next 2>/dev/null || true
    echo "FULL_GROUP_PERMISSION_GRANTED"
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
