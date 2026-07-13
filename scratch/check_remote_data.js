const { Client } = require('ssh2');
const path = require('path');
const fs = require('fs');

const conn = new Client();
conn.on('ready', () => {
  console.log('SSH Connected.');
  
  conn.exec('cat /home/www/saju-artpani/frontend/data/orders.json', (err, stream) => {
    if (err) throw err;
    let output = '';
    stream.on('close', () => {
      console.log('--- REMOTE DB ORDERS ---');
      try {
        const orders = JSON.parse(output);
        console.log(JSON.stringify(orders.slice(0, 15), null, 2)); // 최근 15개 출력
      } catch (e) {
        console.log('Raw output:', output);
      }
      conn.end();
      console.log('SSH Closed.');
    }).on('data', (data) => {
      output += data.toString();
    }).stderr.on('data', (data) => {
      process.stderr.write(data);
    });
  });
}).connect({
  host: '121.125.61.114',
  port: 22,
  username: 'saju-artpani',
  privateKey: fs.readFileSync(path.join(require('os').homedir(), '.ssh', 'id_ed25519_121_125_61_114'))
});
