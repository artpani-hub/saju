const { Client } = require('ssh2');
const fs = require('fs');

async function patchHeaderFinal() {
  const conn = new Client();
  await new Promise((res, rej) => conn.on('ready', res).on('error', rej).connect({
    host: '121.125.61.114',
    port: 22,
    username: 'artpani',
    privateKey: fs.readFileSync('C:\\Users\\user\\.ssh\\id_ed25519_121_125_61_114')
  }));

  console.log('Patching text strings in standalone server app files...');

  const script = `
    node -e "
      const fs = require('fs');
      const path = require('path');
      
      const appDir = '/home/www/saju-artpani/frontend/.next/standalone/.next/server/app';
      if (fs.existsSync(appDir)) {
        const files = fs.readdirSync(appDir);
        for (const f of files) {
          const fullPath = path.join(appDir, f);
          if (fs.statSync(fullPath).isFile()) {
            try {
              let content = fs.readFileSync(fullPath, 'utf8');
              if (content.includes('무료 사주 보기') || content.includes('내 사주 무료 확인하기')) {
                console.log('Match found in ' + f);
                content = content.replace(/무료 사주 보기/g, '사주 체험판 보기');
                content = content.replace(/내 사주 무료 확인하기/g, '사주 체험판 보러 가기');
                fs.writeFileSync(fullPath, content, 'utf8');
                console.log('Successfully updated ' + f);
              }
            } catch (e) {
              console.error('Error on ' + f + ':', e.message);
            }
          }
        }
      }
    "

    # Also remove index.html so Next.js regenerates page dynamically if needed
    rm -f /home/www/saju-artpani/frontend/.next/standalone/.next/server/app/index.html 2>/dev/null || true

    PM2_HOME=/home/www/saju-artpani/.pm2 pm2 reload saju-app || PM2_HOME=/home/www/saju-artpani/.pm2 pm2 restart saju-app
  `;

  const out = await execCmd(conn, script);
  console.log('PATCH FINAL OUTPUT:\n', out);

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

patchHeaderFinal().catch(err => console.error('ERROR:', err));
