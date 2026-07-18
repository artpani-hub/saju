const { Client } = require('ssh2');
const path = require('path');
const fs = require('fs');

const conn = new Client();
conn.on('ready', () => {
  console.log('SSH Connected.');

  // Nginx 설정 파일 전체에서 saju.artpani.com 도메인을 검색
  const command = `grep -rn "saju.artpani.com" /etc/nginx/ 2>/dev/null || grep -rn "saju.artpani.com" /usr/local/nginx/conf/ 2>/dev/null || echo "Grep failed"`;

  conn.exec(command, (err, stream) => {
    if (err) throw err;
    let stdout = '';
    stream.on('close', () => {
      console.log('=== Nginx Domain Search ===');
      console.log(stdout);
      
      // 검색된 파일을 덤프하기 위해 첫 번째로 걸린 설정 파일을 출력
      const lines = stdout.split('\n');
      const match = lines.find(line => line.includes('.conf'));
      if (match) {
        const filePath = match.split(':')[0];
        console.log(`Found config file: ${filePath}. Reading its contents...`);
        
        conn.exec(`cat ${filePath}`, (catErr, catStream) => {
          if (catErr) throw catErr;
          let catStdout = '';
          catStream.on('close', () => {
            console.log(`=== Contents of ${filePath} ===`);
            console.log(catStdout);
            conn.end();
          }).on('data', (d) => { catStdout += d.toString(); });
        });
      } else {
        console.log('No specific .conf file path matched. Printing all configs under conf.d or sites-enabled...');
        conn.exec(`cat /etc/nginx/conf.d/*.conf 2>/dev/null || cat /etc/nginx/sites-enabled/* 2>/dev/null || echo "No files"`, (catErr, catStream) => {
          if (catErr) throw catErr;
          let catStdout = '';
          catStream.on('close', () => {
            console.log('=== Raw Nginx Configs ===');
            console.log(catStdout);
            conn.end();
          }).on('data', (d) => { catStdout += d.toString(); });
        });
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
