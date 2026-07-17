process.env.DATABASE_URL = "file:d:/인터그리비티/saju/prisma/dev.db";
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({
  datasourceUrl: "file:d:/인터그리비티/saju/prisma/dev.db"
});

async function main() {
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  console.log("Checking DB counts for today (Start of Today UTC:", startOfToday.toISOString(), " / Local:", startOfToday.toString(), ")");

  // 1. 오늘 가입/신청한 유저 목록
  const todayUsers = await prisma.user.findMany({
    where: {
      createdAt: { gte: startOfToday }
    }
  });
  console.log(`\n[Today Users] Count: ${todayUsers.length}`);
  todayUsers.forEach(u => console.log(` - ID: ${u.id}, Name: ${u.name}, Phone: ${u.phone}, CreatedAt: ${u.createdAt.toISOString()}`));

  // 2. 오늘 주문 전체 목록
  const todayOrders = await prisma.order.findMany({
    where: {
      createdAt: { gte: startOfToday }
    },
    include: {
      user: true
    }
  });
  console.log(`\n[Today Orders] Count: ${todayOrders.length}`);
  todayOrders.forEach(o => {
    console.log(` - ID: ${o.id}, User: ${o.user?.name || 'unknown'}, Amount: ${o.amount}, Status: ${o.status}, CreatedAt: ${o.createdAt.toISOString()}`);
  });

  // 3. 결제 완료(PAID)된 오늘 주문
  const todayPaid = todayOrders.filter(o => o.status === "PAID" || o.status === "FREE");
  console.log(`\n[Today Paid/Free Orders] Count: ${todayPaid.length}`);

  // 4. 전체 데이터 개수
  const allUsersCount = await prisma.user.count();
  const allOrdersCount = await prisma.order.count();
  console.log(`\n[Global DB Count] All Users: ${allUsersCount}, All Orders: ${allOrdersCount}`);
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
