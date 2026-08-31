const { Client } = require('ssh2');
const fs = require('fs');

async function deployViaTmpBuild() {
  const conn = new Client();
  await new Promise((res, rej) => conn.on('ready', res).on('error', rej).connect({
    host: '121.125.61.114',
    port: 22,
    username: 'artpani',
    privateKey: fs.readFileSync('C:\\Users\\user\\.ssh\\id_ed25519_121_125_61_114')
  }));

  console.log('Copying frontend source to /tmp/saju_app_build and building cleanly...');

  const script = `
    rm -rf /tmp/saju_app_build &&
    mkdir -p /tmp/saju_app_build &&
    cp -r /home/www/saju-artpani/frontend/* /tmp/saju_app_build/ 2>/dev/null || true &&
    
    # Overwrite modified files into /tmp/saju_app_build/
    cp -r /tmp/saju_deploy_new/* /tmp/saju_app_build/ 2>/dev/null || true &&
    
    # Symlink node_modules to avoid reinstalling
    ln -s /home/www/saju-artpani/frontend/node_modules /tmp/saju_app_build/node_modules 2>/dev/null || true &&

    cd /tmp/saju_app_build &&
    npx next build &&

    # Copy database file into standalone build
    mkdir -p /tmp/saju_app_build/.next/standalone/prisma &&
    cp /home/www/saju-artpani/frontend/prisma/dev.db /tmp/saju_app_build/.next/standalone/prisma/dev.db 2>/dev/null || true &&

    PM2_HOME=/home/www/saju-artpani/.pm2 pm2 delete saju-app 2>/dev/null || true &&
    PM2_HOME=/home/www/saju-artpani/.pm2 PORT=3012 pm2 start /tmp/saju_app_build/.next/standalone/server.js --name saju-app --cwd /tmp/saju_app_build/.next/standalone &&
    PM2_HOME=/home/www/saju-artpani/.pm2 pm2 save
  `;

  conn.exec(script, (err, stream) => {
    if (err) throw err;
    stream.on('close', (code) => {
      console.log('TMP BUILD EXIT CODE:', code);
      conn.end();
    }).on('data', data => console.log(data.toString()))
    .stderr.on('data', data => console.error(data.toString()));
  });
}

deployViaTmpBuild().catch(err => console.error('BUILD ERROR:', err));
