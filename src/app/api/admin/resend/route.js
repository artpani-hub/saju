import { NextResponse } from "next/server";
import { db } from "../../../../lib/db";
import nodemailer from "nodemailer";

export const dynamic = "force-dynamic";

export async function POST(req) {
  try {
    const body = await req.json();
    const { adminPassword, orderId, sendType } = body; // sendType: "sms" or "email"

    if (adminPassword !== "artpani1234") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    if (!orderId) {
      return NextResponse.json({ success: false, error: "Order ID is required" }, { status: 400 });
    }

    // 1. 주문서 및 고객 정보, 사주 리포트 정보 조회
    const order = await db.order.findUnique({
      where: { id: orderId },
      include: {
        user: {
          include: {
            reports: {
              orderBy: { createdAt: "desc" },
              take: 1
            }
          }
        }
      }
    });

    if (!order || !order.user) {
      return NextResponse.json({ success: false, error: "주문 또는 고객 정보를 찾을 수 없습니다." }, { status: 404 });
    }

    const user = order.user;
    const report = user.reports[0] || null;

    // 2. 발송용 메시지 본문 및 메일 제목 구성
    const reportLink = `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/result?phone=${encodeURIComponent(user.phone)}&name=${encodeURIComponent(user.name)}&reportGrade=sms&unlock=true`;
    
    const mailSubject = `[혜안당] ${user.name} 고객님의 사주팔자 보고서 확인 링크 안내`;
    const messageContent = `[혜안당] 안녕하세요, ${user.name} 고객님. 신청하신 사주 평생 보감 보고서가 정상 발행되었습니다. 아래 링크를 통해 21페이지 초개인화 사주 리포트를 즉시 확인해 주시기 바랍니다.\n\n▶ 보고서 링크: ${reportLink}`;

    let sendSuccess = false;

    // 3. 발송 매체 선택적 전송
    if (sendType === "email") {
      if (!user.email) {
        return NextResponse.json({ success: false, error: "고객의 이메일 주소가 등록되어 있지 않습니다." }, { status: 400 });
      }

      const naverUser = process.env.NAVER_USER || "saju2026kr@naver.com";
      const naverPass = process.env.NAVER_APP_PASS || "5RRK1PFWC56H";

      const transporter = nodemailer.createTransport({
        host: "smtp.naver.com",
        port: 465,
        secure: true,
        auth: { user: naverUser, pass: naverPass },
        tls: { rejectUnauthorized: false }
      });

      const mailOptions = {
        from: `"혜안당 명리연구소" <${naverUser}>`,
        to: user.email,
        subject: mailSubject,
        html: `
          <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: sans-serif; background-color: #1a1a1a; color: #f5f5f5; border-radius: 8px;">
            <h2 style="color: #A3845B; text-align: center; border-bottom: 2px solid #A3845B; padding-bottom: 10px;">혜안당 사주 명리 분석 결과</h2>
            <p style="font-size: 16px; line-height: 1.6;">안녕하세요, <strong>${user.name}</strong> 고객님.</p>
            <p style="font-size: 16px; line-height: 1.6;">신청하신 평생 종합 사주 보고서의 분석이 완료되어 확인용 링크를 재발송해 드립니다.</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${reportLink}" target="_blank" style="background-color: #A3845B; color: #1a1a1a; font-weight: bold; text-decoration: none; padding: 12px 30px; border-radius: 4px; display: inline-block; font-size: 16px;">21페이지 리포트 즉시 확인하기</a>
            </div>
            <p style="font-size: 14px; color: #888;">본 메일은 관리자 수동 요청에 의해 발송된 링크 재안내 메시지입니다.</p>
          </div>
        `
      };

      try {
        await transporter.sendMail(mailOptions);
        sendSuccess = true;
      } catch (err) {
        console.error("이메일 재발송 실패:", err);
      }
    } else {
      // SMS 발송 처리 (Aligo API 연계)
      const key = process.env.ALIGO_KEY;
      const userid = process.env.ALIGO_USER_ID;
      const sender = process.env.ALIGO_SENDER;

      if (key && userid && sender) {
        const cleanReceiver = user.phone.replace(/[^0-9]/g, "");
        const cleanSender = sender.replace(/[^0-9]/g, "");

        const formData = new URLSearchParams();
        formData.append("key", key);
        formData.append("userid", userid);
        formData.append("sender", cleanSender);
        formData.append("receiver", cleanReceiver);
        formData.append("msg", messageContent);
        formData.append("title", "[혜안당 재발송]");

        try {
          const aligoRes = await fetch("https://apis.aligo.in/send/", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: formData.toString()
          });
          const aligoData = await aligoRes.json();
          if (parseInt(aligoData.result_code) === 1) {
            sendSuccess = true;
          }
        } catch (err) {
          console.error("SMS 재발송 알리고 API 오류:", err);
        }
      } else {
        // 환경 변수 부재 시 개발 환경 시뮬레이션용 Mock 발송 성공
        console.log(`[SMS MOCK SEND] Receiver: ${user.phone} | Content: ${messageContent}`);
        sendSuccess = true;
      }
    }

    // 4. 발송 결과 로그를 MessageLog DB 테이블에 완벽히 기록
    await db.messageLog.create({
      data: {
        userId: user.id,
        phone: user.phone,
        msgType: sendType === "email" ? "이메일 보고서 확인 링크 재발송" : "SMS 보고서 확인 링크 재발송",
        content: sendType === "email" ? mailSubject : messageContent,
        status: sendSuccess ? "SUCCESS" : "FAILED",
        isRead: false
      }
    });

    if (sendSuccess) {
      return NextResponse.json({ success: true, message: `${sendType === "email" ? "이메일" : "문자"} 재발송에 성공했습니다.` });
    } else {
      return NextResponse.json({ success: false, error: `${sendType === "email" ? "이메일" : "문자"} 재발송 처리 중 오류가 발생했습니다. 환경설정 및 발송 크레딧을 확인하십시오.` }, { status: 500 });
    }
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
