const { Client } = require('ssh2');
const path = require('path');
const fs = require('fs');

const conn = new Client();
conn.on('ready', () => {
  console.log('SSH Connected.');

  // 데이터베이스 내의 실제 주문 테이블의 전체 리스트와 상태별 수량을 1건씩 정직하게 수작업 집계하듯이 출력
  const command = `
    cd /home/www/saju-artpani/frontend
    echo "=== Counting Raw Orders from Server Database ==="
    node -e "
      const { PrismaClient } = require('@prisma/client');
      const prisma = new PrismaClient();
      async function main() {
        const allOrders = await prisma.order.findMany();
        
        console.log('1. 전체 주문서 (Total Orders):', allOrders.length);
        
        const waitingPayment = allOrders.filter(o => 
          ['WAITING_PAYMENT', 'waiting_payment', '결제 대기', 'PENDING', 'pending'].includes(o.status)
        );
        console.log('2. 결제 대기 상태 주문서 (Pending):', waitingPayment.length);
        
        const paidOrders = allOrders.filter(o => 
          ['PAID', 'paid', '결제 완료', '결제완료'].includes(o.status)
        );
        console.log('3. 결제 완료 상태 주문서 (Paid):', paidOrders.length);
        
        const freeOrders = allOrders.filter(o => 
          ['FREE', 'free', '무료'].includes(o.status)
        );
        console.log('4. 무료 완료 상태 주문서 (Free):', freeOrders.length);
        
        console.log('\\n=== Detailed Group By Status (Raw SQLite Grouping) ===');
        const grouped = {};
        allOrders.forEach(o => {
          grouped[o.status] = (grouped[o.status] || 0) + 1;
        });
        console.log(grouped);
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
