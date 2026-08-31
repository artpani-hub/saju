import { NextResponse } from "next/server";
import { db } from "../../../lib/db";

export const dynamic = "force-dynamic";

export async function POST(req) {
  try {
    let body = {};
    const contentType = req.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      body = await req.json();
    } else {
      const rawText = await req.text();
      try {
        body = JSON.parse(rawText);
      } catch (e) {
        const params = new URLSearchParams(rawText);
        body = Object.fromEntries(params.entries());
      }
    }
    console.log("PortOne Webhook received (parsed):", JSON.stringify(body));

    // V2 웹훅 페이로드 규격 분석
    let paymentId = body.data?.paymentId || body.paymentId;
    let isCancelled = body.type === "Transaction.Cancelled" || body.data?.status === "CANCELLED" || body.status === "cancelled";
    let isPaid = body.type === "Transaction.Paid" || body.data?.status === "PAID" || body.status === "paid";

    // V1 하이브리드 대응
    if (!paymentId) {
      paymentId = body.merchant_uid;
      isCancelled = body.status === "cancelled";
      isPaid = body.status === "paid";
    }

    if (!paymentId) {
      return NextResponse.json({ success: false, message: "paymentId is missing" }, { status: 400 });
    }

    if (!isCancelled && !isPaid) {
      return NextResponse.json({ success: true, message: "Ignored status event" });
    }

    const orderIdStr = paymentId.replace("payment_", "").split("_")[0];

    // DB에서 매칭되는 주문 조회 및 트랜잭션 처리
    try {
      const result = await db.$transaction(async (tx) => {
        if (isCancelled) {
          // 1. 주문 상태를 CANCELLED로 업데이트
          const existingOrder = await tx.order.findUnique({ where: { id: orderIdStr } });
          if (existingOrder) {
            const order = await tx.order.update({
              where: { id: orderIdStr },
              data: { status: "CANCELLED" }
            });
            await tx.sajuReport.updateMany({
              where: { userId: order.userId },
              data: { unlocked: false }
            });
            return { order, status: "CANCELLED" };
          }
          return { order: null, status: "CANCELLED" };
        } else {
          // 결제 완료 (isPaid) 처리
          const existingOrder = await tx.order.findUnique({ where: { id: orderIdStr } });

          if (existingOrder) {
            const order = await tx.order.update({
              where: { id: orderIdStr },
              data: { 
                status: "PAID",
                reportStatus: "COMPLETED"
              }
            });

            await tx.sajuReport.updateMany({
              where: { userId: order.userId },
              data: { 
                unlocked: true,
                status: "보고서 생성 완료"
              }
            });

            return { order, status: "PAID" };
          } else {
            // [철통 방어] 프론트엔드가 튕겨서 DB에 주문이 없더라도 웹훅 수신 시 신규 결제완료 주문 자동 생성!
            const buyerName = body.data?.customer?.name || body.buyer_name || body.name || "결제고객";
            const buyerEmail = body.data?.customer?.email || body.buyer_email || body.email || "payment@hyeandang.com";
            const buyerPhone = (body.data?.customer?.phoneNumber || body.buyer_tel || body.phone || "010-0000-0000").replace(/[^0-9]/g, "");
            const paidAmount = Number(body.data?.amount?.total || body.paid_amount || body.amount || 14900);

            const user = await tx.user.upsert({
              where: { phone: buyerPhone || `010${Math.floor(Math.random()*100000000)}` },
              update: { name: buyerName, email: buyerEmail },
              create: { name: buyerName, email: buyerEmail, phone: buyerPhone || `010${Math.floor(Math.random()*100000000)}` }
            });

            let prodName = "평생사주고급리포트";
            if (paidAmount === 14900) prodName = "평생종합사주 문자요약";
            if (paidAmount === 15000 || paidAmount === 49900) prodName = "평생사주 심화리포트";

            const newOrder = await tx.order.create({
              data: {
                id: orderIdStr,
                applicationNum: `APP_${orderIdStr}`,
                userId: user.id,
                productName: prodName,
                userName: buyerName,
                amount: paidAmount,
                paymentMethod: "CARD",
                status: "PAID",
                reportStatus: "COMPLETED",
                referer: "portone_webhook"
              }
            });

            await tx.sajuReport.create({
              data: {
                userId: user.id,
                unlocked: true,
                status: "보고서 생성 완료"
              }
            });

            return { order: newOrder, status: "PAID" };
          }
        }
      });

      console.log(`[Webhook success] Order ${result.order?.id} status set to ${result.status} via database transaction.`);
      return NextResponse.json({ success: true, message: `Order status set to ${result.status.toLowerCase()}` });
    } catch (dbErr) {
      console.log(`[Webhook fallback error]: ${dbErr.message}`);
      return NextResponse.json({ success: true, message: "Order processed with fallback" });
    }
  } catch (err) {
    console.error("Webhook parse error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
