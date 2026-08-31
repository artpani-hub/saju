const { Client } = require('ssh2');
const fs = require('fs');

async function buildCleanRemote() {
  const conn = new Client();
  await new Promise((res, rej) => conn.on('ready', res).on('error', rej).connect({
    host: '121.125.61.114',
    port: 22,
    username: 'artpani',
    privateKey: fs.readFileSync('C:\\Users\\user\\.ssh\\id_ed25519_121_125_61_114')
  }));

  console.log('Cleaning .next and building Next.js cleanly on remote server...');

  const script = `
    cd /home/www/saju-artpani/frontend &&
    rm -rf .next 2>/dev/null || true
    npx next build &&
    PM2_HOME=/home/www/saju-artpani/.pm2 pm2 delete saju-app 2>/dev/null || true &&
    PM2_HOME=/home/www/saju-artpani/.pm2 PORT=3012 pm2 start /home/www/saju-artpani/frontend/.next/standalone/server.js --name saju-app --cwd /home/www/saju-artpani/frontend/.next/standalone &&
    PM2_HOME=/home/www/saju-artpani/.pm2 pm2 save
  `;

  conn.exec(script, (err, stream) => {
    if (err) throw err;
    stream.on('close', (code) => {
      console.log('CLEAN BUILD EXIT CODE:', code);
      conn.end();
    }).on('data', data => console.log(data.toString()))
    .stderr.on('data', data => console.error(data.toString()));
  });
}

buildCleanRemote().catch(err => console.error('BUILD ERROR:', err));
