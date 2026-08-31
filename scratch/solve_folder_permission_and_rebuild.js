const { Client } = require('ssh2');
const fs = require('fs');

async function solveFolderPermissionAndRebuild() {
  const conn = new Client();
  await new Promise((res, rej) => conn.on('ready', res).on('error', rej).connect({
    host: '121.125.61.114',
    port: 22,
    username: 'artpani',
    privateKey: fs.readFileSync('C:\\Users\\user\\.ssh\\id_ed25519_121_125_61_114')
  }));

  console.log('Solving folder permission issue and writing fresh artpani page.js...');

  const script = `
    # Create temp directory if artpani dir cannot be written, or append write via node / cat
    node -e "
      const fs = require('fs');
      const freshContent = fs.readFileSync('/tmp/fresh_artpani_page.js', 'utf8');
      const targetPath = '/home/www/saju-artpani/frontend/src/app/artpani/page.js';
      
      try {
        // Try truncating existing file content directly without recreating file
        const fd = fs.openSync(targetPath, 'r+');
        fs.ftruncateSync(fd, 0);
        fs.writeSync(fd, freshContent, 0, 'utf8');
        fs.closeSync(fd);
        console.log('DIRECT_FILE_TRUNCATE_AND_WRITE_SUCCESSFUL!');
      } catch (err) {
        console.error('TRUNCATE_FAILED:', err.message);
      }
    "

    # Rebuild Next.js app in frontend
    cd /home/www/saju-artpani/frontend &&
    rm -rf .next &&
    npx next build &&

    PM2_HOME=/home/www/saju-artpani/.pm2 pm2 delete saju-app 2>/dev/null || true
    PM2_HOME=/home/www/saju-artpani/.pm2 PORT=3012 pm2 start npm --name "saju-app" --cwd /home/www/saju-artpani/frontend -- start -- -p 3012
    PM2_HOME=/home/www/saju-artpani/.pm2 pm2 save
  `;

  const out = await execCmd(conn, script);
  console.log('SOLVE FOLDER PERMISSION OUTPUT:\n', out);

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

solveFolderPermissionAndRebuild().catch(err => console.error('ERROR:', err));
