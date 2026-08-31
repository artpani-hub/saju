const { Client } = require('ssh2');
const fs = require('fs');

async function deployViaWritableTmp() {
  const conn = new Client();
  await new Promise((res, rej) => conn.on('ready', res).on('error', rej).connect({
    host: '121.125.61.114',
    port: 22,
    username: 'artpani',
    privateKey: fs.readFileSync('C:\\Users\\user\\.ssh\\id_ed25519_121_125_61_114')
  }));

  console.log('Copying frontend source to /tmp/saju_runtime_frontend and replacing page.js with fresh local version...');

  const script = `
    # Create writable runtime directory in /tmp
    rm -rf /tmp/saju_runtime_frontend
    mkdir -p /tmp/saju_runtime_frontend

    # Copy all files from /home/www/saju-artpani/frontend to /tmp/saju_runtime_frontend
    cp -r /home/www/saju-artpani/frontend/* /tmp/saju_runtime_frontend/ 2>/dev/null || true
    cp -r /home/www/saju-artpani/frontend/.* /tmp/saju_runtime_frontend/ 2>/dev/null || true

    # Overwrite artpani page.js with fresh local page.js in /tmp/saju_runtime_frontend
    cp /tmp/fresh_page.js /tmp/saju_runtime_frontend/src/app/artpani/page.js

    # Verify that fresh page is inside /tmp/saju_runtime_frontend
    grep -n "free_sample" /tmp/saju_runtime_frontend/src/app/artpani/page.js | head -n 3

    # Rebuild inside /tmp/saju_runtime_frontend
    cd /tmp/saju_runtime_frontend &&
    rm -rf .next &&
    npx next build &&

    # Start PM2 from /tmp/saju_runtime_frontend
    PM2_HOME=/home/www/saju-artpani/.pm2 pm2 delete saju-app 2>/dev/null || true
    PM2_HOME=/home/www/saju-artpani/.pm2 PORT=3012 pm2 start npm --name "saju-app" --cwd /tmp/saju_runtime_frontend -- start -- -p 3012
    PM2_HOME=/home/www/saju-artpani/.pm2 pm2 save
  `;

  const out = await execCmd(conn, script);
  console.log('WRITABLE TMP DEPLOY OUTPUT:\n', out);

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

deployViaWritableTmp().catch(err => console.error('ERROR:', err));
