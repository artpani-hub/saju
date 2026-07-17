process.env.DATABASE_URL = "file:d:/인터그리비티/saju/prisma/dev.db";
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient({
  datasourceUrl: "file:d:/인터그리비티/saju/prisma/dev.db"
});

const ordersPath = path.join(__dirname, '../data/orders.json');
const inquiriesPath = path.join(__dirname, '../data/inquiries.json');

async function main() {
  console.log("Starting data synchronization from local JSON files to SQLite DB...");

  // 1. Sync orders.json
  if (fs.existsSync(ordersPath)) {
    const ordersData = JSON.parse(fs.readFileSync(ordersPath, 'utf8'));
    console.log(`Loaded ${ordersData.length} orders from orders.json`);

    for (const item of ordersData) {
      const orderId = String(item.id);
      const appNum = item.applicationNum || `APP_${orderId}`;
      const phoneClean = item.phone || "01000000000";
      const dateVal = item.createdAt ? new Date(item.createdAt) : new Date();

      // 1-1. Upsert User
      const user = await prisma.user.upsert({
        where: { phone: phoneClean },
        update: {
          name: item.name || "알수없음",
          email: item.email || "",
          birthYear: Number(item.year) || 1995,
          birthMonth: Number(item.month) || 5,
          birthDay: Number(item.day) || 15,
          calendarType: item.calendar || "solar",
          gender: item.gender || "female",
          birthHour: item.hour || null,
          worryText: item.worryText || "",
          createdAt: dateVal
        },
        create: {
          name: item.name || "알수없음",
          email: item.email || "",
          phone: phoneClean,
          birthYear: Number(item.year) || 1995,
          birthMonth: Number(item.month) || 5,
          birthDay: Number(item.day) || 15,
          calendarType: item.calendar || "solar",
          gender: item.gender || "female",
          birthHour: item.hour || null,
          worryText: item.worryText || "",
          createdAt: dateVal
        }
      });

      // 1-2. Upsert SajuReport
      let report = await prisma.sajuReport.findFirst({
        where: { userId: user.id }
      });
      if (!report) {
        report = await prisma.sajuReport.create({
          data: {
            userId: user.id,
            unlocked: item.status === "paid" || item.status === "PAID" || item.status === "free",
            status: "REPORT_COMPLETED",
            createdAt: dateVal
          }
        });
      } else {
        await prisma.sajuReport.update({
          where: { id: report.id },
          data: {
            unlocked: item.status === "paid" || item.status === "PAID" || item.status === "free"
          }
        });
      }

      // 1-3. Upsert Order
      await prisma.order.upsert({
        where: { id: orderId },
        update: {
          applicationNum: appNum,
          productName: item.productName || "평생 종합 사주팔자",
          amount: Number(item.amount) || 0,
          paymentMethod: "card",
          status: String(item.status).toUpperCase(),
          reportStatus: "생성 완료",
          createdAt: dateVal
        },
        create: {
          id: orderId,
          applicationNum: appNum,
          userId: user.id,
          productName: item.productName || "평생 종합 사주팔자",
          amount: Number(item.amount) || 0,
          paymentMethod: "card",
          status: String(item.status).toUpperCase(),
          reportStatus: "생성 완료",
          createdAt: dateVal
        }
      });
    }
    console.log("Orders synchronization completed.");
  } else {
    console.log("No orders.json file found.");
  }

  // 2. Sync inquiries.json
  if (fs.existsSync(inquiriesPath)) {
    const inquiriesData = JSON.parse(fs.readFileSync(inquiriesPath, 'utf8'));
    console.log(`Loaded ${inquiriesData.length} inquiries from inquiries.json`);

    for (const item of inquiriesData) {
      const inqId = String(item.id);
      
      let matchedUser = null;
      if (item.phone) {
        matchedUser = await prisma.user.findUnique({
          where: { phone: item.phone }
        });
      }

      const dateVal = item.createdAt ? new Date(item.createdAt) : new Date();

      await prisma.inquiry.upsert({
        where: { id: inqId },
        update: {
          type: item.type || "기타 문의",
          content: item.content || "",
          answer: item.reply || null,
          status: String(item.status).toUpperCase(),
          createdAt: dateVal
        },
        create: {
          id: inqId,
          userId: matchedUser ? matchedUser.id : null,
          type: item.type || "기타 문의",
          content: item.content || "",
          answer: item.reply || null,
          status: String(item.status).toUpperCase(),
          createdAt: dateVal
        }
      });
    }
    console.log("Inquiries synchronization completed.");
  } else {
    console.log("No inquiries.json file found.");
  }

  console.log("All data synchronized successfully!");
}

main()
  .catch(e => {
    console.error("Data sync failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
