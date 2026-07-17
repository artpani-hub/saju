const http = require('http');

http.get('http://localhost:3001/api/orders?adminPassword=artpani1234', (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    try {
      const json = JSON.parse(data);
      console.log('Orders API Return Array Length:', Array.isArray(json) ? json.length : 'Not Array');
      if (Array.isArray(json) && json.length > 0) {
        console.log('First Order:', JSON.stringify(json[0], null, 2));
      } else {
        console.log('Raw response:', json);
      }
    } catch (e) {
      console.log('Failed to parse JSON:', e.message);
      console.log('Raw data:', data);
    }
  });
}).on('error', (err) => {
  console.error('HTTP Request failed:', err.message);
});
