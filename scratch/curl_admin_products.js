const https = require('https');

https.get('https://saju.artpani.com/api/admin/products', (res) => {
  let body = '';
  res.on('data', chunk => body += chunk);
  res.on('end', () => {
    console.log("STATUS:", res.statusCode);
    console.log("RESPONSE BODY:", body);
  });
}).on('error', e => console.error(e));
