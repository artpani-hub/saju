const { Client } = require('ssh2');
const path = require('path');
const fs = require('fs');

const conn = new Client();
conn.on('ready', () => {
  console.log('SSH Connected.');

  // 원격 서버에 Node.js 로 HTTP POST 를 날리는 스크립트 작성
  const nodeScript = `
const http = require('http');

const payload = JSON.stringify({
  type: "Transaction.Cancelled",
  data: {
    paymentId: "payment_mock_test_1234",
    status: "CANCELLED"
  }
});

const req = http.request({
  hostname: '127.0.0.1',
  port: 3012,
  path: '/api/payment-webhook',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(payload)
  }
}, (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    console.log('HTTP Status:', res.statusCode);
    console.log('Response Body:', data);
  });
});

req.on('error', (err) => {
  console.error('Request Error:', err);
});

req.write(payload);
req.end();
`;

  // 원격지에 쓰기
  conn.exec(`cat << 'EOF' > /home/www/saju-artpani/frontend/test_webhook.js\n${nodeScript}\nEOF`, (err, stream) => {
    if (err) throw err;
    stream.on('close', () => {
      console.log('test_webhook.js created on server. Executing it...');
      
      // 실행
      conn.exec('node /home/www/saju-artpani/frontend/test_webhook.js', (execErr, execStream) => {
        if (execErr) throw execErr;
        let execOutput = '';
        execStream.on('close', () => {
          console.log('Node Webhook Test Output:\n', execOutput);
          
          // pm2 logs 10줄 확인
          conn.exec('pm2 logs saju-app --lines 15 --nostream', (logErr, logStream) => {
            if (logErr) throw logErr;
            let logOutput = '';
            logStream.on('close', () => {
              console.log('Latest PM2 Logs:\n', logOutput);
              conn.end();
            }).on('data', (d) => { logOutput += d.toString(); });
          });
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
