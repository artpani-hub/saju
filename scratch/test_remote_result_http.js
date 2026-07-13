const { Client } = require('ssh2');
const path = require('path');
const fs = require('fs');

const conn = new Client();
conn.on('ready', () => {
  console.log('SSH Connected.');
  
  // 원격 서버 내부(localhost:3012)에서 웹훅 API로 모의 취소 웹훅 POST 요청을 전송해보고 응답 로깅
  const testPayload = JSON.stringify({
    type: "Transaction.Cancelled",
    data: {
      paymentId: "payment_mock_test_1234",
      status: "CANCELLED"
    }
  });

  const cmd = `curl -s -X POST http://127.0.0.1:3012/api/payment-webhook \
    -H "Content-Type: application/json" \
    -d '${testPayload}'`;

  console.log('Running test curl...');
  conn.exec(cmd, (err, stream) => {
    if (err) throw err;
    let output = '';
    stream.on('close', () => {
      console.log('Test Request Finished. Response:');
      console.log(output);
      
      // 호출 직후 pm2 로그의 마지막 10줄 확인
      console.log('\nFetching latest pm2 logs...');
      conn.exec('pm2 logs saju-app --lines 15 --nostream', (logErr, logStream) => {
        if (logErr) throw logErr;
        let logOutput = '';
        logStream.on('close', () => {
          console.log(logOutput);
          conn.end();
        }).on('data', (d) => { logOutput += d.toString(); });
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
