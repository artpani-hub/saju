const https = require('https');

https.get('https://saju.artpani.com/artpani', (res) => {
  let body = '';
  res.on('data', chunk => body += chunk);
  res.on('end', () => {
    console.log("STATUS:", res.statusCode);
    console.log("Contains '사주 체험판 리포트':", body.includes("사주 체험판 리포트"));
    console.log("Contains '체험 혜택':", body.includes("체험 혜택"));
  });
}).on('error', e => console.error(e));
