const { Client } = require('ssh2');
const conn = new Client();
conn.on('ready', () => {
  console.log('SSH Client Ready');
  const url = 'http://localhost:3012/result?name=%EB%85%B8%EC%9D%80%EA%B2%BD&gender=female&type=newyear&calendar=solar&year=1995&month=5&day=15&hour=%EB%AA%A8%EB%A6%84';
  const nodeCmd = `node -e "const http = require('http'); http.get('${url}', (res) => { console.log('STATUS:', res.statusCode); }).on('error', console.error);"`;
  conn.exec(nodeCmd, (err, stream) => {
    if (err) throw err;
    stream.on('close', () => conn.end())
      .on('data', (d) => console.log('Node test output:', d.toString().trim()))
      .stderr.on('data', (d) => console.log('STDERR:', d.toString()));
  });
}).connect({
  host: '121.125.61.114',
  port: 22,
  username: 'saju-artpani',
  password: 'saju_artpani_ssh_2026!'
});
