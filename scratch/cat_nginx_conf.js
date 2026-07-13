const { Client } = require('ssh2');
const conn = new Client();
conn.on('ready', () => {
  console.log('SSH Connected.');
  conn.exec('cat /etc/nginx/conf.d/icit.conf', (err, stream) => {
    if (err) throw err;
    stream.on('close', () => {
      conn.end();
      console.log('SSH Closed.');
    }).on('data', (data) => {
      process.stdout.write(data);
    }).stderr.on('data', (data) => {
      process.stderr.write(data);
    });
  });
}).connect({
  host: '121.125.61.114',
  port: 22,
  username: 'artpani',
  password: 'Artpani!2026_x'
});
