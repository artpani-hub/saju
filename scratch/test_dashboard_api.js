const http = require('http');

http.get('http://localhost:3001/api/admin/dashboard?adminPassword=artpani1234', (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    try {
      const json = JSON.parse(data);
      console.log('Dashboard API Response Success:', json.success);
      console.log('Stats:', JSON.stringify(json.stats, null, 2));
    } catch (e) {
      console.log('Failed to parse JSON:', e.message);
      console.log('Raw data:', data);
    }
  });
}).on('error', (err) => {
  console.error('HTTP Request failed:', err.message);
});
