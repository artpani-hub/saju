const { Client } = require('ssh2');
const path = require('path');
const fs = require('fs');

const conn = new Client();
conn.on('ready', () => {
  console.log('SSH Connected.');

  // 원격지에서 실행하여 오늘(2026-07-18) 생성된 주문들의 상세와 대시보드 집계 카운트 대조
  const nodeScript = `
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // KST(한국 표준시) 기준 2026-07-18 00:00:00 UTC 변환 계산
  const nowKst = new Date("2026-07-18T14:34:00+09:00");
  const startOfTodayKst = new Date(2026, 6, 18); // 7월 18일 (월은 0부터 시작하므로 6)
  const startOfToday = new Date(startOfTodayKst.getTime() - (9 * 60 * 60 * 1000));
  
  console.log("KST startOfToday calculated:", startOfToday.toISOString());

  // 1. 오늘 생성된 모든 주문 조회 (Status 무관)
  const todayOrders = await prisma.order.findMany({
    where: {
      createdAt: { gte: startOfToday }
    },
    include: { user: true }
  });

  console.log("=== All Orders Created Today (gte 2026-07-18 00:00 KST) ===");
  console.log("Total orders created today in DB:", todayOrders.length);
  
  let paidCount = 0;
  for (const o of todayOrders) {
    const isPaid = ["PAID", "paid", "결제 완료", "결제완료"].includes(o.status);
    const isNotRefunded = !o.refundStatus || !["REFUNDED", "REFUND_COMPLETED", "refunded", "refund_completed"].includes(o.refundStatus);
    const counted = isPaid && isNotRefunded;
    if (counted) paidCount++;

    console.log(\`  - Order ID: \${o.id} | User: \${o.user?.name || "N/A"} | Status: \${o.status} | Amount: \${o.amount} | Refund: \${o.refundStatus} | CreatedAt: \${o.createdAt.toISOString()} (KST: \${new Date(o.createdAt.getTime() + 9*60*60*1000).toISOString()}) | Counted: \${counted}\`);
  }
  
  console.log("\\n=== Dashboard Calculation ===");
  console.log("Calculated Paid Count for Today:", paidCount);
}

main().catch(console.error).finally(() => prisma.$disconnect());
`;

  // 원격지에 쓰기
  conn.exec(`cat << 'EOF' > /home/www/saju-artpani/frontend/count_today_orders.js\n${nodeScript}\nEOF`, (err, stream) => {
    if (err) throw err;
    stream.on('close', () => {
      console.log('count_today_orders.js created on server. Executing it...');
      
      // 실행
      conn.exec('DATABASE_URL="file:/home/www/saju-artpani/frontend/prisma/dev.db" node /home/www/saju-artpani/frontend/count_today_orders.js', (execErr, execStream) => {
        if (execErr) throw execErr;
        let execOutput = '';
        execStream.on('close', () => {
          console.log('Output from remote server:\n', execOutput);
          conn.end();
        }).on('data', (data) => {
          execOutput += data.toString();
        });
      });
    });
  });
}).connect({
  host: '121.125.61.114',
  port: 22,
  username: 'saju-artpani',
  privateKey: fs.readFileSync(path.join(require('os').homedir(), '.ssh', 'id_ed25519_121_125_61_114'))
});
