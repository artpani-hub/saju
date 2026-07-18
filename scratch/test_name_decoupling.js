const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  console.log("=== Decoupled Order Name Test (DATABASE_URL=prisma/dev.db) ===");

  const testPhone = "010-9999-8888";
  
  // 0. 기존 테스트 데이터가 있으면 청소
  await prisma.order.deleteMany({
    where: { user: { phone: testPhone } }
  });
  await prisma.user.deleteMany({
    where: { phone: testPhone }
  });

  // 1. 첫 번째 주문 생성 (이름: 김철수, 번호: 010-9999-8888)
  console.log("\n1. Creating first order for '김철수'...");
  const user1 = await prisma.user.upsert({
    where: { phone: testPhone },
    update: { name: "김철수" },
    create: { name: "김철수", phone: testPhone, birthYear: 1990, birthMonth: 5, birthDay: 10, calendarType: "solar", gender: "male" }
  });
  
  const order1 = await prisma.order.create({
    data: {
      id: "TEST_ORDER_01",
      applicationNum: "APP_TEST_ORDER_01",
      userId: user1.id,
      productName: "평생 종합 사주팔자 보감",
      userName: "김철수", // 주문 당시 이름 저장
      amount: 14900,
      paymentMethod: "CARD",
      status: "PAID",
      reportStatus: "PENDING"
    }
  });
  console.log("First Order created:", order1.id, "for userName:", order1.userName);

  // 2. 두 번째 주문 생성 (이름: 이영희, 번호: 010-9999-8888 - upsert에 의해 유저 이름이 '이영희'로 덮어쓰여짐)
  console.log("\n2. Creating second order for '이영희' (same phone)...");
  const user2 = await prisma.user.upsert({
    where: { phone: testPhone },
    update: { name: "이영희" },
    create: { name: "이영희", phone: testPhone, birthYear: 1990, birthMonth: 5, birthDay: 10, calendarType: "solar", gender: "male" }
  });
  
  const order2 = await prisma.order.create({
    data: {
      id: "TEST_ORDER_02",
      applicationNum: "APP_TEST_ORDER_02",
      userId: user2.id,
      productName: "평생 종합 사주팔자 보감",
      userName: "이영희", // 주문 당시 이름 저장
      amount: 14900,
      paymentMethod: "CARD",
      status: "PAID",
      reportStatus: "PENDING"
    }
  });
  console.log("Second Order created:", order2.id, "for userName:", order2.userName);

  // 3. DB User 테이블의 현재 이름 확인
  const updatedUser = await prisma.user.findUnique({
    where: { phone: testPhone }
  });
  console.log("\n3. Current User Name in DB User table:", updatedUser.name); // '이영희' 여야 함

  // 4. 주문 목록 조회 및 매핑 (route.js GET API 로직 시뮬레이션)
  console.log("\n4. Simulating route.js GET mapping output...");
  const dbOrders = await prisma.order.findMany({
    where: {
      id: { in: ["TEST_ORDER_01", "TEST_ORDER_02"] }
    },
    include: {
      user: true
    }
  });

  const formattedOrders = dbOrders.map(order => {
    return {
      id: order.id,
      name: order.userName || order.user?.name || "알 수 없음", // userName 우선
      phone: order.user?.phone,
      amount: order.amount,
      status: order.status
    };
  });

  console.log("Mapped Orders output:");
  console.log(formattedOrders);

  // 검증 단언
  const firstOrderOutputName = formattedOrders.find(o => o.id === "TEST_ORDER_01")?.name;
  const secondOrderOutputName = formattedOrders.find(o => o.id === "TEST_ORDER_02")?.name;

  if (firstOrderOutputName === "김철수" && secondOrderOutputName === "이영희") {
    console.log("\n[TEST SUCCESS] Customer names are decoupled successfully! Same phone, different names.");
  } else {
    console.error("\n[TEST FAILED] Decoupling failed.");
  }

  // 5. 청소
  await prisma.order.deleteMany({
    where: { id: { in: ["TEST_ORDER_01", "TEST_ORDER_02"] } }
  });
  await prisma.user.deleteMany({
    where: { phone: testPhone }
  });
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
