const { Client } = require('ssh2');
const fs = require('fs');

async function deployAdminPanelRewriteCorrect() {
  const conn = new Client();
  await new Promise((res, rej) => conn.on('ready', res).on('error', rej).connect({
    host: '121.125.61.114',
    port: 22,
    username: 'artpani',
    privateKey: fs.readFileSync('C:\\Users\\user\\.ssh\\id_ed25519_121_125_61_114')
  }));

  console.log('Creating directory /home/www/saju-artpani/frontend/src/app/admin_panel...');
  await execCmd(conn, 'mkdir -p /home/www/saju-artpani/frontend/src/app/admin_panel');

  const sftp = await new Promise((res, rej) => conn.sftp((err, s) => err ? rej(err) : res(s)));

  console.log('SFTP Uploading fresh local artpani page to new directory /src/app/admin_panel...');
  await new Promise((res, rej) => {
    sftp.fastPut('src/app/artpani/page.js', '/home/www/saju-artpani/frontend/src/app/admin_panel/page.js', err => err ? rej(err) : res());
  });

  console.log('Setting up next.config.mjs rewrites to map /artpani -> /admin_panel...');

  const script = `
    node -e "
      const fs = require('fs');
      const content = \`/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/artpani',
        destination: '/admin_panel',
      },
    ];
  },
};
export default nextConfig;\`;
      fs.writeFileSync('/home/www/saju-artpani/frontend/next.config.mjs', content, 'utf8');
      console.log('REWRITE_CONFIG_UPDATED_SUCCESSFULLY');
    "

    cd /home/www/saju-artpani/frontend &&
    rm -rf .next &&
    npx next build &&

    PM2_HOME=/home/www/saju-artpani/.pm2 pm2 delete saju-app 2>/dev/null || true
    PM2_HOME=/home/www/saju-artpani/.pm2 PORT=3012 pm2 start npm --name "saju-app" --cwd /home/www/saju-artpani/frontend -- start -- -p 3012
    PM2_HOME=/home/www/saju-artpani/.pm2 pm2 save
  `;

  const out = await execCmd(conn, script);
  console.log('REWRITE DEPLOY OUTPUT:\n', out);

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

deployAdminPanelRewriteCorrect().catch(err => console.error('ERROR:', err));
