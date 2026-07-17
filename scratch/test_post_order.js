const https = require('https');

const newOrder = {
  id: "ORD_TEST_" + new Date().getTime(),
  name: "미미누",
  email: "mimi@test.com",
  phone: "010-9999-8888",
  productName: "평생 종합 사주팔자 (무료 체험판)",
  amount: 0,
  status: "free",
  sajuGanji: "1995년 8월 25일 (사시)",
  emailStatus: "pending",
  createdAt: "2026-07-17 22:15:00",
  couponCode: null,
  gender: "female",
  calendar: "solar",
  year: "1995",
  month: "8",
  day: "25",
  hour: "사시",
  worryText: "오늘의 운세 무료 사주 테스트",
  reportGrade: "free",
  referer: "direct"
};

const data = JSON.stringify(newOrder);

const options = {
  hostname: 'saju.artpani.com',
  port: 443,
  path: '/api/orders',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(data)
  }
};

const req = https.request(options, (res) => {
  let responseData = '';
  console.log('Status Code:', res.statusCode);
  
  res.on('data', (chunk) => {
    responseData += chunk;
  });
  
  res.on('end', () => {
    console.log('Response:', responseData);
  });
});

req.on('error', (error) => {
  console.error('Error:', error);
});

req.write(data);
req.end();
