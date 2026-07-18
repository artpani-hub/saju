const https = require('https');

console.log("=== Querying External saju.artpani.com Dashboard API ===");

https.get('https://saju.artpani.com/api/admin/dashboard?adminPassword=artpani1234', (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    console.log("HTTP Status Code:", res.statusCode);
    try {
      const parsed = JSON.parse(data);
      console.log("API Response Stats:", JSON.stringify(parsed.stats, null, 2));
    } catch (e) {
      console.log("Raw Response Data:", data);
    }
    process.exit(0);
  });
}).on('error', (err) => {
  console.error("Error fetching external API:", err);
  process.exit(1);
});
