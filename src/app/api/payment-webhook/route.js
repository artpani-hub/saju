import { NextResponse } from "next/server";
import { db } from "../../../lib/db";
import crypto from "crypto";

export const dynamic = "force-dynamic";

/**
 * PortOne V2 Webhook 서명 검증 함수 (HMAC-SHA256)
 */
function verifyWebhookSignature(rawBody, reqHeaders) {
  const secret = process.env.PORTONE_WEBHOOK_SECRET;
  if (!secret) {
    return { valid: false, reason: "NO_WEBHOOK_SECRET_CONFIGURED", verified: false };
  }

  const webhookId = reqHeaders.get("webhook-id");
  const webhookTimestamp = reqHeaders.get("webhook-timestamp");
  const webhookSignature = reqHeaders.get("webhook-signature");

  if (!webhookSignature || !webhookId || !webhookTimestamp) {
    return { valid: false, reason: "MISSING_SIGNATURE_HEADERS", verified: false };
  }

  const currentTimestamp = Math.floor(Date.now() / 1000);
  const sentTimestamp = Number(webhookTimestamp);
  if (!isNaN(sentTimestamp) && Math.abs(currentTimestamp - sentTimestamp) > 300) {
    return { valid: false, reason: "TIMESTAMP_EXPIRED", verified: false };
  }

  try {
    const payload = `${webhookId}.${webhookTimestamp}.${rawBody}`;
    const computedHmac = crypto.createHmac("sha256", secret).update(payload).digest("base64");
    
    const signatureParts = webhookSignature.split(" ");
    const isValid = signatureParts.some(part => {
      const sig = part.startsWith("v1,") ? part.slice(3) : part;
      return crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(computedHmac));
    });

    return { valid: isValid, reason: isValid ? "VALID" : "SIGNATURE_MISMATCH", verified: isValid };
  } catch (err) {
    return { valid: false, reason: "VERIFICATION_ERROR: " + err.message, verified: false };
  }
}

/**
 * PortOne V2 공식 결제 단건 조회 API 호출
 */
async function fetchPortOnePayment(paymentId) {
  const apiSecret = process.env.PORTONE_API_SECRET;
  if (!apiSecret) {
    return { success: false, error: "NO_PORTONE_API_SECRET", message: "PORTONE_API_SECRET 환경변수가 설정되지 않아 결제 조회가 불가능합니다." };
  }

  try {
    const res = await fetch(`https://api.portone.io/payments/${encodeURIComponent(paymentId)}`, {
      method: "GET",
      headers: {
        "Authorization": `PortOne ${apiSecret}`,
        "Content-Type": "application/json"
      }
    });

    if (!res.ok) {
      const errText = await res.text();
      return { success: false, error: `API_HTTP_${res.status}`, message: errText };
    }

    const payment = await res.json();
    return { success: true, payment };
  } catch (e) {
    return { success: false, error: "NETWORK_ERROR", message: e.message };
  }
}

