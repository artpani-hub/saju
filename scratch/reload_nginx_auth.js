const { Client } = require('ssh2');

const conn = new Client();
conn.on('ready', () => {
  console.log('SSH Connected as artpani.');

  // sudo -S 로 패스워드를 주입하여 nginx -s reload 강제 실행
  const command = 'echo "Artpani!2026_x" | sudo -S nginx -t && echo "Artpani!2026_x" | sudo -S nginx -s reload';

  conn.exec(command, (err, stream) => {
    if (err) throw err;
    let stdout = '';
    let stderr = '';
    stream.on('close', () => {
      console.log('=== Nginx Auth Reload Output ===');
      console.log(stdout);
      if (stderr) {
        console.log('=== Stderr ===');
        console.log(stderr);
      }
      conn.end();
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
