const { Client } = require('ssh2');
const path = require('path');
const fs = require('fs');

const conn = new Client();
conn.on('ready', () => {
  console.log('SSH Connected.');

  // 원격지에서 localhost:3012 의 대시보드 API를 호출해 오늘 결제완료 건수 수치를 확인하는 스크립트
  const nodeScript = `
const http = require('http');

http.get('http://127.0.0.1:3012/api/admin/dashboard?adminPassword=artpani1234', (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    console.log("=== Remote Dashboard API Response ===");
    console.log("Status Code:", res.statusCode);
    try {
      const parsed = JSON.parse(data);
      console.log("Dashboard Stats:", JSON.stringify(parsed.stats, null, 2));
    } catch (e) {
      console.log("Raw Output:", data);
    }
    process.exit(0);
  });
}).on('error', (err) => {
  console.error("HTTP Request Error:", err);
  process.exit(1);
});
`;

  // 원격지에 쓰기
  conn.exec(`cat << 'EOF' > /home/www/saju-artpani/frontend/test_remote_dashboard.js\n${nodeScript}\nEOF`, (err, stream) => {
    if (err) throw err;
    stream.on('close', () => {
      console.log('test_remote_dashboard.js created on server. Executing it...');
      
      // 실행
      conn.exec('node /home/www/saju-artpani/frontend/test_remote_dashboard.js', (execErr, execStream) => {
        if (execErr) throw execErr;
        let execOutput = '';
        execStream.on('close', () => {
          console.log('Output from remote server:\n', execOutput);
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
