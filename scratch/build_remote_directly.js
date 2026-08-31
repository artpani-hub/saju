const { Client } = require('ssh2');
const fs = require('fs');

async function buildRemoteDirectly() {
  const conn = new Client();
  await new Promise((res, rej) => conn.on('ready', res).on('error', rej).connect({
    host: '121.125.61.114',
    port: 22,
    username: 'artpani',
    privateKey: fs.readFileSync('C:\\Users\\user\\.ssh\\id_ed25519_121_125_61_114')
  }));

  console.log('Building Next.js directly on remote server...');

  const remoteBuildScript = `
    cd /home/www/saju-artpani/frontend &&
    npm run build &&
    PM2_HOME=/home/www/saju-artpani/.pm2 pm2 reload saju-app || PM2_HOME=/home/www/saju-artpani/.pm2 pm2 restart saju-app
  `;

  conn.exec(remoteBuildScript, (err, stream) => {
    if (err) throw err;
    stream.on('close', (code) => {
      console.log('REMOTE BUILD EXIT CODE:', code);
      conn.end();
    }).on('data', data => console.log(data.toString()))
    .stderr.on('data', data => console.error(data.toString()));
  });
}

buildRemoteDirectly().catch(err => console.error('BUILD ERROR:', err));
