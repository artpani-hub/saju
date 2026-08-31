const { Client } = require('ssh2');
const fs = require('fs');

async function updatePageAndRebuild() {
  const conn = new Client();
  await new Promise((res, rej) => conn.on('ready', res).on('error', rej).connect({
    host: '121.125.61.114',
    port: 22,
    username: 'artpani',
    privateKey: fs.readFileSync('C:\\Users\\user\\.ssh\\id_ed25519_121_125_61_114')
  }));

  console.log('Updating page.js text and building production bundle...');

  const script = `
    # Copy modified files from /tmp/saju_deploy_new to src
    node -e "
      const fs = require('fs');
      const files = [
        'src/app/result/page.js',
        'src/app/input/page.js',
        'src/app/artpani/page.js',
        'src/app/page.js',
        'src/app/api/payment-webhook/route.js',
        'prisma/seed-products.js'
      ];
      for (const f of files) {
        try {
          const content = fs.readFileSync('/tmp/saju_deploy_new/' + f, 'utf8');
          fs.writeFileSync('/home/www/saju-artpani/frontend/' + f, content, 'utf8');
          console.log('Updated ' + f);
        } catch (e) {
          console.error('Error on ' + f + ':', e.message);
        }
      }
    "

    # Remove existing .next build and re-build
    cd /home/www/saju-artpani/frontend &&
    rm -rf .next &&
    npx next build &&
    PM2_HOME=/home/www/saju-artpani/.pm2 pm2 restart saju-app
  `;

  const out = await execCmd(conn, script);
  console.log('REBUILD OUTPUT:\n', out);

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

updatePageAndRebuild().catch(err => console.error('ERROR:', err));
