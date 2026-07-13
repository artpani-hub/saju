const { Client } = require('ssh2');
const path = require('path');
const fs = require('fs');

const conn = new Client();

conn.on('ready', () => {
  console.log('SSH Client Connected. Fetching nginx access logs...');
  conn.exec('tail -n 200 /var/log/nginx/access.log | grep "payment-webhook"', (execErr, stream) => {
    if (execErr) {
      console.error(execErr);
      conn.end();
      return;
    }
    let output = '';
    stream.on('close', (code) => {
      console.log('NGINX ACCESS LOGS:\n', output);
      conn.end();
    }).on('data', (data) => {
      output += data.toString();
    }).stderr.on('data', (data) => {
      output += 'STDERR: ' + data.toString();
    });
  });
}).connect({
  host: '121.125.61.114',
  port: 22,
  username: 'saju-artpani',
  privateKey: fs.readFileSync(path.join(require('os').homedir(), '.ssh', 'id_ed25519_121_125_61_114'))
});
