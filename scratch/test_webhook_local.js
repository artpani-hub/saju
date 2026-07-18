const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  console.log("=== Testing Webhook Logic Locally (DATABASE_URL=prisma/dev.db) ===");
  
  // 1. 테스트용 주문 '1889' 조회
  let order = await prisma.order.findUnique({
    where: { id: "1889" },
    include: { user: true }
  });
  
  if (!order) {
    console.error("Order '1889' not found in local db. Please create a dummy order first.");
    return;
  }
  
  console.log("Before Webhook:");
  console.log("  Order Status:", order.status);
  console.log("  ReportStatus:", order.reportStatus);
  
  // 2. Webhook DB 업데이트 로직 직접 실행
  const paymentId = "payment_1889_1784298610468";
  const orderIdStr = paymentId.replace("payment_", "").split("_")[0];
  
  console.log("Simulating webhook update for order:", orderIdStr);
  
  try {
    const result = await prisma.$transaction(async (tx) => {
      // 결제 완료 (isPaid) 처리 시뮬레이션
      // 1. 주문 상태를 PAID로 업데이트 및 보고서 상태를 COMPLETED로 업데이트
      const order = await tx.order.update({
        where: { id: orderIdStr },
        data: { 
          status: "PAID",
          reportStatus: "COMPLETED"
        }
      });

      // 2. 해당 주문 유저의 사주 리포트 unlocked 상태를 true로 잠금 해제 및 상태를 "결제 완료"로 변경
      await tx.sajuReport.updateMany({
        where: { userId: order.userId },
        data: { 
          unlocked: true,
          status: "결제 완료"
        }
      });

      return { order, status: "PAID" };
    });

    console.log(`[Test Success] Order ${result.order.id} status set to ${result.status} via database transaction.`);
  } catch (dbErr) {
    console.error(`[Test Failed] Error updating database:`, dbErr.message);
  }
  
  // 3. 테스트 결과 검증
  order = await prisma.order.findUnique({
    where: { id: "1889" },
    include: { user: { include: { reports: true } } }
  });
  
  console.log("After Webhook:");
  console.log("  Order Status:", order.status);
  console.log("  ReportStatus:", order.reportStatus);
  if (order.user && order.user.reports.length > 0) {
    console.log("  SajuReport Unlocked:", order.user.reports[0].unlocked);
    console.log("  SajuReport Status:", order.user.reports[0].status);
  }
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
