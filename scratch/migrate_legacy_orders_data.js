const { Client } = require('ssh2');
const path = require('path');
const fs = require('fs');

const conn = new Client();
conn.on('ready', () => {
  console.log('SSH Connected.');

  // 과거 주문서 데이터 보정 스크립트 작성 및 서버 직접 실행
  const command = `
    cd /home/www/saju-artpani/frontend
    
    echo "=== Running Legacy Data Correction Script ==="
    node -e "
      const { PrismaClient } = require('@prisma/client');
      const prisma = new PrismaClient();
      async function main() {
        const orders = await prisma.order.findMany({
          include: { user: true }
        });
        console.log('Total orders to verify:', orders.length);
        let updatedCount = 0;
        for (const order of orders) {
          const user = order.user;
          if (user) {
            // 과거 주문서 중 이름이나 사주 필드가 비어 있으면 유저 데이터 복사해서 채우기
            const needsUpdate = !order.userName || !order.birthYear;
            if (needsUpdate) {
              await prisma.order.update({
                where: { id: order.id },
                data: {
                  userName: order.userName || user.name,
                  birthYear: order.birthYear || user.birthYear,
                  birthMonth: order.birthMonth || user.birthMonth,
                  birthDay: order.birthDay || user.birthDay,
                  birthHour: order.birthHour || user.birthHour,
                  calendarType: order.calendarType || user.calendarType,
                  gender: order.gender || user.gender,
                  worryText: order.worryText || user.worryText
                }
              });
              updatedCount++;
            }
          }
        }
        console.log('Successfully patched legacy orders:', updatedCount);
      }
      main().catch(console.error).finally(() => prisma.\\$disconnect());
    "
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
