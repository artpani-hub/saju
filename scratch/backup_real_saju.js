const { Client } = require('ssh2');
const fs = require('fs');

const conn = new Client();
conn.on('ready', () => {
  console.log('Backing up real saju-artpani project...');
  
  const timestamp = new Date().toISOString().replace(/[^0-9]/g, "").slice(0, 14);
  const backupDir = `/home/www/artpani/backups/real_saju_backup_${timestamp}`;
  
  const backupCmd = `
    mkdir -p ${backupDir} &&
    cp -r /home/www/saju-artpani/frontend/prisma/dev.db ${backupDir}/prisma_dev.db.bak 2>/dev/null || true
    cp -r /home/www/saju-artpani/frontend/dev.db ${backupDir}/dev.db.bak 2>/dev/null || true
    cp -r /home/www/saju-artpani/frontend/src ${backupDir}/src_bak
    echo "REAL_SAJU_BACKUP_COMPLETE_${backupDir}"
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
