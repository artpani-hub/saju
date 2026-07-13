import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

export async function POST(req) {
  try {
    const body = await req.json();
    console.log("PortOne Webhook received:", JSON.stringify(body));

    // V2 웹훅 페이로드 규격 분석
    let paymentId = body.data?.paymentId || body.paymentId;
    let isCancelled = body.type === "Transaction.Cancelled" || body.data?.status === "CANCELLED" || body.status === "cancelled";

    // V1 하이브리드 대응
    if (!paymentId) {
      paymentId = body.merchant_uid;
      isCancelled = body.status === "cancelled";
    }

    if (!paymentId) {
      return NextResponse.json({ success: false, message: "paymentId is missing" }, { status: 400 });
    }

    if (!isCancelled) {
      return NextResponse.json({ success: true, message: "Ignored status event" });
    }

    const dataDir = path.join(process.cwd(), "data");
    const filePath = path.join(dataDir, "orders.json");

    if (fs.existsSync(filePath)) {
      const fileContent = fs.readFileSync(filePath, "utf8");
      let orders = JSON.parse(fileContent);

      // paymentId 매칭 또는 o.id(숫자 부분) 대치
      const orderIdStr = paymentId.replace("payment_", "");
      const matchedIdx = orders.findIndex(o => 
        o && (String(o.id) === orderIdStr || o.paymentId === paymentId)
      );

      if (matchedIdx > -1) {
        orders[matchedIdx].status = "cancelled";
        fs.writeFileSync(filePath, JSON.stringify(orders, null, 2), "utf8");
        console.log(`[Webhook success] Order ${orders[matchedIdx].id} status set to cancelled via webhook.`);
        return NextResponse.json({ success: true, message: `Order status set to cancelled` });
      } else {
        console.log(`[Webhook mismatch] Order not found for paymentId: ${paymentId}`);
        return NextResponse.json({ success: false, message: "Order not found" }, { status: 404 });
      }
    }

    return NextResponse.json({ success: false, message: "Orders DB not found" }, { status: 500 });
  } catch (err) {
    console.error("Webhook parse error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
