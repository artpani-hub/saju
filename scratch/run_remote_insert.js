const { Client } = require('ssh2');
const path = require('path');
const fs = require('fs');

const conn = new Client();
const remoteRoot = '/home/www/saju-artpani/frontend';

conn.on('ready', () => {
  console.log('SSH Connection Established. Restoring lost order on remote server...');
  const cmd = `cd ${remoteRoot} && DATABASE_URL="file:${remoteRoot}/prisma/dev.db" node scratch/insert_lost_order.js`;
  
  conn.exec(cmd, (err, stream) => {
    if (err) {
      console.error('Execution error:', err);
      conn.end();
      return;
    }
    
    stream.on('close', (code) => {
      console.log(`Command closed with code: ${code}`);
      conn.end();
    }).on('data', (data) => {
      console.log(String(data));
    }).stderr.on('data', (data) => {
      console.error('STDERR: ' + data);
    });
  });
}).connect({
  host: '121.125.61.114',
  port: 22,
  username: 'saju-artpani',
  privateKey: fs.readFileSync(path.join(require('os').homedir(), '.ssh', 'id_ed25519_121_125_61_114'))
});
