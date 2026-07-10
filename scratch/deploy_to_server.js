const { Client } = require('ssh2');
const path = require('path');
const fs = require('fs');

const conn = new Client();

const remoteRoot = '/home/www/saju-artpani/frontend';
const localProjectRoot = 'd:/인터그리비티/saju';

// 로컬에서 업로드할 대상들 정의
const uploadQueue = [];

function walkDir(localPath, remoteSubPath) {
  const files = fs.readdirSync(localPath);
  for (const file of files) {
    const fullLocalPath = path.join(localPath, file);
    const fullRemotePath = path.posix.join(remoteSubPath, file);
    const stat = fs.statSync(fullLocalPath);
    if (stat.isDirectory()) {
      walkDir(fullLocalPath, fullRemotePath);
    } else {
      uploadQueue.push({ local: fullLocalPath, remote: fullRemotePath });
    }
  }
}

// 1. standalone 빌드 결과물 추가
console.log('Preparing standalone build files...');
const standalonePath = path.join(localProjectRoot, '.next/standalone');
if (fs.existsSync(standalonePath)) {
  walkDir(standalonePath, remoteRoot);
}

// 2. static 파일들 추가 (standalone 내의 .next/static 위치로 이동해야 함)
console.log('Preparing static files...');
const staticPath = path.join(localProjectRoot, '.next/static');
const remoteStaticPath = path.posix.join(remoteRoot, '.next/static');
if (fs.existsSync(staticPath)) {
  walkDir(staticPath, remoteStaticPath);
}

// 3. public 파일들 추가 (standalone 내의 public 위치로 이동해야 함)
console.log('Preparing public files...');
const publicPath = path.join(localProjectRoot, 'public');
const remotePublicPath = path.posix.join(remoteRoot, 'public');
if (fs.existsSync(publicPath)) {
  walkDir(publicPath, remotePublicPath);
}

// 4. .env 파일 추가 (서버의 런타임 환경변수 주입 목적)
console.log('Preparing .env file...');
const envPath = path.join(localProjectRoot, '.env');
if (fs.existsSync(envPath)) {
  uploadQueue.push({ local: envPath, remote: path.posix.join(remoteRoot, '.env') });
}

console.log(`Total files to upload: ${uploadQueue.length}`);

conn.on('ready', () => {
  console.log('SSH Client Ready for deployment');
  conn.sftp((err, sftp) => {
    if (err) throw err;

    let index = 0;
    
    // 디렉토리 존재여부 확인하고 없으면 생성하는 헬퍼
    const dirCache = new Set();
    function ensureRemoteDir(remoteFilePath, callback) {
      const dir = path.posix.dirname(remoteFilePath);
      if (dirCache.has(dir) || dir === '.' || dir === '/') {
        return callback();
      }
      
      // 재귀적으로 디렉토리 생성
      const parts = dir.split('/').filter(Boolean);
      let current = '';
      
      function makeNext(i) {
        if (i >= parts.length) {
          dirCache.add(dir);
          return callback();
        }
        current += '/' + parts[i];
        sftp.mkdir(current, (mkdirErr) => {
          // 이미 존재하는 경우 에러 무시
          makeNext(i + 1);
        });
      }
      makeNext(0);
    }

    function uploadNext() {
      if (index >= uploadQueue.length) {
        console.log('All files uploaded successfully!');
        // PM2 재기동 실행
        console.log('Restarting saju-app via PM2...');
        conn.exec('pm2 restart saju-app', (execErr, stream) => {
          if (execErr) {
            console.error('PM2 restart error:', execErr);
            conn.end();
            return;
          }
          stream.on('close', (code) => {
            console.log(`PM2 restart finished with code: ${code}`);
            conn.end();
          }).on('data', (data) => {
            console.log('PM2 STDOUT: ' + data);
          }).stderr.on('data', (data) => {
            console.log('PM2 STDERR: ' + data);
          });
        });
        return;
      }

      const item = uploadQueue[index];
      ensureRemoteDir(item.remote, () => {
        sftp.fastPut(item.local, item.remote, (putErr) => {
          if (putErr) {
            console.error(`Failed to upload ${item.local} -> ${item.remote}`, putErr);
            // 에러가 나도 계속 시도하거나 중단할 수 있으나 여기서는 로그 남기고 계속 진행
          }
          index++;
          if (index % 50 === 0 || index === uploadQueue.length) {
            console.log(`Progress: ${index}/${uploadQueue.length} files uploaded.`);
          }
          uploadNext();
        });
      });
    }

    uploadNext();
  });
}).connect({
  host: '121.125.61.114',
  port: 22,
  username: 'saju-artpani',
  privateKey: fs.readFileSync(path.join(require('os').homedir(), '.ssh', 'id_ed25519_121_125_61_114'))
});

