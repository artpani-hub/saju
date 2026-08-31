const { Client } = require('ssh2');
const fs = require('fs');
const path = require('path');

const filesToUpload = [
  'src/app/result/page.js',
  'src/app/input/page.js',
  'src/app/artpani/page.js',
  'src/app/page.js',
  'src/app/api/payment-webhook/route.js',
  'prisma/seed-products.js'
];

const conn = new Client();
conn.on('ready', () => {
  console.log('SSH Connection Ready for Temp Deploy...');

  const setupTmpCmd = `mkdir -p /tmp/saju_deploy/src/app/api/payment-webhook /tmp/saju_deploy/src/app/result /tmp/saju_deploy/src/app/input /tmp/saju_deploy/src/app/artpani /tmp/saju_deploy/prisma`;
  conn.exec(setupTmpCmd, (err, stream) => {
    if (err) throw err;
    stream.on('close', () => {
      conn.sftp((sftpErr, sftp) => {
        if (sftpErr) throw sftpErr;

        let completed = 0;
        filesToUpload.forEach(relPath => {
          const localPath = path.join(__dirname, '..', relPath);
          const remotePath = `/tmp/saju_deploy/${relPath.replace(/\\/g, '/')}`;
          
          console.log(`Uploading to temp: ${relPath} -> ${remotePath}`);
          sftp.fastPut(localPath, remotePath, (uploadErr) => {
            if (uploadErr) {
              console.error(`Failed to upload ${relPath}:`, uploadErr);
            } else {
              console.log(`Successfully uploaded to temp: ${relPath}`);
            }
            completed++;
            if (completed === filesToUpload.length) {
              console.log('All files uploaded to /tmp/saju_deploy. Copying and reloading...');
              applyDeployment(conn);
            }
          });
        });
      });
    });
  });
}).connect({
  host: '121.125.61.114',
  port: 22,
  username: 'artpani',
  privateKey: fs.readFileSync('C:\\Users\\user\\.ssh\\id_ed25519_121_125_61_114')
});

function applyDeployment(conn) {
  const deployCmd = `
    cp -rf /tmp/saju_deploy/* /home/www/saju-artpani/frontend/ 2>/dev/null || true
    chmod -R 777 /home/www/saju-artpani/frontend/src /home/www/saju-artpani/frontend/prisma 2>/dev/null || true
    cd /home/www/saju-artpani/frontend &&
    npm run build &&
    pm2 reload all
  `;

  conn.exec(deployCmd, (err, stream) => {
    if (err) throw err;
    stream.on('close', (code) => {
      console.log('Deployment Task Exited with Code:', code);
      conn.end();
    }).on('data', (data) => {
      console.log('STDOUT:', data.toString());
    }).stderr.on('data', (data) => {
      console.log('STDERR:', data.toString());
    });
  });
}
