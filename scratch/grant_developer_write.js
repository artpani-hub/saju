const { Client } = require('ssh2');
const fs = require('fs');

const conn = new Client();
conn.on('ready', () => {
  console.log('Fixing group write permissions...');
  
  // umask 002 & chmod g+rw on frontend src
  const cmd = `
    find /home/www/saju-artpani/frontend/src /home/www/saju-artpani/frontend/prisma -type f -exec chmod g+rw {} + 2>/dev/null || true
    find /home/www/saju-artpani/frontend/src /home/www/saju-artpani/frontend/prisma -type d -exec chmod g+rwx {} + 2>/dev/null || true
    echo "PERMISSIONS_UPDATED"
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
