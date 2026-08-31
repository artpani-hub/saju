const https = require('https');

https.get('https://saju.artpani.com', (res) => {
  let body = '';
  res.on('data', chunk => body += chunk);
  res.on('end', () => {
    console.log("STATUS:", res.statusCode);
    const scripts = body.match(/src="(\/_next\/static\/[^"]+)"/g) || [];
    const csses = body.match(/href="(\/_next\/static\/[^"]+)"/g) || [];
    console.log("FOUND SCRIPTS:", scripts.slice(0, 3));
    console.log("FOUND CSS/LINKS:", csses.slice(0, 5));

    if (scripts.length > 0) {
      const firstScript = 'https://saju.artpani.com' + scripts[0].replace('src="', '').replace('"', '');
      https.get(firstScript, (sRes) => {
        console.log("SCRIPT HTTP STATUS:", sRes.statusCode, "FOR:", firstScript);
      });
    }
  });
}).on('error', e => console.error(e));
