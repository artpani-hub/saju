const { Client } = require('ssh2');
const fs = require('fs');

async function solvePermissionViaReexport() {
  const conn = new Client();
  await new Promise((res, rej) => conn.on('ready', res).on('error', rej).connect({
    host: '121.125.61.114',
    port: 22,
    username: 'artpani',
    privateKey: fs.readFileSync('C:\\Users\\user\\.ssh\\id_ed25519_121_125_61_114')
  }));

  console.log('Creating /home/www/saju-artpani/frontend/src/app/artpani_admin directory...');
  await execCmd(conn, 'mkdir -p /home/www/saju-artpani/frontend/src/app/artpani_admin');

  const sftp = await new Promise((res, rej) => conn.sftp((err, s) => err ? rej(err) : res(s)));

  console.log('Uploading fresh local page.js to /home/www/saju-artpani/frontend/src/app/artpani_admin/page.js...');
  await new Promise((res, rej) => {
    sftp.fastPut('src/app/artpani/page.js', '/home/www/saju-artpani/frontend/src/app/artpani_admin/page.js', err => err ? rej(err) : res());
  });

  console.log('Setting up next.config.mjs rewrite from /artpani -> /artpani_admin...');

  const script = `
    node -e "
      const fs = require('fs');
      const content = \`/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/artpani',
        destination: '/artpani_admin',
      },
    ];
  },
};
export default nextConfig;\`;
      fs.writeFileSync('/home/www/saju-artpani/frontend/next.config.mjs', content, 'utf8');
      console.log('REWRITE_CONFIG_UPDATED');
    "

    cd /home/www/saju-artpani/frontend &&
    rm -rf .next &&
    npx next build &&

    PM2_HOME=/home/www/saju-artpani/.pm2 pm2 delete saju-app 2>/dev/null || true
    PM2_HOME=/home/www/saju-artpani/.pm2 PORT=3012 pm2 start npm --name "saju-app" --cwd /home/www/saju-artpani/frontend -- start -- -p 3012
    PM2_HOME=/home/www/saju-artpani/.pm2 pm2 save
  `;

  const out = await execCmd(conn, script);
  console.log('REEXPORT SOLVE OUTPUT:\n', out);

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

solvePermissionViaReexport().catch(err => console.error('ERROR:', err));
