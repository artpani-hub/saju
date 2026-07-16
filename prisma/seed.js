process.env.DATABASE_URL = "file:d:/인터그리비티/saju/prisma/dev.db";
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({
  datasourceUrl: "file:d:/인터그리비티/saju/prisma/dev.db"
});

async function main() {
  console.log("Starting database seed for 7 days simulation...");

  // Clear previous simulation entries to prevent data inflation
  await prisma.order.deleteMany({
    where: {
      applicationNum: {
        startsWith: "SIM_"
      }
    }
  });

  const now = new Date();
  
  // Helper for pasting date YYYY-MM-DD HH:MM:SS
  const getPastDateString = (daysAgo, hourStr) => {
    const d = new Date(now);
    d.setDate(now.getDate() - daysAgo);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day} ${hourStr}`;
  };

  const simulationOrders = [
    {
      id: "SIM_0710",
      applicationNum: "SIM_APP_0710",
      name: "홍길동",
      phone: "010-1234-5678",
      email: "hong@naver.com",
      productName: "평생 종합사주 (고급리포트)",
      amount: 30000,
      status: "paid",
      emailStatus: "sent",
      createdAt: getPastDateString(6, "14:25:00") // 7월 10일
    },
    {
      id: "SIM_0711",
      applicationNum: "SIM_APP_0711",
      name: "이영희",
      phone: "010-9876-5432",
      email: "lee@daum.net",
      productName: "신년운세 (심화리포트)",
      amount: 25000,
      status: "paid",
      emailStatus: "sent",
      createdAt: getPastDateString(5, "11:10:00") // 7월 11일
    },
    {
      id: "SIM_0712_1",
      applicationNum: "SIM_APP_0712_1",
      name: "김철수",
      phone: "010-5555-6666",
      email: "kim@gmail.com",
      productName: "토종비결 (문자요약)",
      amount: 20000,
      status: "paid",
      emailStatus: "sent",
      createdAt: getPastDateString(4, "09:30:00") // 7월 12일
    },
    {
      id: "SIM_0712_2",
      applicationNum: "SIM_APP_0712_2",
      name: "박민수",
      phone: "010-7777-8888",
      email: "park@naver.com",
      productName: "토종비결 (고급리포트)",
      amount: 20000,
      status: "paid",
      emailStatus: "sent",
      createdAt: getPastDateString(4, "16:45:00") // 7월 12일
    },
    {
      id: "SIM_0713",
      applicationNum: "SIM_APP_0713",
      name: "최성진",
      phone: "010-1111-2222",
      email: "choi@nate.com",
      productName: "재물&비즈니스운 (단일등급)",
      amount: 20000,
      status: "paid",
      emailStatus: "sent",
      createdAt: getPastDateString(3, "21:15:00") // 7월 13일
    },
    {
      id: "SIM_0714",
      applicationNum: "SIM_APP_0714",
      name: "한예슬",
      phone: "010-3333-4444",
      email: "han@naver.com",
      productName: "타로상담 (온라인 단일)",
      amount: 15000,
      status: "paid",
      emailStatus: "failed",
      createdAt: getPastDateString(2, "02:05:00") // 7월 14일
    },
    {
      id: "SIM_0715_1",
      applicationNum: "SIM_APP_0715_1",
      name: "유재석",
      phone: "010-2222-3333",
      email: "yu@daum.net",
      productName: "연인궁합 (종합 궁합)",
      amount: 30000,
      status: "paid",
      emailStatus: "sent",
      createdAt: getPastDateString(1, "12:12:00") // 7월 15일
    },
    {
      id: "SIM_0715_2",
      applicationNum: "SIM_APP_0715_2",
      name: "강호동",
      phone: "010-8888-9999",
      email: "kang@naver.com",
      productName: "연인궁합 (밀착궁합)",
      amount: 30000,
      status: "paid",
      emailStatus: "sent",
      createdAt: getPastDateString(1, "18:40:00") // 7월 15일
    },
    {
      id: "SIM_0716_1",
      applicationNum: "SIM_APP_0716_1",
      name: "송혜교",
      phone: "010-4444-5555",
      email: "song@naver.com",
      productName: "평생 종합사주 (심화리포트)",
      amount: 30000,
      status: "paid",
      emailStatus: "sent",
      createdAt: getPastDateString(0, "10:15:00") // 오늘 (7월 16일)
    },
    {
      id: "SIM_0716_2",
      applicationNum: "SIM_APP_0716_2",
      name: "현빈",
      phone: "010-9999-0000",
      email: "hyun@gmail.com",
      productName: "신년운세 (고급리포트)",
      amount: 25000,
      status: "paid",
      emailStatus: "sent",
      createdAt: getPastDateString(0, "13:05:00") // 오늘 (7월 16일)
    }
  ];

  for (const order of simulationOrders) {
    await prisma.order.upsert({
      where: { id: order.id },
      update: order,
      create: order
    });
  }

  console.log("Database seed successfully completed!");
}

main()
  .catch(e => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
