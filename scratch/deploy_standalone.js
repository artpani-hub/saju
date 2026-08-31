const { Client } = require('ssh2');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

async function deployStandalone() {
  console.log('Building Next.js project locally for production deployment...');
  
  try {
    execSync('npx next build', { cwd: path.join(__dirname, '..'), stdio: 'inherit' });
    console.log('Local Build Completed Successfully!');
  } catch (err) {
    console.error('Local Next.js Build Failed:', err.message);
    return;
  }

  const localStandaloneDir = path.join(__dirname, '..', '.next', 'standalone');
  const localNextDir = path.join(__dirname, '..', '.next');

  const conn = new Client();
  await new Promise((resolve, reject) => {
    conn.on('ready', resolve).on('error', reject).connect({
      host: '121.125.61.114',
      port: 22,
      username: 'artpani',
      privateKey: fs.readFileSync('C:\\Users\\user\\.ssh\\id_ed25519_121_125_61_114')
    });
  });

  console.log('SSH Connection Ready for Standalone Deployment...');

  // Upload local .next/server to remote .next/standalone/.next/server
  const sftp = await new Promise((resolve, reject) => {
    conn.sftp((err, s) => err ? reject(err) : resolve(s));
  });

  console.log('Uploading local build server bundles to remote standalone server...');
  
  // Upload specific updated route JS files directly
  const routesToUpdate = [
    { local: '.next/server/app/result/page.js', remote: '/home/www/saju-artpani/frontend/.next/standalone/.next/server/app/result/page.js' },
    { local: '.next/server/app/input/page.js', remote: '/home/www/saju-artpani/frontend/.next/standalone/.next/server/app/input/page.js' },
    { local: '.next/server/app/artpani/page.js', remote: '/home/www/saju-artpani/frontend/.next/standalone/.next/server/app/artpani/page.js' },
    { local: '.next/server/app/page.js', remote: '/home/www/saju-artpani/frontend/.next/standalone/.next/server/app/page.js' },
    { local: '.next/server/app/api/payment-webhook/route.js', remote: '/home/www/saju-artpani/frontend/.next/standalone/.next/server/app/api/payment-webhook/route.js' }
  ];

  for (const item of routesToUpdate) {
    const fullLocalPath = path.join(__dirname, '..', item.local);
    if (fs.existsSync(fullLocalPath)) {
      console.log(`SFTP Uploading ${item.local} -> ${item.remote}`);
      await new Promise((res, rej) => {
        sftp.fastPut(fullLocalPath, item.remote, err => err ? rej(err) : res());
      });
      console.log(`Successfully uploaded: ${item.local}`);
    }
  }

  // Reload PM2 processes
  console.log('Reloading PM2 service on remote server...');
  const reloadOut = await execCmd(conn, 'pm2 reload all || pm2 restart all');
  console.log('PM2 Reload Output:\n', reloadOut);

  conn.end();
  console.log('🎉 STANDALONE PRODUCTION DEPLOYMENT COMPLETED SUCCESSFULLY!');
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

deployStandalone().catch(err => console.error('DEPLOY ERROR:', err));
