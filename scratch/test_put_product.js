const http = require('http');

const data = JSON.stringify({
  key: "free_sample",
  name: "무료 체험 사주 리포트",
  price: 0,
  originalPrice: 15000,
  tag: "무료 0원",
  badge: "무료 혜택",
  description: "무료 체험 사주 설명",
  isSale: true
});

const options = {
  hostname: 'localhost',
  port: 3001,
  path: '/api/admin/products',
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(data)
  }
};

console.log("Sending PUT request to http://localhost:3001/api/admin/products...");

const req = http.request(options, (res) => {
  console.log(`STATUS: ${res.statusCode}`);
  let body = '';
  res.on('data', (chunk) => body += chunk);
  res.on('end', () => {
    console.log('RESPONSE BODY:', body);
  });
});

req.on('error', (e) => {
  console.error(`PROBLEM WITH REQUEST: ${e.message}`);
});

req.write(data);
req.end();
