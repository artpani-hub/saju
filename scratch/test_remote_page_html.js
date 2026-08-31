const https = require('https');

https.get('https://saju.artpani.com', (res) => {
  let body = '';
  res.on('data', chunk => body += chunk);
  res.on('end', () => {
    console.log("STATUS:", res.statusCode);
    console.log("Contains '사주 체험판 보기':", body.includes("사주 체험판 보기"));
    console.log("Contains '무료 사주 보기':", body.includes("무료 사주 보기"));
    
    // Extract button text snippets
    const matches = body.match(/<a[^>]*>[^<]*보기[^<]*<\/a>/g) || [];
    console.log("MATCHED BUTTONS:", matches);
  });
}).on('error', e => console.error(e));
