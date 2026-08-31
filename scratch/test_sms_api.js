const http = require('http');

const data = JSON.stringify({
  receiver: "01096167393",
  msg: "[혜안당 테스트] 14,900원 결제 완료 SMS 발송 테스트입니다.",
  title: "[혜안당]"
});

const req = http.request('http://localhost:3001/api/sms', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(data)
  }
}, (res) => {
  let responseData = '';
  res.on('data', chunk => responseData += chunk);
  res.on('end', () => {
    console.log("STATUS:", res.statusCode);
    console.log("RESPONSE:", responseData);
  });
});

req.on('error', (e) => console.error("ERR:", e.message));
req.write(data);
req.end();
