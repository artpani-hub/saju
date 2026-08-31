const { Client } = require('ssh2');
const fs = require('fs');

const conn = new Client();
conn.on('ready', () => {
  console.log('Cleaning all PM2 processes and restarting saju-app clean...');

  const cleanCmd = `
    PM2_HOME=/home/www/saju-artpani/.pm2 pm2 kill || true
    pm2 kill || true

    # Find and kill any orphan process listening on port 3012
    fuser -k 3012/tcp 2>/dev/null || true

    # Restart real saju-app cleanly
    PM2_HOME=/home/www/saju-artpani/.pm2 PORT=3012 pm2 start /home/www/saju-artpani/frontend/.next/standalone/server.js --name saju-app --cwd /home/www/saju-artpani/frontend/.next/standalone
    PM2_HOME=/home/www/saju-artpani/.pm2 pm2 save
  `;

  conn.exec(cleanCmd, (err, stream) => {
    if (err) throw err;
    stream.on('close', (code) => {
      console.log('PM2 Clean Exit Code:', code);
      conn.end();
    }).on('data', data => console.log('STDOUT:', data.toString()))
    .stderr.on('data', data => console.error('STDERR:', data.toString()));
  });
}).connect({
  host: '121.125.61.114',
  port: 22,
  username: 'artpani',
  privateKey: fs.readFileSync('C:\\Users\\user\\.ssh\\id_ed25519_121_125_61_114')
});
