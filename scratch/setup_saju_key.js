const { Client } = require('ssh2');
const fs = require('fs');

const conn = new Client();
conn.on('ready', () => {
  const setupKeyCmd = `
    cat ~/.ssh/authorized_keys 2>/dev/null | tee -a /home/www/saju-artpani/.ssh/authorized_keys 2>/dev/null || true
  `;
  conn.exec(setupKeyCmd, (err, stream) => {
    if (err) throw err;
    stream.on('close', () => conn.end())
    .on('data', data => console.log(data.toString()))
    .stderr.on('data', data => console.error(data.toString()));
  });
}).connect({
  host: '121.125.61.114',
  port: 22,
  username: 'artpani',
  privateKey: fs.readFileSync('C:\\Users\\user\\.ssh\\id_ed25519_121_125_61_114')
});
