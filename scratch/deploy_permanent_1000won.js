const { Client } = require('ssh2');
const fs = require('fs');
const path = require('path');

/**
 * 실서버 정식 영구 경로 배포 스크립트 (/tmp 일절 미사용)
 * - SSH 포트: 222, 8081, 22, 2222 자동 탐색 (계정: saju-artpani / artpani)
 * - 서비스 경로: /home/www/saju-artpani/frontend (포트: 3012)
 * - 실 운영 SQLite DB: /home/www/saju-artpani/frontend/prisma/dev_real.db
 * - PM2 재시작: PM2_HOME=/home/www/saju-artpani/.pm2 pm2 restart saju-app
 */
async function connectSshWithFallback() {
  const key = fs.readFileSync('C:\\Users\\user\\.ssh\\id_ed25519_121_125_61_114');
  const ports = [80, 222, 8081, 22, 2222];
  const users = ['artpani', 'saju-artpani'];

  for (const port of ports) {
    for (const username of users) {
      console.log(`=== [1단계] 실서버(121.125.61.114:${port}, 계정: ${username}) SSH 연결 시도 ===`);
      const conn = new Client();
      try {
        await new Promise((res, rej) =>
          conn
            .on('ready', res)
            .on('error', rej)
            .connect({
              host: '121.125.61.114',
              port,
              username,
              privateKey: key,
              readyTimeout: 6000,
            })
        );
        console.log(`✔ 포트 ${port}번 (계정: ${username}) SSH 연결 성공!`);
        return { conn, port, username };
      } catch (e) {
        console.log(`  - [${username}@121.125.61.114:${port}] 실패: ${e.message}`);
      }
    }
  }
  throw new Error('모든 SSH 포트(222, 8081, 22, 2222) 연결 타임아웃 발생');
}

