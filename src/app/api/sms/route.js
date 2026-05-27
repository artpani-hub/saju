import { NextResponse } from "next/server";

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

    // ========================================================
    // [로컬 테스트를 위한 임시 Mocking 처리]
    // 알리고 발신번호 승인 대기 중 오류 우회를 위해 가상으로 성공 응답을 내립니다.
    // ========================================================
    console.log("=========================================");
    console.log("[MOCK SMS 발송 시뮬레이션]");
    console.log(`수신번호: ${receiver}`);
    console.log(`메시지 제목: ${title || "[혜안당]"}`);
    console.log(`메시지 본문: \n${msg}`);
    console.log("=========================================");

    return NextResponse.json({
      success: true,
      message: "문자 발송에 성공했습니다. (로컬 임시 시뮬레이션 성공)",
      data: {
        result_code: "1",
        message: "success"
      },
    });

    /* ---- 추후 알리고 발신번호 승인 완료 후 아래 주석을 풀고 위 Mock 코드를 지우세요 ----
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
    
    formData.append("testmode_yn", "Y");

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
    ---------------------------------------------------------------------------------- */

  } catch (error) {
    console.error("SMS 전송 오류:", error);
    return NextResponse.json(
      { success: false, message: error.message || "서버 내부 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
