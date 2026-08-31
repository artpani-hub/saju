const { Client } = require('ssh2');
const fs = require('fs');

const conn = new Client();
conn.on('ready', () => {
  conn.exec('sudo -n chmod -R 777 /home/www/saju-artpani/frontend 2>&1', (err, stream) => {
    if (err) throw err;
    stream.on('close', () => conn.end())
    .on('data', data => console.log('STDOUT:', data.toString()))
    .stderr.on('data', data => console.error('STDERR:', data.toString()));
  });
}).connect({
  host: '121.125.61.114',
  port: 22,
  username: 'artpani',
  privateKey: fs.readFileSync('C:\\Users\\user\\.ssh\\id_ed25519_121_125_61_114')
});
