const { Client } = require('ssh2');
const path = require('path');
const fs = require('fs');

const conn = new Client();
conn.on('ready', () => {
  console.log('SSH Connected.');

  // /etc/nginx 하위의 모든 파일에서 saju.artpani.com을 대소문자 없이 검색
  const command = `find /etc/nginx/ -type f -exec grep -l "saju.artpani.com" {} \\;`;

  conn.exec(command, (err, stream) => {
    if (err) throw err;
    let stdout = '';
    stream.on('close', () => {
      console.log('=== Nginx Files Containing Domain ===');
      console.log(stdout);
      
      const files = stdout.trim().split('\n').filter(Boolean);
      
      // 발견된 파일들의 내용을 각각 덤프해서 비교
      if (files.length > 0) {
        let dumpCmd = files.map(file => `echo "=== FILE: ${file} ==="; cat ${file}`).join('; ');
        conn.exec(dumpCmd, (catErr, catStream) => {
          if (catErr) throw catErr;
          let catStdout = '';
          catStream.on('close', () => {
            console.log(catStdout);
            conn.end();
          }).on('data', (d) => { catStdout += d.toString(); });
        });
      } else {
        console.log("No nginx config files found containing the domain.");
        conn.end();
      }
    }).on('data', (data) => {
      stdout += data.toString();
    });
  });
}).connect({
  host: '121.125.61.114',
  port: 22,
  username: 'saju-artpani',
  privateKey: fs.readFileSync(path.join(require('os').homedir(), '.ssh', 'id_ed25519_121_125_61_114'))
});
