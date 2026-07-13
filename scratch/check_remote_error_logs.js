const { Client } = require('ssh2');
const conn = new Client();
conn.on('ready', () => {
  console.log('SSH Client Ready');
  // pm2 show saju-app 명령을 통해 error log path 확인 및 tail 실행
  conn.exec('pm2 show saju-app', (err, stream) => {
    if (err) throw err;
    let output = '';
    stream.on('close', (code) => {
      console.log('PM2 SHOW OUTPUT:');
      console.log(output);
      
      // error log path를 정규식으로 추출
      const match = output.match(/error log path\s+\│\s+([^\s│]+)/);
      if (match && match[1]) {
        const errPath = match[1];
        console.log('Error Log Path found:', errPath);
        conn.exec(`tail -n 100 ${errPath}`, (tailErr, tailStream) => {
          if (tailErr) throw tailErr;
          tailStream.on('close', () => conn.end())
            .on('data', (d) => console.log('ERROR LOGS:\n', d.toString()));
        });
      } else {
        console.log('Could not parse error log path. Fallback to pm2 logs --err');
        conn.exec('pm2 logs saju-app --err --lines 100 --no-color', (fallbackErr, fallbackStream) => {
          fallbackStream.on('close', () => conn.end())
            .on('data', (d) => console.log(d.toString()));
        });
      }
    }).on('data', (data) => {
      output += data.toString();
    });
  });
}).connect({
  host: '121.125.61.114',
  port: 22,
  username: 'saju-artpani',
  password: 'saju_artpani_ssh_2026!'
});
