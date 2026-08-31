const https = require('https');

https.get('https://saju.artpani.com', (res) => {
  let body = '';
  res.on('data', chunk => body += chunk);
  res.on('end', () => {
    console.log("STATUS:", res.statusCode);
    
    // Extract CSS file link tag
    const cssMatches = body.match(/href="(\/_next\/static\/css\/[^"]+\.css)"/);
    if (cssMatches && cssMatches[1]) {
      const cssUrl = 'https://saju.artpani.com' + cssMatches[1];
      console.log("Testing CSS URL:", cssUrl);
      
      https.get(cssUrl, (cssRes) => {
        console.log("CSS HTTP STATUS:", cssRes.statusCode);
        console.log("CSS Content-Type:", cssRes.headers['content-type']);
      });
    } else {
      console.log("No CSS href match found in HTML body.");
    }
  });
}).on('error', e => console.error(e));
