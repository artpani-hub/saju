import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(request) {
  try {
    const body = await request.json();
    const { to, subject, html, text } = body;

    if (!to || (!html && !text)) {
      return NextResponse.json(
        { success: false, message: "수신자(to)와 메일 내용(html 또는 text)은 필수 입력 사항입니다." },
        { status: 400 }
      );
    }

    const naverUser = process.env.NAVER_USER || "saju2026kr@naver.com";
    const naverPass = process.env.NAVER_APP_PASS || "5RRK1PFWC56H"; 

    const transporter = nodemailer.createTransport({
      host: "smtp.naver.com",
      port: 465,
      secure: true, // SSL
      auth: {
        user: naverUser,
        pass: naverPass,
      },
      tls: {
        rejectUnauthorized: false
      }
    });

    const mailOptions = {
      from: `"혜안당 명리연구소" <${naverUser}>`,
      to: to,
      subject: subject || "[혜안당] 분석 보고서가 도착했습니다.",
      text: text,
      html: html,
    };

    // SMTP 발송 실행
    try {
      await transporter.sendMail(mailOptions);
      return NextResponse.json({
        success: true,
        message: "이메일 발송에 성공했습니다.",
      });
    } catch (sendError) {
      console.error("네이버 SMTP 발송 에러 발생 (소프트 성공 응답 반환):", sendError);
      return NextResponse.json({
        success: false,
        message: `메일 서버 오류: ${sendError.message}. 관리자 페이지에서 재발송을 시도해주십시오.`
      });
    }

  } catch (error) {
    console.error("이메일 API 내부 오류:", error);
    return NextResponse.json(
      { success: false, message: error.message || "서버 내부 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
