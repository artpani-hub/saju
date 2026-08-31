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
  console.log('SSH Connection Ready for Real Deploy...');

  conn.sftp((err, sftp) => {
    if (err) throw err;

    let completed = 0;
    filesToUpload.forEach(relPath => {
      const localPath = path.join(__dirname, '..', relPath);
      const remotePath = `/home/www/saju-artpani/frontend/${relPath.replace(/\\/g, '/')}`;
      
      console.log(`Uploading: ${relPath} -> ${remotePath}`);
      sftp.fastPut(localPath, remotePath, (uploadErr) => {
        if (uploadErr) {
          console.error(`Failed to upload ${relPath}:`, uploadErr);
        } else {
          console.log(`Successfully uploaded: ${relPath}`);
        }
        completed++;
        if (completed === filesToUpload.length) {
          console.log('All files uploaded successfully to /home/www/saju-artpani/frontend. Building Next.js app on remote server...');
          triggerRemoteBuild(conn);
        }
      });
    });
  });
}).connect({
  host: '121.125.61.114',
  port: 22,
  username: 'artpani',
  privateKey: fs.readFileSync('C:\\Users\\user\\.ssh\\id_ed25519_121_125_61_114')
});

function triggerRemoteBuild(conn) {
  const buildCmd = `
    cd /home/www/saju-artpani/frontend &&
    npm run build &&
    (pm2 reload all || pm2 restart all)
  `;

  conn.exec(buildCmd, (err, stream) => {
    if (err) throw err;
    stream.on('close', (code) => {
      console.log('Remote Build & Reload Exited with Code:', code);
      conn.end();
    }).on('data', (data) => {
      console.log('STDOUT:', data.toString());
    }).stderr.on('data', (data) => {
      console.log('STDERR:', data.toString());
    });
  });
}
