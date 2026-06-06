const http = require('http');

const url = 'http://localhost:3000/result?type=newyear&reportGrade=sms&name=%ED%99%8D%EA%B8%B8%EB%8F%99&year=1995&month=8&day=25&hour=10:00&worryText=%EC%9D%B4%EC%A7%81%EA%B3%B5%EB%AF%BC';

http.get(url, (res) => {
  console.log(`STATUS: ${res.statusCode}`);
  console.log(`HEADERS: ${JSON.stringify(res.headers)}`);
  
  let rawData = '';
  res.on('data', (chunk) => { rawData += chunk; });
  res.on('end', () => {
    console.log(`BODY LENGTH: ${rawData.length}`);
    if (rawData.includes('2026 병오년') && rawData.includes('요약')) {
      console.log('TEST PASSED: 요약본 페이지가 HTML 내에 포함되어 있습니다.');
    } else {
      console.log('TEST WARNING: 기대한 키워드가 본문에 보이지 않습니다.');
    }
  });
}).on('error', (e) => {
  console.error(`Got error: ${e.message}`);
});