async function deployPermanent1000Won() {
  const { conn, username } = await connectSshWithFallback();
  const sftp = await new Promise((res, rej) => conn.sftp((err, s) => (err ? rej(err) : res(s))));

  // 1. 실서버의 실 운영 DB(dev_real.db)를 로컬 백업 폴더로도 안전 다운로드
  const localBackupDbPath = 'd:\\인터그리비티\\saju\\backups\\backup_20261116_215839\\live_dev_real.db';
  try {
    await new Promise((res, rej) =>
      sftp.fastGet('/home/www/saju-artpani/frontend/prisma/dev_real.db', localBackupDbPath, (err) =>
        err ? rej(err) : res()
      )
    );
    console.log(`✔ 실 운영 DB(dev_real.db) 로컬 백업 완료: ${localBackupDbPath}`);
  } catch (e) {
    console.log(`  (참고: dev_real.db 직접 SFTP 다운로드 생략/권한 확인 예정: ${e.message})`);
  }

  // 2. /tmp를 사용하지 않고 영구 홈 경로 내 스테이징 폴더 사용
  const stagingBase = `/home/${username === 'saju-artpani' ? 'www/saju-artpani' : username}/saju_1000won_staging`;
  console.log(`=== [2단계] 영구 스테이징 폴더(${stagingBase})로 1,000원 버전 파일 업로드 ===`);
  await execCmd(conn, `rm -rf "${stagingBase}" && mkdir -p "${stagingBase}"`);

  const filesToSync = [
    'src/app/page.js',
    'src/app/input/page.js',
    'src/app/result/page.js',
    'src/app/result/utils.js',
    'src/app/result/components/renderPageContent.js',
    'src/app/result/components/renderNewYearPageContent.js',
    'src/app/result/components/ActionGuide.jsx',
    'src/app/result/components/GwiinCard.jsx',
    'src/app/result/components/JobTable.jsx',
    'src/app/artpani/page.js',
    'src/app/inquiry/page.js',
    'src/app/api/orders/route.js',
    'src/app/api/payment-webhook/route.js',
    'src/app/api/inquiry/route.js',
    'src/app/api/products/route.js',
    'src/app/api/email/route.js',
    'src/app/api/sms/route.js',
    'src/app/api/admin/dashboard/route.js',
    'src/app/api/admin/inquiries/route.js',
    'src/app/api/admin/products/route.js',
    'src/app/api/admin/promotions/route.js',
    'src/app/api/admin/resend/route.js',
    'src/app/api/admin/users/update/route.js',
    'src/lib/db.js',
    'prisma/schema.prisma',
    '.env',
  ];

  for (const rel of filesToSync) {
    const localPath = path.join('d:\\인터그리비티\\saju', rel);
    if (!fs.existsSync(localPath)) continue;
    const remotePath = `${stagingBase}/${rel.replace(/\\/g, '/')}`;
    const remoteDir = remotePath.substring(0, remotePath.lastIndexOf('/'));
    await execCmd(conn, `mkdir -p "${remoteDir}"`);
    await new Promise((res, rej) => sftp.fastPut(localPath, remotePath, (err) => (err ? rej(err) : res())));
    console.log(`  ✔ Uploaded: ${rel}`);
  }

  console.log('=== [3단계] /home/www/saju-artpani/frontend 정식 배포, dev_real.db 고정 및 PM2 재기동 ===');
  const permanentScript = `
    set -e
    FRONTEND_DIR="/home/www/saju-artpani/frontend"
    REAL_DB="/home/www/saju-artpani/frontend/prisma/dev_real.db"
    PM2_DIR="/home/www/saju-artpani/.pm2"
    STAGING_DIR="${stagingBase}"
    TS=$(date +%Y%m%d_%H%M%S)

    run_priv() {
      if [ "$(whoami)" = "saju-artpani" ] || [ -w "\${FRONTEND_DIR}/src" ]; then
        "$@"
      else
        echo artpani1234 | sudo -S "$@"
      fi
    }

    # 1. 실 운영 DB(dev_real.db) 및 기존 src 영구 백업
    run_priv mkdir -p "\${FRONTEND_DIR}/backups/backup_\${TS}"
    if [ -f "\${REAL_DB}" ]; then
      run_priv cp -fv "\${REAL_DB}" "\${FRONTEND_DIR}/backups/backup_\${TS}/dev_real.db.bak"
    fi
    run_priv cp -rf "\${FRONTEND_DIR}/src" "\${FRONTEND_DIR}/backups/backup_\${TS}/src_bak"

    # 2. 정식 영구 폴더(/home/www/saju-artpani/frontend)에 1,000원 버전 소스 코드 덮어쓰기 (DB는 절대 덮어쓰지 않음)
    run_priv cp -rf "\${STAGING_DIR}/src/"* "\${FRONTEND_DIR}/src/"
    run_priv cp -fv "\${STAGING_DIR}/prisma/schema.prisma" "\${FRONTEND_DIR}/prisma/schema.prisma"
    run_priv cp -fv "\${STAGING_DIR}/.env" "\${FRONTEND_DIR}/.env"
    rm -rf "\${STAGING_DIR}"

    # 3. .env 및 schema.prisma 내 DB 경로를 실 운영 DB(/home/www/saju-artpani/frontend/prisma/dev_real.db)로 고정
    run_priv sed -i 's|file:d:/인터그리비티/saju/prisma/dev.db|file:/home/www/saju-artpani/frontend/prisma/dev_real.db|g' "\${FRONTEND_DIR}/prisma/schema.prisma"
    run_priv sed -i '/DATABASE_URL/d' "\${FRONTEND_DIR}/.env"
    run_priv sh -c "echo 'DATABASE_URL=file:/home/www/saju-artpani/frontend/prisma/dev_real.db' >> \"\${FRONTEND_DIR}/.env\""

    # 4. 소유권/권한 정리 및 프로덕션 빌드
    if [ "$(whoami)" != "saju-artpani" ]; then
      echo artpani1234 | sudo -S chown -R saju-artpani:developer "\${FRONTEND_DIR}/src" "\${FRONTEND_DIR}/prisma" "\${FRONTEND_DIR}/.env" 2>/dev/null || true
      echo artpani1234 | sudo -S chmod -R 775 "\${FRONTEND_DIR}/src" "\${FRONTEND_DIR}/prisma" "\${FRONTEND_DIR}/.next" 2>/dev/null || true
      echo artpani1234 | sudo -S chmod 664 "\${FRONTEND_DIR}/.env" "\${REAL_DB}" 2>/dev/null || true
    fi

    cd "\${FRONTEND_DIR}"
    npx prisma generate
    npx next build --webpack

    if [ -d "\${FRONTEND_DIR}/.next/standalone" ]; then
      cp -rf "\${FRONTEND_DIR}/.next/static" "\${FRONTEND_DIR}/.next/standalone/.next/" 2>/dev/null || true
      cp -rf "\${FRONTEND_DIR}/public" "\${FRONTEND_DIR}/.next/standalone/" 2>/dev/null || true
      cp -fv "\${FRONTEND_DIR}/.env" "\${FRONTEND_DIR}/.next/standalone/.env" 2>/dev/null || true
    fi

    # 5. PM2 재시작 및 영구 저장
    PM2_HOME="\${PM2_DIR}" pm2 restart saju-app --update-env
    PM2_HOME="\${PM2_DIR}" pm2 save

    sleep 3
    PM2_HOME="\${PM2_DIR}" pm2 list
  `;

  const out = await execCmd(conn, permanentScript, true);
  console.log(out);
  conn.end();
  console.log('=== ✔ 정식 영구 경로(/home/www/saju-artpani/frontend) 배포 및 PM2 재시작 완료! ===');
}

function execCmd(conn, cmd, pty = false) {
  return new Promise((resolve, reject) => {
    conn.exec(cmd, { pty }, (err, stream) => {
      if (err) return reject(err);
      let stdout = '';
      stream.on('close', (code) => {
        if (code === 0) resolve(stdout);
        else reject(new Error(`Command exited with ${code}:\n${stdout}`));
      });
      stream.on('data', (d) => {
        const s = d.toString();
        stdout += s;
        process.stdout.write(s);
      });
      stream.stderr.on('data', (d) => {
        const s = d.toString();
        stdout += s;
        process.stderr.write(s);
      });
    });
  });
}

deployPermanent1000Won().catch((err) => {
  console.error('DEPLOY FAILED:', err.message);
  process.exit(1);
});
