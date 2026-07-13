async function test() {
  try {
    const response = await fetch('http://localhost:3001/api/email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: 'saju2026kr@naver.com',
        subject: '혜안당 이메일 발송 테스트',
        html: '<p>이메일이 네이버 SMTP를 통해 성공적으로 발송되었습니다.</p>'
      })
    });
    const result = await response.json();
    console.log('Response:', result);
  } catch (err) {
    console.error('Error:', err);
  }
}

test();
