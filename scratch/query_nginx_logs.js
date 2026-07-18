const { Client } = require('ssh2');

const conn = new Client();
conn.on('ready', () => {
  console.log('SSH Connected.');
  
  // 가가님의 전화번호 '7526878' 또는 이름이 들어간 /result URL 요청 검색
  // 6769 주문번호 검색
  const command = `
    echo "=== Nginx Result Page Requests (7526878) ==="
    sudo grep -h -i "/result" /var/log/nginx/access.log* 2>/dev/null | grep -E "7526878|6769" || echo "No result page logs found"
    
    echo "=== Nginx API Orders Requests ==="
    sudo grep -h -i "/api/orders" /var/log/nginx/access.log* 2>/dev/null | grep -E "7526878|6769" || echo "No api orders logs found"
  `;

  conn.exec(command, (err, stream) => {
    if (err) throw err;
    let stdout = '';
    let stderr = '';
    stream.on('close', () => {
      console.log('--- stdout ---');
      console.log(stdout);
      console.log('--- stderr ---');
      console.log(stderr);
      conn.end();
      console.log('SSH Closed.');
    }).on('data', (data) => {
      stdout += data.toString();
    }).stderr.on('data', (data) => {
      stderr += data.toString();
    });
  });
}).connect({
  host: '121.125.61.114',
  port: 22,
  username: 'artpani',
  password: 'Artpani!2026_x'
});
