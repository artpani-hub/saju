const { Client } = require('ssh2');
const fs = require('fs');

async function buildInCleanTmp() {
  const conn = new Client();
  await new Promise((res, rej) => conn.on('ready', res).on('error', rej).connect({
    host: '121.125.61.114',
    port: 22,
    username: 'artpani',
    privateKey: fs.readFileSync('C:\\Users\\user\\.ssh\\id_ed25519_121_125_61_114')
  }));

  console.log('Building standalone in /tmp/fresh_standalone_deploy cleanly...');

  const script = `
    rm -rf /tmp/fresh_standalone_deploy &&
    mkdir -p /tmp/fresh_standalone_deploy &&
    
    # Copy project files without .next
    cp -r /home/www/saju-artpani/frontend/src /tmp/fresh_standalone_deploy/ 2>/dev/null || true &&
    cp -r /home/www/saju-artpani/frontend/public /tmp/fresh_standalone_deploy/ 2>/dev/null || true &&
    cp -r /home/www/saju-artpani/frontend/prisma /tmp/fresh_standalone_deploy/ 2>/dev/null || true &&
    cp /home/www/saju-artpani/frontend/package.json /tmp/fresh_standalone_deploy/ 2>/dev/null || true &&
    cp /home/www/saju-artpani/frontend/.env /tmp/fresh_standalone_deploy/ 2>/dev/null || true &&
    cp /home/www/saju-artpani/frontend/next.config.js /tmp/fresh_standalone_deploy/ 2>/dev/null || true &&
    cp /home/www/saju-artpani/frontend/postcss.config.js /tmp/fresh_standalone_deploy/ 2>/dev/null || true &&
    cp /home/www/saju-artpani/frontend/jsconfig.json /tmp/fresh_standalone_deploy/ 2>/dev/null || true &&

    # Overwrite updated 6 files
    cp -r /tmp/saju_deploy_new/* /tmp/fresh_standalone_deploy/ 2>/dev/null || true &&

    # Symlink node_modules
    ln -s /home/www/saju-artpani/frontend/node_modules /tmp/fresh_standalone_deploy/node_modules &&

    cd /tmp/fresh_standalone_deploy &&
    npx next build &&

    # Copy DB to standalone prisma
    mkdir -p /tmp/fresh_standalone_deploy/.next/standalone/prisma &&
    cp /home/www/saju-artpani/frontend/prisma/dev.db /tmp/fresh_standalone_deploy/.next/standalone/prisma/dev.db 2>/dev/null || true &&

    PM2_HOME=/home/www/saju-artpani/.pm2 pm2 delete saju-app 2>/dev/null || true &&
    PM2_HOME=/home/www/saju-artpani/.pm2 PORT=3012 pm2 start /tmp/fresh_standalone_deploy/.next/standalone/server.js --name saju-app --cwd /tmp/fresh_standalone_deploy/.next/standalone &&
    PM2_HOME=/home/www/saju-artpani/.pm2 pm2 save
  `;

  const out = await execCmd(conn, script);
  console.log('TMP STANDALONE BUILD OUTPUT:\n', out);

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

buildInCleanTmp().catch(err => console.error('ERROR:', err));
