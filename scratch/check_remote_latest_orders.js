const { Client } = require('ssh2');
const path = require('path');
const fs = require('fs');

const conn = new Client();
conn.on('ready', () => {
  console.log('SSH Connected.');

  // 원격 데이터베이스에 최근 인입된 주문서 5건을 강제로 조회하여 콘솔에 출력
  const command = `
    cd /home/www/saju-artpani/frontend
    echo "=== Fetching LATEST 5 Orders from Server DB ==="
    node -e "
      const { PrismaClient } = require('@prisma/client');
      const prisma = new PrismaClient();
      async function main() {
        const orders = await prisma.order.findMany({
          orderBy: { createdAt: 'desc' },
          take: 5
        });
        console.log(JSON.stringify(orders, null, 2));
      }
      main().catch(console.error).finally(() => prisma.\\$disconnect());
    "
    
    echo "\\n=== PM2 logs (Last 20 lines) ==="
    pm2 logs saju-app --lines 20 --nostream 2>/dev/null || echo "No PM2 logs"
  `;

  conn.exec(command, (err, stream) => {
    if (err) throw err;
    let stdout = '';
    stream.on('close', () => {
      console.log(stdout);
      conn.end();
    }).on('data', (data) => {
      stdout += data.toString();
    });
  });
}).connect({
  host: '121.125.61.114',
  port: 22,
  username: 'saju-artpani',
  privateKey: fs.readFileSync(path.join(require('os').homedir(), '.ssh', 'id_ed25519_121_125_61_114'))
});
