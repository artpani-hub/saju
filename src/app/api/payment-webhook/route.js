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
          const order = await tx.order.update({
            where: { id: orderIdStr },
            data: { status: "CANCELLED" }
          });

          // 2. 해당 주문 유저의 사주 리포트 unlocked 상태를 false로 잠금
          await tx.sajuReport.updateMany({
            where: { userId: order.userId },
            data: { unlocked: false }
          });

          return { order, status: "CANCELLED" };
        } else {
          // 결제 완료 (isPaid) 처리
          // 1. 주문 상태를 PAID로 업데이트 및 보고서 상태를 COMPLETED로 업데이트
          const order = await tx.order.update({
            where: { id: orderIdStr },
            data: { 
              status: "PAID",
              reportStatus: "COMPLETED"
            }
          });

          // 2. 해당 주문 유저의 사주 리포트 unlocked 상태를 true로 잠금 해제 및 상태를 "보고서 생성 완료"로 변경
          await tx.sajuReport.updateMany({
            where: { userId: order.userId },
            data: { 
              unlocked: true,
              status: "보고서 생성 완료"
            }
          });

          return { order, status: "PAID" };
        }
      });

      console.log(`[Webhook success] Order ${result.order.id} status set to ${result.status} via database transaction.`);
      return NextResponse.json({ success: true, message: `Order status set to ${result.status.toLowerCase()}` });
    } catch (dbErr) {
      console.log(`[Webhook mismatch] Order not found for id: ${orderIdStr}, error: ${dbErr.message}`);
      return NextResponse.json({ success: false, message: "Order not found in DB" }, { status: 404 });
    }
  } catch (err) {
    console.error("Webhook parse error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
