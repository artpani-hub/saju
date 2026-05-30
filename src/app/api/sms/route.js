import { NextResponse } from "next/server";

// 테스트 중 실제 문자 발송 여부 제어 (true: 실제 발송 안 함 / false: 실제 발송)
const IS_TEST_MODE = true;

export async function POST(request) {
  try {
    const body = await request.json();
    const { receiver, msg, title } = body;

    if (!receiver || !msg) {
      return NextResponse.json(
        { success: false, message: "수신번호(receiver)와 메시지(msg)는 필수 입력 사항입니다." },
        { status: 400 }
      );
    }

    // 테스트 모드일 때는 실제 Aligo API를 호출하지 않고 가상 성공 처리
    if (IS_TEST_MODE) {
      console.log(`[SMS MOCK] 실제 발송 차단 (테스트 중) | 수신번호: ${receiver} | 내용: ${msg.slice(0, 50)}...`);
      return NextResponse.json({
        success: true,
        message: "테스트 중이므로 실제 문자는 발송되지 않고 성공 처리되었습니다. (Mocking)",
        data: { result_code: "1", message: "테스트 모드 가상 성공" },
      });
    }

    const key = process.env.ALIGO_KEY;
    const userid = process.env.ALIGO_USER_ID;
    const sender = process.env.ALIGO_SENDER;

    if (!key || !userid || !sender) {
      return NextResponse.json(
        { success: false, message: "서버의 알리고 설정(환경 변수)이 누락되었습니다." },
        { status: 500 }
      );
    }

    const cleanReceiver = receiver.replace(/[^0-9]/g, "");
    const cleanSender = sender.replace(/[^0-9]/g, "");

    const formData = new URLSearchParams();
    formData.append("key", key);
    formData.append("userid", userid);
    formData.append("sender", cleanSender);
    formData.append("receiver", cleanReceiver);
    formData.append("msg", msg);
    
    if (title) {
      formData.append("title", title);
    } else {
      formData.append("title", "[혜안당]");
    }
    
    // testmode_yn을 비활성화하여 실제 전송 모드로 전환
    // formData.append("testmode_yn", "Y");

    const response = await fetch("https://apis.aligo.in/send/", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: formData.toString(),
    });

    if (!response.ok) {
      throw new Error(`Aligo API HTTP error: ${response.status}`);
    }

    const data = await response.json();
    
    if (parseInt(data.result_code) === 1) {
      return NextResponse.json({
        success: true,
        message: "문자 발송에 성공했습니다.",
        data: data,
      });
    } else {
      console.error("알리고 발송 실패 응답 데이터:", data);
      return NextResponse.json({
        success: false,
        message: data.message || "알리고 발송 오류가 발생했습니다.",
        data: data,
      }, { status: 400 });
    }

  } catch (error) {
    console.error("SMS 전송 오류:", error);
    return NextResponse.json(
      { success: false, message: error.message || "서버 내부 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
