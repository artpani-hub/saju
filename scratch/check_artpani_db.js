const { Client } = require('ssh2');
const path = require('path');
const fs = require('fs');

const conn = new Client();
conn.on('ready', () => {
  console.log('SSH Connected.');
  // /home/www/artpani 하위에 데이터 파일이 존재하는지 탐색
  conn.exec('find /home/www/artpani -name "*orders*" -o -name "*inquiries*"', (err, stream) => {
    if (err) throw err;
    let output = '';
    stream.on('close', () => {
      console.log('--- ART PANI FIND RESULTS ---');
      console.log(output);
      
      const files = output.split('\n').filter(f => f.trim().length > 0);
      if (files.length === 0) {
        console.log('No files found in /home/www/artpani.');
        conn.end();
        return;
      }
      
      conn.exec('ls -la ' + files.join(' '), (lsErr, lsStream) => {
        if (lsErr) throw lsErr;
        let lsOutput = '';
        lsStream.on('close', () => {
          console.log('--- ART PANI DETAILS ---');
          console.log(lsOutput);
          conn.end();
        }).on('data', (d) => { lsOutput += d.toString(); });
      });
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
