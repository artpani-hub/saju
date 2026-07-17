const { Client } = require('ssh2');
const path = require('path');
const fs = require('fs');

const conn = new Client();
conn.on('ready', () => {
  console.log('SSH Connected.');

  const nodeScript = `
const http = require('http');

const req = http.request({
  hostname: '127.0.0.1',
  port: 3012,
  path: '/result?name=%EA%B9%80%EB%AF%BC%ED%9D%AC&gender=female&year=1995&month=8&day=25&hour=10%3A00',
  method: 'GET',
  headers: {
    'Accept': 'text/html'
  }
}, (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk.substring(0, 100); }); // 헤드만 살짝 수집
  res.on('end', () => {
    console.log('HTTP Status:', res.statusCode);
    console.log('Response Length:', data.length);
    console.log('Response Sample:', data.substring(0, 300));
  });
});

req.on('error', (err) => {
  console.error('Request Error:', err);
});

req.end();
`;

  // 원격지에 쓰기
  conn.exec(`cat << 'EOF' > /home/www/saju-artpani/frontend/test_get_result.js\n${nodeScript}\nEOF`, (err, stream) => {
    if (err) throw err;
    stream.on('close', () => {
      console.log('test_get_result.js created on server. Executing it...');
      
      // 실행
      conn.exec('node /home/www/saju-artpani/frontend/test_get_result.js', (execErr, execStream) => {
        if (execErr) throw execErr;
        let execOutput = '';
        execStream.on('close', () => {
          console.log('Node GET Test Output:\n', execOutput);
          conn.end();
        }).on('data', (data) => {
          execOutput += data.toString();
        });
      });
    });
  });
}).connect({
  host: '121.125.61.114',
  port: 22,
  username: 'saju-artpani',
  privateKey: fs.readFileSync(path.join(require('os').homedir(), '.ssh', 'id_ed25519_121_125_61_114'))
});
