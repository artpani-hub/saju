const { Client } = require('ssh2');
const path = require('path');
const fs = require('fs');

const conn = new Client();

const remoteRoot = '/home/www/saju-artpani/frontend';
const localProjectRoot = 'd:/인터그리비티/saju';

conn.on('ready', () => {
  console.log('SSH Connected for data backup.');
  conn.sftp((err, sftp) => {
    if (err) throw err;

    const filesToDownload = ['data/orders.json', 'data/inquiries.json'];
    let completed = 0;

    filesToDownload.forEach(file => {
      const remoteFile = path.posix.join(remoteRoot, file);
      const localFile = path.join(localProjectRoot, file);

      // 로컬 디렉토리 보장
      const localDir = path.dirname(localFile);
      if (!fs.existsSync(localDir)) {
        fs.mkdirSync(localDir, { recursive: true });
      }

      console.log(`Downloading ${remoteFile} -> ${localFile}...`);
      sftp.fastGet(remoteFile, localFile, (getErr) => {
        if (getErr) {
          console.error(`Failed to download ${file}:`, getErr);
        } else {
          console.log(`Successfully downloaded ${file}`);
        }
        completed++;
        if (completed === filesToDownload.length) {
          conn.end();
          console.log('Backup process completed.');
        }
      });
    });
  });
}).connect({
  host: '121.125.61.114',
  port: 22,
  username: 'saju-artpani',
  privateKey: fs.readFileSync(path.join(require('os').homedir(), '.ssh', 'id_ed25519_121_125_61_114'))
});
