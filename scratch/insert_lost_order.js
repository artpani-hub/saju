const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  console.log("=== Inserting Lost 18:37 Order ===");
  
  // 1. 유저 조회 또는 생성
  const user = await prisma.user.upsert({
    where: { phone: "01096167393" },
    update: { name: "삼담3" },
    create: {
      name: "삼담3",
      phone: "01096167393",
      email: "today_sms@hyeandang.com",
      birthYear: 1995,
      birthMonth: 1,
      birthDay: 1,
      calendarType: "solar",
      gender: "female",
      birthHour: null,
      worryText: ""
    }
  });

  // 2. 주문 생성
  const orderId = `ORD_1784367420000_${Math.floor(Math.random() * 1000)}`;
  const order = await prisma.order.create({
    data: {
      id: orderId,
      applicationNum: `APP_${orderId}`,
      userId: user.id,
      productName: "평생 종합 사주팔자 보감",
      userName: "삼담3",
      amount: 0,
      paymentMethod: "free",
      status: "FREE",
      reportStatus: "COMPLETED",
      createdAt: new Date("2026-07-18T09:37:00Z"), // 한국 시각 18:37
      birthYear: 1995,
      birthMonth: 1,
      birthDay: 1,
      calendarType: "solar",
      gender: "female"
    }
  });

  // 3. 리포트 생성
  await prisma.sajuReport.create({
    data: {
      userId: user.id,
      unlocked: true,
      status: "보고서 생성 완료"
    }
  });

  console.log("=== Lost Order Restored Successfully ===", order);
}

main().finally(() => prisma.$disconnect());
