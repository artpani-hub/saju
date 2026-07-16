const { Client } = require('ssh2');
const path = require('path');
const fs = require('fs');

const conn = new Client();
conn.on('ready', () => {
  console.log('SSH Connected to search for backups.');
  
  // orders.json 또는 inquiries.json 이 포함된 파일 모두 찾기
  conn.exec('find /home/www/saju-artpani -name "*orders*" -o -name "*inquiries*"', (err, stream) => {
    if (err) throw err;
    let output = '';
    stream.on('close', () => {
      console.log('--- FIND RESULTS ---');
      console.log(output);
      
      // 각 파일의 상세 정보 (ls -la) 조회
      const files = output.split('\n').filter(f => f.trim().length > 0);
      if (files.length === 0) {
        console.log('No backup files found.');
        conn.end();
        return;
      }
      
      const fileListCmd = 'ls -la ' + files.join(' ');
      conn.exec(fileListCmd, (lsErr, lsStream) => {
        if (lsErr) throw lsErr;
        let lsOutput = '';
        lsStream.on('close', () => {
          console.log('--- FILE DETAILS ---');
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