export async function POST(req) {
  try {
    const rawText = await req.text();
    
    // 1. 웹훅 서명 검증 (서명 미검증과 검증 성공을 엄격히 구분)
    const verification = verifyWebhookSignature(rawText, req.headers);
    if (process.env.PORTONE_WEBHOOK_SECRET && !verification.valid) {
      console.warn(`[PortOne Webhook] Unauthorized request rejected: ${verification.reason}`);
      return NextResponse.json(
        { success: false, error: "Unauthorized: Invalid webhook signature", reason: verification.reason },
        { status: 401 }
      );
    }


    let body = {};
    try {
      body = JSON.parse(rawText);
    } catch (e) {
      const params = new URLSearchParams(rawText);
      body = Object.fromEntries(params.entries());
    }
    console.log("PortOne Webhook received:", JSON.stringify(body));

    // V2 웹훅 기본 알림 페이로드 분석 (공식 스키마: type, timestamp, data.paymentId, data.transactionId, data.storeId)
    // ※ 공식 V2 웹훅에는 data.amount 필드가 포함되지 않으므로, 웹훅 본문에서 금액을 임의 추출하지 않습니다.
    const eventType = body.type || body.event || "";
    const paymentId = body.data?.paymentId || body.paymentId || body.merchant_uid;
    const transactionId = body.data?.transactionId || body.transactionId || body.imp_uid;
    const storeId = body.data?.storeId || body.storeId || "";

    if (!paymentId) {
      return NextResponse.json({ success: false, message: "paymentId is missing" }, { status: 400 });
    }

    // 2. DB에서 주문 명시적 매칭 (추측성 접두사 제거 폐기 -> 주문 생성 시 저장된 명시적 paymentId 1:1 매칭)
    let existingOrder = null;
    try {
      const orders = await db.$queryRawUnsafe(
        'SELECT * FROM "Order" WHERE paymentId = ? OR id = ? LIMIT 1',
        String(paymentId),
        String(paymentId)
      );
      if (orders && orders.length > 0) {
        existingOrder = orders[0];
      }
    } catch (e) {
      existingOrder = await db.order.findFirst({
        where: {
          OR: [
            { paymentId: String(paymentId) },
            { id: String(paymentId) }
          ]
        }
      }).catch(() => null);
    }

    if (!existingOrder) {
      console.warn(`[Webhook Guard] 주문을 찾을 수 없습니다 (명시적 paymentId: ${paymentId}). 가상 주문 생성을 엄격 차단합니다.`);
      return NextResponse.json({ success: false, error: "Order not found for paymentId", paymentId }, { status: 404 });
    }

    // 3. 서명 검증 통과 후, paymentId로 PortOne 결제 조회 API를 호출해 실제 상태·금액·통화·상점 확인
    const apiLookup = await fetchPortOnePayment(paymentId);

    // [보안 방어]: API 조회가 불가능한 경우 (PORTONE_API_SECRET 미설정 또는 외부 통신 불가)
    // 확인되지 않은 거래를 절대 결제완료(PAID)로 처리하지 않고 PENDING 유지
    if (!apiLookup.success) {
      console.warn(`[Webhook Guard] 실거래 결제 조회 실패 (${apiLookup.error}): ${apiLookup.message}`);
      
      try {
        await db.$executeRawUnsafe(
          'UPDATE "Order" SET adminMemo = ? WHERE id = ?',
          `[웹훅 수신] PortOne 실거래 조회 실패 (${apiLookup.error}). 외부 결제 미검증 상태 유지`,
          existingOrder.id
        );
      } catch (memoErr) {
        console.error("adminMemo 업데이트 실패:", memoErr);
      }

      return NextResponse.json({
        success: false,
        error: apiLookup.error,
        message: "PortOne 결제 조회 API 검증 불가로 인해 결제완료 처리가 보류되었습니다. 서버 환경변수(PORTONE_API_SECRET) 설정을 완료해야 결제 승인이 확정됩니다.",
        orderId: existingOrder.id,
        currentStatus: existingOrder.status
      }, { status: 403 });
    }

    // --- 외부 PortOne API 실거래 데이터 검증 단계 ---
    const paymentData = apiLookup.payment;
    const verifiedStatus = paymentData.status; // "PAID", "FAILED", "CANCELLED", "PARTIAL_CANCELLED" 등
    const verifiedAmount = Number(paymentData.amount?.total || 0);
    const verifiedCurrency = paymentData.amount?.currency || "KRW";
    const verifiedStoreId = paymentData.storeId;

    // A. 상점 ID 검증 (다중 상점/타상점 결제 오적용 차단)
    const expectedStoreId = process.env.NEXT_PUBLIC_PORTONE_STORE_ID || "store-312155f8-f523-4067-a568-285c7bbec6e0";
    if (verifiedStoreId && verifiedStoreId !== expectedStoreId) {
      console.error(`[Webhook Guard] Store ID mismatch! Expected: ${expectedStoreId}, Got: ${verifiedStoreId}`);
      return NextResponse.json({ success: false, error: "Store ID mismatch" }, { status: 400 });
    }

    // B. 통화 검증
    if (verifiedCurrency !== "KRW") {
      console.error(`[Webhook Guard] Currency mismatch! Expected KRW, got ${verifiedCurrency}`);
      return NextResponse.json({ success: false, error: "Invalid currency" }, { status: 400 });
    }

    // C. 금액 검증 (주문 금액과 API 실승인 금액 1:1 대조)
    if (Number(existingOrder.amount) !== verifiedAmount) {
      console.error(`[Webhook Fraud Mismatch] 주문 금액(${existingOrder.amount}원) != 실결제 승인금액(${verifiedAmount}원)`);
      try {
        await db.$executeRawUnsafe(
          'UPDATE "Order" SET adminMemo = ? WHERE id = ?',
          `[결제 위변조 의심] 주문 금액(${existingOrder.amount}원)과 실승인 금액(${verifiedAmount}원) 불일치`,
          existingOrder.id
        );
      } catch (e) {}
      return NextResponse.json({ success: false, error: "Amount mismatch detected" }, { status: 400 });
    }

    // 4. 상태별 트랜잭션 전이 (취소, 부분 취소, 실패, 결제완료)
    // --- I. 취소/환불 처리 (누적 취소액 기반 전체 취소 vs 부분 취소 분기, 중복/순서 뒤바뀜 방어) ---
    if (
      verifiedStatus === "CANCELLED" || 
      verifiedStatus === "PARTIAL_CANCELLED" || 
      eventType === "Transaction.Cancelled" || 
      eventType === "Transaction.PartialCancelled"
    ) {
      const cancellations = paymentData.cancellations || [];
      const calculatedSum = cancellations.reduce((acc, c) => acc + Number(c.totalAmount || c.amount || 0), 0);
      const totalCancelled = paymentData.amount?.cancelled !== undefined 
        ? Number(paymentData.amount.cancelled) 
        : calculatedSum;

      const isFullCancellation = totalCancelled >= Number(existingOrder.amount) || verifiedStatus === "CANCELLED";

      if (isFullCancellation) {
        // 전액 취소: 주문 상태 CANCELLED, 리포트 잠금
        await db.$executeRawUnsafe(
          'UPDATE "Order" SET status = "CANCELLED", refundStatus = "REFUNDED", paymentId = ?, transactionId = ?, adminMemo = ? WHERE id = ?',
          String(paymentId),
          String(transactionId || existingOrder.transactionId || ""),
          `[전액 취소 완료] PortOne 결제 취소 확인 (누적 취소액: ${totalCancelled}원)`,
          existingOrder.id
        );
        await db.$executeRawUnsafe(
          'UPDATE "SajuReport" SET unlocked = 0 WHERE userId = ?',
          existingOrder.userId
        );
        return NextResponse.json({ success: true, status: "CANCELLED", orderId: existingOrder.id, totalCancelled });
      } else {
        // 부분 취소: 상태는 유지하되 refundStatus를 PARTIALLY_REFUNDED로 기록, 보고서는 잠그지 않음
        await db.$executeRawUnsafe(
          'UPDATE "Order" SET refundStatus = "PARTIALLY_REFUNDED", adminMemo = ? WHERE id = ?',
          `[부분 취소 완료] PortOne 부분 취소 확인 (누적 취소액: ${totalCancelled}원 / 총액: ${existingOrder.amount}원)`,
          existingOrder.id
        );
        return NextResponse.json({ success: true, status: "PARTIALLY_REFUNDED", orderId: existingOrder.id, totalCancelled });
      }
    }

    // --- II. 결제 실패 처리 ---
    if (verifiedStatus === "FAILED" || eventType === "Transaction.Failed") {
      if (existingOrder.status !== "PAID" && existingOrder.status !== "CANCELLED") {
        await db.$executeRawUnsafe(
          'UPDATE "Order" SET status = "FAILED", paymentId = ?, transactionId = ?, adminMemo = ? WHERE id = ?',
          String(paymentId),
          String(transactionId || ""),
          `[결제 실패] PortOne 승인 실패`,
          existingOrder.id
        );
        return NextResponse.json({ success: true, status: "FAILED", orderId: existingOrder.id });
      }
      return NextResponse.json({ success: true, status: "FAILED_PRESERVED", orderId: existingOrder.id });
    }

    // --- III. 결제 완료 처리 ---
    if (verifiedStatus === "PAID" || eventType === "Transaction.Paid") {
      // 방어 1: 이미 취소된 주문에 과거 Paid가 재수신된 경우 보호
      if (existingOrder.status === "CANCELLED" || existingOrder.refundStatus === "REFUNDED") {
        console.warn(`[Webhook Guard] 주문 ${existingOrder.id}은 이미 CANCELLED 상태입니다. 과거 Paid 웹훅 재수신 무시.`);
        return NextResponse.json({ success: true, status: "CANCELLED_PROTECTED", orderId: existingOrder.id });
      }

      // 방어 2: 중복 수신 멱등성 보장 (이미 PAID인 경우 추가 작업 없이 멱등 응답)
      if (existingOrder.status === "PAID" || existingOrder.status === "paid") {
        console.log(`[Webhook Idempotent] 주문 ${existingOrder.id}은 이미 결제완료 상태입니다.`);
        return NextResponse.json({ success: true, status: "ALREADY_PAID", orderId: existingOrder.id });
      }

      // 정상 결제완료 전이
      await db.$executeRawUnsafe(
        'UPDATE "Order" SET status = "PAID", reportStatus = "COMPLETED", paymentDate = datetime("now"), paymentId = ?, transactionId = ?, adminMemo = ? WHERE id = ?',
        String(paymentId),
        String(transactionId || ""),
        `[실거래 검증 완료] PortOne V2 API 조회 일치 (승인금액: ${verifiedAmount}원)`,
        existingOrder.id
      );

      await db.$executeRawUnsafe(
        'UPDATE "SajuReport" SET unlocked = 1, status = "보고서 생성 완료" WHERE userId = ?',
        existingOrder.userId
      );

      return NextResponse.json({ success: true, status: "PAID", orderId: existingOrder.id });
    }

    return NextResponse.json({ success: true, status: "UNKNOWN", orderId: existingOrder.id });
  } catch (err) {
    console.error("Webhook processing error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
