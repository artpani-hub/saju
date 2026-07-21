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
    
    // 경로상에 'data', '.git', 'node_modules', 'dev.db' 가 포함되어 있는 것은 업로드 큐에서 완전히 제외
    const pathParts = fullLocalPath.split(/[\\/]/);
    if (file === '.git' || file === 'node_modules' || file === 'dev.db' || pathParts.includes('data')) {
      continue;
    }
    if (stat.isDirectory()) {
      walkDir(fullLocalPath, fullRemotePath);
    } else {
      uploadQueue.push({ local: fullLocalPath, remote: fullRemotePath });
    }
  }
}

// 1. 소스 디렉토리 추가
console.log('Preparing src files...');
const srcPath = path.join(localProjectRoot, 'src');
if (fs.existsSync(srcPath)) {
  walkDir(srcPath, path.posix.join(remoteRoot, 'src'));
}

// 2. public 디렉토리 추가
console.log('Preparing public files...');
const publicPath = path.join(localProjectRoot, 'public');
if (fs.existsSync(publicPath)) {
  walkDir(publicPath, path.posix.join(remoteRoot, 'public'));
}

// 3. prisma 디렉토리 추가
console.log('Preparing prisma files...');
const prismaPath = path.join(localProjectRoot, 'prisma');
if (fs.existsSync(prismaPath)) {
  walkDir(prismaPath, path.posix.join(remoteRoot, 'prisma'));
}

// 4. 설정 파일들 및 스크립트 추가
console.log('Preparing config files and scripts...');
const filesToUpload = [
  '.env',
  'package.json',
  'package-lock.json',
  'next.config.mjs',
  'postcss.config.js',
  'tailwind.config.js',
  'scratch/import_json_to_sqlite.js',
  'scratch/backfill_order_usernames.js',
  'scratch/diagnose_db.js',
  'scratch/insert_lost_order.js'
];

for (const file of filesToUpload) {
  const localFile = path.join(localProjectRoot, file);
  if (fs.existsSync(localFile)) {
    uploadQueue.push({ local: localFile, remote: path.posix.join(remoteRoot, file) });
  }
}

console.log(`Total files to upload: ${uploadQueue.length}`);

conn.on('ready', () => {
  console.log('SSH Client Ready for deployment');
  
  // 0. 배포 전 원격 서버의 기존 데이터 자동 백업
  const timestamp = new Date().toISOString().replace(/[-:T]/g, '').substring(0, 14);
  const backupCmd = `mkdir -p ${remoteRoot}/data_backup/backup_${timestamp} && cp ${remoteRoot}/data/*.json ${remoteRoot}/data_backup/backup_${timestamp}/ 2>/dev/null || true`;
  console.log('Backing up remote database files on server...');
  
  conn.exec(backupCmd, (backupErr, stream) => {
    if (backupErr) console.warn('Database backup command error:', backupErr);
    
    stream.resume(); // close 이벤트가 무한 대기하지 않고 즉시 발생하도록 보장
    stream.on('close', () => {
      console.log('Remote backup completed.');
      
      // 1. 백업 완료 후 SFTP 업로드 시작
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
            
            // 원격 서버 DB 스키마 동기화 및 Prisma Client 빌드, 그리고 Next.js 리눅스 컴파일 빌드
            console.log('Syncing database schema, building app, and importing legacy data on remote server...');
            const setupCmd = `
              sed -i 's|DATABASE_URL=.*|DATABASE_URL="file:/home/www/saju-artpani/frontend/prisma/dev.db"|' ${remoteRoot}/.env
              cd ${remoteRoot}
              rm -rf .next
              npx prisma@6.2.1 generate
              npx prisma@6.2.1 db push
              node scratch/import_json_to_sqlite.js
              export NEXT_PRIVATE_WORKER_LIMIT=1
              export NODE_OPTIONS="--max-old-space-size=2048"
              npx next build
            `;
            conn.exec(setupCmd, (dbErr, dbStream) => {
              if (dbErr) {
                console.error('Remote DB setup error:', dbErr);
              }
              
              dbStream.resume();
              dbStream.on('close', (dbCode) => {
                console.log(`Remote database sync, build & import finished with code: ${dbCode}`);
                
              // PM2 재기동 실행 (기존 삭제 후 정확한 cwd 지정 하드 리부트)
              console.log('Hard restarting saju-app via PM2...');
              const pm2Cmd = `
                pm2 delete saju-app 2>/dev/null || true
                cd ${remoteRoot}
                rm -rf .next/standalone/public
                rm -rf .next/standalone/.next/static
                cp -r public .next/standalone/ 2>/dev/null || true
                mkdir -p .next/standalone/.next
                cp -r .next/static .next/standalone/.next/ 2>/dev/null || true
                mkdir -p .next/standalone/node_modules
                cp -r node_modules/.prisma .next/standalone/node_modules/ 2>/dev/null || true
                cp -r node_modules/@prisma .next/standalone/node_modules/ 2>/dev/null || true
                DATABASE_URL="file:${remoteRoot}/prisma/dev.db" PORT=3012 pm2 start server.js --name saju-app --cwd ${remoteRoot}/.next/standalone
              `;
                conn.exec(pm2Cmd, (execErr, stream) => {
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
    });
  });
}).connect({
  host: '121.125.61.114',
  port: 22,
  username: 'saju-artpani',
  privateKey: fs.readFileSync(path.join(require('os').homedir(), '.ssh', 'id_ed25519_121_125_61_114'))
});

