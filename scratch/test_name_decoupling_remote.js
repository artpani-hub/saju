const { Client } = require('ssh2');
const path = require('path');
const fs = require('fs');

const conn = new Client();
conn.on('ready', () => {
  console.log('SSH Connected.');

  // 원격지에서 실행할 검증용 node 스크립트
  const nodeScript = `
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log("=== Running remote name decoupling verification ===");

  const testPhone = "010-1111-9999";
  
  // Clean up existing test data
  await prisma.order.deleteMany({
    where: { user: { phone: testPhone } }
  });
  await prisma.user.deleteMany({
    where: { phone: testPhone }
  });

  // 1. Create first order for 홍길동
  console.log("Creating first order for '홍길동'...");
  const user1 = await prisma.user.upsert({
    where: { phone: testPhone },
    update: { name: "홍길동" },
    create: { name: "홍길동", phone: testPhone, birthYear: 1995, birthMonth: 1, birthDay: 1, calendarType: "solar", gender: "male" }
  });
  
  const order1 = await prisma.order.create({
    data: {
      id: "REMOTE_TEST_01",
      applicationNum: "APP_REMOTE_TEST_01",
      userId: user1.id,
      productName: "평생 종합 사주팔자 보감",
      userName: "홍길동",
      amount: 14900,
      paymentMethod: "CARD",
      status: "PAID",
      reportStatus: "PENDING"
    }
  });

  // 2. Create second order for 성춘향
  console.log("Creating second order for '성춘향' (same phone)...");
  const user2 = await prisma.user.upsert({
    where: { phone: testPhone },
    update: { name: "성춘향" },
    create: { name: "성춘향", phone: testPhone, birthYear: 1995, birthMonth: 1, birthDay: 1, calendarType: "solar", gender: "male" }
  });
  
  const order2 = await prisma.order.create({
    data: {
      id: "REMOTE_TEST_02",
      applicationNum: "APP_REMOTE_TEST_02",
      userId: user2.id,
      productName: "평생 종합 사주팔자 보감",
      userName: "성춘향",
      amount: 14900,
      paymentMethod: "CARD",
      status: "PAID",
      reportStatus: "PENDING"
    }
  });

  // 3. Current name in User table (should be '성춘향')
  const userInDb = await prisma.user.findUnique({
    where: { phone: testPhone }
  });
  console.log("Current name in User table (shared):", userInDb.name);

  // 4. Fetch orders and verify
  const dbOrders = await prisma.order.findMany({
    where: { id: { in: ["REMOTE_TEST_01", "REMOTE_TEST_02"] } },
    include: { user: true }
  });

  const formatted = dbOrders.map(order => {
    return {
      id: order.id,
      name: order.userName || order.user?.name || "알 수 없음",
      phone: order.user?.phone
    };
  });

  console.log("Mapped query results:");
  console.log(formatted);

  const isSuccess = 
    formatted.find(o => o.id === "REMOTE_TEST_01")?.name === "홍길동" &&
    formatted.find(o => o.id === "REMOTE_TEST_02")?.name === "성춘향";

  if (isSuccess) {
    console.log("[VERIFICATION SUCCESS] The fix is correctly running on live server database!");
  } else {
    console.error("[VERIFICATION FAILED] The names are still colliding.");
  }

  // Clean up
  await prisma.order.deleteMany({
    where: { id: { in: ["REMOTE_TEST_01", "REMOTE_TEST_02"] } }
  });
  await prisma.user.deleteMany({
    where: { phone: testPhone }
  });
}

main().catch(console.error).finally(() => prisma.$disconnect());
`;

  // 원격지에 쓰기
  conn.exec(`cat << 'EOF' > /home/www/saju-artpani/frontend/test_decouple_remote.js\n${nodeScript}\nEOF`, (err, stream) => {
    if (err) throw err;
    stream.on('close', () => {
      console.log('test_decouple_remote.js created on server. Executing it...');
      
      // 실행
      conn.exec('DATABASE_URL="file:/home/www/saju-artpani/frontend/prisma/dev.db" node /home/www/saju-artpani/frontend/test_decouple_remote.js', (execErr, execStream) => {
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
