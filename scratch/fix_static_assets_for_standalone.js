const { Client } = require('ssh2');
const fs = require('fs');

async function fixStaticAssets() {
  const conn = new Client();
  await new Promise((res, rej) => conn.on('ready', res).on('error', rej).connect({
    host: '121.125.61.114',
    port: 22,
    username: 'artpani',
    privateKey: fs.readFileSync('C:\\Users\\user\\.ssh\\id_ed25519_121_125_61_114')
  }));

  console.log('Linking .next/static and public into standalone directory...');

  const script = `
    # Create symlinks or copy .next/static and public into standalone
    mkdir -p /home/www/saju-artpani/frontend/.next/standalone/.next
    
    # Clean previous broken symlinks or folders
    rm -rf /home/www/saju-artpani/frontend/.next/standalone/.next/static 2>/dev/null || true
    rm -rf /home/www/saju-artpani/frontend/.next/standalone/public 2>/dev/null || true

    # Link/Copy static and public
    cp -r /home/www/saju-artpani/frontend/.next/static /home/www/saju-artpani/frontend/.next/standalone/.next/static 2>/dev/null || true
    cp -r /home/www/saju-artpani/frontend/public /home/www/saju-artpani/frontend/.next/standalone/public 2>/dev/null || true

    # Grant read permissions
    chmod -R 777 /home/www/saju-artpani/frontend/.next/standalone/.next/static 2>/dev/null || true
    chmod -R 777 /home/www/saju-artpani/frontend/.next/standalone/public 2>/dev/null || true

    PM2_HOME=/home/www/saju-artpani/.pm2 pm2 reload saju-app || PM2_HOME=/home/www/saju-artpani/.pm2 pm2 restart saju-app
  `;

  const out = await execCmd(conn, script);
  console.log('STATIC ASSETS FIX OUTPUT:\n', out);

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

fixStaticAssets().catch(err => console.error('ERROR:', err));
