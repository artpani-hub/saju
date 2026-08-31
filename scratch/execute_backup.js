const { Client } = require('ssh2');
const fs = require('fs');

const conn = new Client();
conn.on('ready', () => {
  console.log('SSH Connection Established for Backup...');
  
  const timestamp = new Date().toISOString().replace(/[^0-9]/g, "").slice(0, 14);
  const backupDir = `/home/www/artpani/backups/backup_${timestamp}`;
  
  const backupCmd = `
    mkdir -p ${backupDir} &&
    cp -r /home/www/artpani/backend_server/dev.db ${backupDir}/dev.db.bak 2>/dev/null || true
    cp -r /home/www/artpani/backend_server/prisma/dev.db ${backupDir}/prisma_dev.db.bak 2>/dev/null || true
    cp -r /home/www/artpani/backend_server ${backupDir}/backend_server_full_bak
    echo "BACKUP_COMPLETE_${backupDir}"
  `;

  conn.exec(backupCmd, (err, stream) => {
    if (err) throw err;
    stream.on('close', (code) => {
      console.log('Backup Task Exited with Code:', code);
      conn.end();
    }).on('data', (data) => {
      console.log('STDOUT:', data.toString());
    }).stderr.on('data', (data) => {
      console.log('STDERR:', data.toString());
    });
  });
}).connect({
  host: '121.125.61.114',
  port: 22,
  username: 'artpani',
  privateKey: fs.readFileSync('C:\\Users\\user\\.ssh\\id_ed25519_121_125_61_114')
});
