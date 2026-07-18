const { Client } = require('ssh2');
const path = require('path');
const fs = require('fs');

const conn = new Client();
conn.on('ready', () => {
  console.log('SSH Connected.');

  // 원격지에서 실행할 node 스크립트
  const nodeScript = `
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log("--- Querying User and Order for '가가' or id '6769' ---");
  const users = await prisma.user.findMany({
    where: { name: '가가' },
    include: {
      orders: true,
      reports: {
        include: {
          histories: true
        }
      }
    }
  });

  console.log("Found users with name '가가':", users.length);
  for (const user of users) {
    console.log("User ID:", user.id);
    console.log("User Name:", user.name);
    console.log("User Phone:", user.phone);
    console.log("User CreatedAt:", user.createdAt);
    
    console.log("Orders associated with this user:");
    for (const order of user.orders) {
      console.log("  Order ID (id):", order.id);
      console.log("  ApplicationNum:", order.applicationNum);
      console.log("  Amount:", order.amount);
      console.log("  Status:", order.status);
      console.log("  PaymentMethod:", order.paymentMethod);
      console.log("  PaymentDate:", order.paymentDate);
      console.log("  CreatedAt:", order.createdAt);
    }
    console.log("Reports associated with this user:");
    for (const report of user.reports) {
      console.log("  Report ID:", report.id);
      console.log("  Unlocked:", report.unlocked);
      console.log("  Status:", report.status);
      console.log("  CreatedAt:", report.createdAt);
    }
  }

  console.log("\\n--- Querying Order by ID '6769' ---");
  const orderById = await prisma.order.findUnique({
    where: { id: '6769' },
    include: { user: true }
  });
  if (orderById) {
    console.log("Order found by ID '6769':");
    console.log("  ID:", orderById.id);
    console.log("  ApplicationNum:", orderById.applicationNum);
    console.log("  Amount:", orderById.amount);
    console.log("  Status:", orderById.status);
    console.log("  PaymentDate:", orderById.paymentDate);
    console.log("  CreatedAt:", orderById.createdAt);
    console.log("  User Name:", orderById.user?.name);
    console.log("  User Phone:", orderById.user?.phone);
    console.log("  User CreatedAt:", orderById.user?.createdAt);
  } else {
    console.log("No order found with ID '6769'");
  }

  // ApplicationNum으로도 검색
  console.log("\\n--- Querying Order by ApplicationNum containing '6769' ---");
  const ordersByAppNum = await prisma.order.findMany({
    where: {
      OR: [
        { applicationNum: { contains: '6769' } },
        { id: { contains: '6769' } }
      ]
    },
    include: { user: true }
  });
  console.log("Found orders by appNum/id contains '6769':", ordersByAppNum.length);
  for (const order of ordersByAppNum) {
    console.log("  ID:", order.id);
    console.log("  ApplicationNum:", order.applicationNum);
    console.log("  Amount:", order.amount);
    console.log("  Status:", order.status);
    console.log("  PaymentDate:", order.paymentDate);
    console.log("  CreatedAt:", order.createdAt);
    console.log("  User Name:", order.user?.name);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
`;

  // 원격지에 쓰기
  conn.exec(`cat << 'EOF' > /home/www/saju-artpani/frontend/query_target_order.js\n${nodeScript}\nEOF`, (err, stream) => {
    if (err) throw err;
    stream.on('close', () => {
      console.log('query_target_order.js created on server. Executing it...');
      
      // 실행
      conn.exec('node /home/www/saju-artpani/frontend/query_target_order.js', (execErr, execStream) => {
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
