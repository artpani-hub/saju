const { Client } = require('ssh2');
const fs = require('fs');

const conn = new Client();
conn.on('ready', () => {
  const cmd = `
    sg developer -c "touch /home/www/saju-artpani/frontend/.next/test_write.txt && rm -f /home/www/saju-artpani/frontend/.next/test_write.txt" 2>&1
  `;
  conn.exec(cmd, (err, stream) => {
    if (err) throw err;
    stream.on('close', (code) => {
      console.log('SG Code:', code);
      conn.end();
    }).on('data', data => console.log('STDOUT:', data.toString()));
  });
}).connect({
  host: '121.125.61.114',
  port: 22,
  username: 'artpani',
  privateKey: fs.readFileSync('C:\\Users\\user\\.ssh\\id_ed25519_121_125_61_114')
});
