const { Client } = require('ssh2');
const fs = require('fs');

async function buildCleanFinal() {
  const conn = new Client();
  await new Promise((res, rej) => conn.on('ready', res).on('error', rej).connect({
    host: '121.125.61.114',
    port: 22,
    username: 'artpani',
    privateKey: fs.readFileSync('C:\\Users\\user\\.ssh\\id_ed25519_121_125_61_114')
  }));

  console.log('Running npx next build cleanly in frontend folder...');

  const script = `
    cd /home/www/saju-artpani/frontend &&
    
    # Overwrite updated 6 files
    cp -r /tmp/saju_deploy_new/* /home/www/saju-artpani/frontend/ 2>/dev/null || true &&

    # Build standard Next.js app
    npx next build &&

    # Copy dev.db into standalone prisma
    mkdir -p /home/www/saju-artpani/frontend/.next/standalone/prisma &&
    cp /home/www/saju-artpani/frontend/prisma/dev.db /home/www/saju-artpani/frontend/.next/standalone/prisma/dev.db 2>/dev/null || true &&

    PM2_HOME=/home/www/saju-artpani/.pm2 pm2 delete saju-app 2>/dev/null || true &&
    PM2_HOME=/home/www/saju-artpani/.pm2 PORT=3012 pm2 start /home/www/saju-artpani/frontend/.next/standalone/server.js --name saju-app --cwd /home/www/saju-artpani/frontend/.next/standalone &&
    PM2_HOME=/home/www/saju-artpani/.pm2 pm2 save
  `;

  const out = await execCmd(conn, script);
  console.log('FINAL BUILD OUTPUT:\n', out);

  conn.end();
}

function execCmd(conn, cmd) {
  return new Promise((resolve, reject) => {
    conn.exec(cmd, (err, stream) => {
      if (err) return reject(err);
      let stdout = '';
      let stderr = '';
      stream.on('close', () => resolve(stdout + '\n' + stderr));
      stream.on('data', data => stdout += data.toString());
      stream.stderr.on('data', data => stderr += data.toString());
    });
  });
}

buildCleanFinal().catch(err => console.error('ERROR:', err));
