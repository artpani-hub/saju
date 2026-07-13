const { Client } = require('ssh2');
const conn = new Client();
conn.on('ready', () => {
  console.log('SSH Client Ready');
  
  // sudo 없이 3000포트 프로세스를 먼저 검색하고 종료해봅니다.
  const command = 'lsof -t -i:3000 | xargs -r kill -9 && pm2 restart saju-app';
  console.log(`Executing command: ${command}`);
  
  conn.exec(command, (err, stream) => {
    if (err) throw err;
    stream.on('close', (code, signal) => {
      console.log(`Command closed with code: ${code}`);
      conn.end();
    }).on('data', (data) => {
      console.log('STDOUT: ' + data.toString());
    }).stderr.on('data', (data) => {
      console.log('STDERR: ' + data.toString());
    });
  });
}).connect({
  host: '121.125.61.114',
  port: 22,
  username: 'saju-artpani',
  password: 'saju_artpani_ssh_2026!'
});
