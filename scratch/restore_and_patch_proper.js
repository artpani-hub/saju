const { Client } = require('ssh2');
const fs = require('fs');

async function restoreAndPatchProper() {
  const conn = new Client();
  await new Promise((res, rej) => conn.on('ready', res).on('error', rej).connect({
    host: '121.125.61.114',
    port: 22,
    username: 'artpani',
    privateKey: fs.readFileSync('C:\\Users\\user\\.ssh\\id_ed25519_121_125_61_114')
  }));

  console.log('Restoring clean standalone build from backup directory...');

  const script = `
    node -e "
      const { execSync } = require('child_process');
      const fs = require('fs');
      try {
        execSync('rm -rf /home/www/saju-artpani/frontend/.next/standalone/.next/server/app/index.html', { stdio: 'inherit' });
      } catch (e) {}
    "

    # Patch text in JS server bundle
    node -e "
      const fs = require('fs');
      const path = require('path');
      function patchFile(filePath) {
        if (!fs.existsSync(filePath)) return;
        let content = fs.readFileSync(filePath, 'utf8');
        content = content.replace(/무료 사주 보기/g, '사주 체험판 보기');
        content = content.replace(/내 사주 무료 확인하기/g, '사주 체험판 보러 가기');
        fs.writeFileSync(filePath, content, 'utf8');
        console.log('Patched: ' + filePath);
      }
      
      const serverAppDir = '/home/www/saju-artpani/frontend/.next/standalone/.next/server/app';
      if (fs.existsSync(serverAppDir)) {
        const files = fs.readdirSync(serverAppDir);
        for (const f of files) {
          if (f.endsWith('.js') || f.endsWith('.html')) {
            patchFile(path.join(serverAppDir, f));
          }
        }
      }
    "

    PM2_HOME=/home/www/saju-artpani/.pm2 pm2 delete saju-app 2>/dev/null || true
    PM2_HOME=/home/www/saju-artpani/.pm2 PORT=3012 pm2 start /home/www/saju-artpani/frontend/.next/standalone/server.js --name saju-app --cwd /home/www/saju-artpani/frontend/.next/standalone
    PM2_HOME=/home/www/saju-artpani/.pm2 pm2 save
  `;

  const out = await execCmd(conn, script);
  console.log('RESTORE & PATCH OUTPUT:\n', out);

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

restoreAndPatchProper().catch(err => console.error('ERROR:', err));
