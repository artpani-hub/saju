const { Client } = require('ssh2');
const fs = require('fs');

async function exactReplaceRemotePage() {
  const conn = new Client();
  await new Promise((res, rej) => conn.on('ready', res).on('error', rej).connect({
    host: '121.125.61.114',
    port: 22,
    username: 'artpani',
    privateKey: fs.readFileSync('C:\\Users\\user\\.ssh\\id_ed25519_121_125_61_114')
  }));

  console.log('Replacing line 286 text in remote page.js and rebuilding...');

  const script = `
    node -e "
      const fs = require('fs');
      const p = '/home/www/saju-artpani/frontend/src/app/page.js';
      let content = fs.readFileSync(p, 'utf8');
      content = content.replace(/무료 사주 보기/g, '사주 체험판 보기');
      content = content.replace(/내 사주 무료 확인하기/g, '사주 체험판 보러 가기');
      fs.writeFileSync(p, content, 'utf8');
      console.log('REPLACEMENT_COMPLETED');
    "

    cd /home/www/saju-artpani/frontend &&
    mv .next .next_bak_\$(date +%s) 2>/dev/null || true &&
    mkdir -p .next &&
    chmod 777 .next &&
    npx next build &&
    PM2_HOME=/home/www/saju-artpani/.pm2 pm2 reload saju-app || PM2_HOME=/home/www/saju-artpani/.pm2 pm2 restart saju-app
  `;

  const out = await execCmd(conn, script);
  console.log('EXACT REPLACE OUTPUT:\n', out);

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

exactReplaceRemotePage().catch(err => console.error('ERROR:', err));
