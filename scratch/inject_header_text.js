const { Client } = require('ssh2');
const fs = require('fs');

async function injectText() {
  const conn = new Client();
  await new Promise((res, rej) => conn.on('ready', res).on('error', rej).connect({
    host: '121.125.61.114',
    port: 22,
    username: 'artpani',
    privateKey: fs.readFileSync('C:\\Users\\user\\.ssh\\id_ed25519_121_125_61_114')
  }));

  console.log('Replacing header button text in remote source files...');

  const replaceScript = `
    node -e "
      const fs = require('fs');
      const files = [
        '/home/www/saju-artpani/frontend/src/app/page.js'
      ];
      for (const f of files) {
        try {
          let content = fs.readFileSync(f, 'utf8');
          content = content.replace(/무료 사주 보기/g, '사주 체험판 보기');
          content = content.replace(/내 사주 무료 확인하기/g, '사주 체험판 보러 가기');
          fs.writeFileSync(f, content, 'utf8');
          console.log('Successfully updated ' + f);
        } catch (e) {
          console.error('Error updating ' + f + ':', e.message);
        }
      }
    "
  `;

  const out = await execCmd(conn, replaceScript);
  console.log('REPLACE OUTPUT:\n', out);

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

injectText().catch(err => console.error('ERROR:', err));
