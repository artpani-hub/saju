const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

// DATABASE_URL 환경변수를 리눅스 절대경로로 명시적으로 오버라이딩 (실서버 런타임 호환 보장)
process.env.DATABASE_URL = "file:/home/www/saju-artpani/frontend/prisma/dev.db";

const prisma = new PrismaClient();

const ordersJsonPath = path.join(__dirname, '../data/orders.json');
const inquiriesJsonPath = path.join(__dirname, '../data/inquiries.json');

async function main() {
  console.log('=== Starting JSON to SQLite Migration ===');

  // 1. Orders JSON 마이그레이션
  if (fs.existsSync(ordersJsonPath)) {
    console.log('Loading orders.json...');
    const rawOrders = JSON.parse(fs.readFileSync(ordersJsonPath, 'utf8'));
    console.log(`Found ${rawOrders.length} orders in JSON.`);

    let successCount = 0;
    let skipCount = 0;

    for (const o of rawOrders) {
      if (!o.phone || !o.name) {
        skipCount++;
        continue;
      }

      // 전화번호 포맷 정규화 (중복 방지용)
      const cleanPhone = o.phone.replace(/[^0-9]/g, '');
      if (!cleanPhone) {
        skipCount++;
        continue;
      }

      try {
        await prisma.$transaction(async (tx) => {
          // 1-1. 유저 upsert
          const birthY = Number(o.year) || 1995;
          const birthM = Number(o.month) || 1;
          const birthD = Number(o.day) || 1;

          // 생성시각 파싱 (시차가 꼬이지 않게 강제 UTC/로컬 파싱 보완)
          let dateObj = new Date();
          if (o.createdAt) {
            const normalized = o.createdAt.includes('T') ? o.createdAt : o.createdAt.replace(' ', 'T') + ':00Z';
            dateObj = new Date(normalized);
            if (isNaN(dateObj.getTime())) {
              dateObj = new Date();
            }
          }

          const user = await tx.user.upsert({
            where: { phone: cleanPhone },
            update: {
              name: o.name,
              email: o.email || null,
              birthYear: birthY,
              birthMonth: birthM,
              birthDay: birthD,
              calendarType: o.calendar || 'solar',
              birthHour: o.hour || null,
              gender: o.gender || 'female',
              worryText: o.worryText || null,
            },
            create: {
              name: o.name,
              email: o.email || null,
              phone: cleanPhone,
              birthYear: birthY,
              birthMonth: birthM,
              birthDay: birthD,
              calendarType: o.calendar || 'solar',
              birthHour: o.hour || null,
              gender: o.gender || 'female',
              worryText: o.worryText || null,
              createdAt: dateObj
            }
          });

          // 1-2. 기존에 주문번호가 이미 존재하는지 체크
          const orderIdStr = String(o.id);
          const existingOrder = await tx.order.findUnique({
            where: { id: orderIdStr }
          });

          if (!existingOrder) {
            // APP 번호 중복 방지
            const appNum = `APP_${orderIdStr}_${Math.floor(Math.random() * 10000)}`;
            
            // 1-3. SajuReport 생성
            const unlockedState = o.status === 'paid' || o.status === 'PAID' || o.status === 'free' || o.status === 'FREE';
            await tx.sajuReport.create({
              data: {
                userId: user.id,
                unlocked: unlockedState,
                status: unlockedState ? 'COMPLETED' : 'WAITING_PAYMENT',
                createdAt: dateObj
              }
            });

            // 1-4. Order 생성
            await tx.order.create({
              data: {
                id: orderIdStr,
                applicationNum: appNum,
                userId: user.id,
                productName: o.productName || '평생 종합 사주팔자 보감',
                amount: Number(o.amount) || 0,
                paymentMethod: o.status === 'free' ? 'free' : 'kakaopay',
                status: o.status ? o.status.toUpperCase() : 'PENDING',
                reportStatus: unlockedState ? 'COMPLETED' : 'PENDING',
                refundStatus: o.status === 'refunded' ? 'REFUND_COMPLETED' : null,
                referer: o.referer || 'direct',
                createdAt: dateObj
              }
            });
            successCount++;
          } else {
            skipCount++;
          }
        });
      } catch (err) {
        console.error(`Failed to migrate order ID ${o.id}:`, err.message);
      }
    }
    console.log(`Orders Migration Finished. Migrated: ${successCount}, Skipped: ${skipCount}`);
  }

  // 2. Inquiries JSON 마이그레이션
  if (fs.existsSync(inquiriesJsonPath)) {
    console.log('Loading inquiries.json...');
    const rawInquiries = JSON.parse(fs.readFileSync(inquiriesJsonPath, 'utf8'));
    console.log(`Found ${rawInquiries.length} inquiries in JSON.`);

    let inqSuccessCount = 0;
    let inqSkipCount = 0;

    for (const inq of rawInquiries) {
      if (!inq.id) {
        inqSkipCount++;
        continue;
      }

      const inqIdStr = String(inq.id);
      
      try {
        const existingInq = await prisma.inquiry.findUnique({
          where: { id: inqIdStr }
        });

        if (!existingInq) {
          const cleanPhone = inq.phone ? inq.phone.replace(/[^0-9]/g, '') : null;
          let matchedUser = null;
          if (cleanPhone) {
            matchedUser = await prisma.user.findUnique({
              where: { phone: cleanPhone }
            });
          }

          let dateObj = new Date();
          if (inq.createdAt) {
            const normalized = inq.createdAt.includes('T') ? inq.createdAt : inq.createdAt.replace(' ', 'T') + ':00Z';
            dateObj = new Date(normalized);
          }

          let inquiryType = '기타 문의';
          if (inq.type === 'delivery') inquiryType = '신청정보 수정';
          else if (inq.type === 'refund') inquiryType = '환불 문의';
          else if (inq.type === 'payment') inquiryType = '결제 문의';

          await prisma.inquiry.create({
            data: {
              id: inqIdStr,
              userId: matchedUser ? matchedUser.id : null,
              type: inquiryType,
              content: inq.content || '',
              answer: inq.reply || null,
              status: inq.reply ? 'ANSWERED' : 'PENDING',
              createdAt: dateObj
            }
          });
          inqSuccessCount++;
        } else {
          inqSkipCount++;
        }
      } catch (err) {
        console.error(`Failed to migrate inquiry ID ${inq.id}:`, err.message);
      }
    }
    console.log(`Inquiries Migration Finished. Migrated: ${inqSuccessCount}, Skipped: ${inqSkipCount}`);
  }

  console.log('=== Migration Complete ===');
}

main()
  .catch(e => {
    console.error('Fatal Migration Error:', e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
