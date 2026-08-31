const { Client } = require('ssh2');
const fs = require('fs');

async function patchBundleText() {
  const conn = new Client();
  await new Promise((res, rej) => conn.on('ready', res).on('error', rej).connect({
    host: '121.125.61.114',
    port: 22,
    username: 'artpani',
    privateKey: fs.readFileSync('C:\\Users\\user\\.ssh\\id_ed25519_121_125_61_114')
  }));

  console.log('Patching standalone build JS files directly...');

  const script = `
    node -e "
      const fs = require('fs');
      const path = require('path');

      function walkAndReplace(dir) {
        if (!fs.existsSync(dir)) return;
        const files = fs.readdirSync(dir, { withFileTypes: true });
        for (const file of files) {
          const fullPath = path.join(dir, file.name);
          if (file.isDirectory()) {
            walkAndReplace(fullPath);
          } else if (file.name.endsWith('.js') || file.name.endsWith('.html')) {
            try {
              let content = fs.readFileSync(fullPath, 'utf8');
              if (content.includes('무료 사주 보기') || content.includes('내 사주 무료 확인하기')) {
                console.log('Found target text in: ' + fullPath);
                content = content.replace(/무료 사주 보기/g, '사주 체험판 보기');
                content = content.replace(/내 사주 무료 확인하기/g, '사주 체험판 보러 가기');
                fs.writeFileSync(fullPath, content, 'utf8');
                console.log('Successfully patched: ' + fullPath);
              }
            } catch (e) {
              // Ignore
            }
          }
        }
      }

      walkAndReplace('/home/www/saju-artpani/frontend/.next/standalone/.next/server');
      console.log('PATCH_FINISHED');
    "
  `;

  const out = await execCmd(conn, script);
  console.log('PATCH OUTPUT:\n', out);

  console.log('Reloading saju-app PM2...');
  const reloadOut = await execCmd(conn, 'PM2_HOME=/home/www/saju-artpani/.pm2 pm2 reload saju-app');
  console.log('RELOAD OUTPUT:\n', reloadOut);

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

patchBundleText().catch(err => console.error('PATCH ERROR:', err));
