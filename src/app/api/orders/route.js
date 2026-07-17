import { NextResponse } from "next/server";
import { db } from "../../../lib/db";

export const dynamic = "force-dynamic";

// GET: 주문 내역 목록 조회 (관리자 전용 및 개별 고객 조회)
// Mock simulation fallback orders to ensure graphs & tables render beautifully even under DB connection delay
const fallbackOrdersList = [
  {
    id: "SIM_0710",
    name: "홍길동",
    phone: "010-1234-5678",
    email: "hong@naver.com",
    productName: "평생 종합사주 (고급리포트)",
    amount: 30000,
    status: "paid",
    createdAt: "2026-07-10 14:25:00",
    sajuGanji: "1990년 5월 12일 (사시)",
    gender: "male",
    calendar: "solar",
    year: "1990",
    month: "5",
    day: "12",
    hour: "사시",
    worryText: "이직운이 궁금합니다.",
    history: []
  },
  {
    id: "SIM_0711",
    name: "이영희",
    phone: "010-9876-5432",
    email: "lee@daum.net",
    productName: "신년운세 (심화리포트)",
    amount: 25000,
    status: "paid",
    createdAt: "2026-07-11 11:30:00",
    sajuGanji: "1993년 8월 22일 (진시)",
    gender: "female",
    calendar: "lunar",
    year: "1993",
    month: "8",
    day: "22",
    hour: "진시",
    worryText: "올해 결혼을 할 수 있을까요?",
    history: []
  },
  {
    id: "SIM_0712",
    name: "김철수",
    phone: "010-5555-6666",
    email: "kim@gmail.com",
    productName: "토종비결 (문자요약)",
    amount: 20000,
    status: "paid",
    createdAt: "2026-07-12 16:40:00",
    sajuGanji: "1988년 12월 5일 (오시)",
    gender: "male",
    calendar: "solar",
    year: "1988",
    month: "12",
    day: "5",
    hour: "오시",
    worryText: "비즈니스 재물운 조율 원합니다.",
    history: []
  },
  {
    id: "SIM_0713",
    name: "박민수",
    phone: "010-7777-8888",
    email: "park@gmail.com",
    productName: "토종비결 (고급리포트)",
    amount: 20000,
    status: "paid",
    createdAt: "2026-07-12 18:15:00",
    sajuGanji: "1995년 3월 17일 (해시)",
    gender: "male",
    calendar: "solar",
    year: "1995",
    month: "3",
    day: "17",
    hour: "해시",
    worryText: "시험 합격운 문의",
    history: []
  },
  {
    id: "SIM_0714",
    name: "최성진",
    phone: "010-1111-2222",
    email: "choi@nate.com",
    productName: "재물&비즈니스운 (단일등급)",
    amount: 20000,
    status: "paid",
    createdAt: "2026-07-13 10:05:00",
    sajuGanji: "1991년 10월 30일 (자시)",
    gender: "male",
    calendar: "solar",
    year: "1991",
    month: "10",
    day: "30",
    hour: "자시",
    worryText: "이사를 가도 될까요?",
    history: []
  },
  {
    id: "SIM_0715",
    name: "한예슬",
    phone: "010-3333-4444",
    email: "han@naver.com",
    productName: "타로상담 (온라인 단일)",
    amount: 15000,
    status: "pending",
    createdAt: "2026-07-14 09:20:00",
    sajuGanji: "1994년 6월 25일 (묘시)",
    gender: "female",
    calendar: "solar",
    year: "1994",
    month: "6",
    day: "25",
    hour: "묘시",
    worryText: "연애운과 연인 궁합",
    history: []
  },
  {
    id: "SIM_0716",
    name: "유재석",
    phone: "010-2222-3333",
    email: "yu@daum.net",
    productName: "연인궁합 (종합 궁합)",
    amount: 30000,
    status: "paid",
    createdAt: "2026-07-15 15:50:00",
    sajuGanji: "1972년 8월 14일 (유시)",
    gender: "male",
    calendar: "solar",
    year: "1972",
    month: "8",
    day: "14",
    hour: "유시",
    worryText: "사업 확장 시기 조율",
    history: []
  },
  {
    id: "SIM_0717",
    name: "강호동",
    phone: "010-8888-9999",
    email: "kang@naver.com",
    productName: "연인궁합 (밀착궁합)",
    amount: 30000,
    status: "paid",
    createdAt: "2026-07-15 17:10:00",
    sajuGanji: "1970년 6월 11일 (축시)",
    gender: "male",
    calendar: "solar",
    year: "1970",
    month: "6",
    day: "11",
    hour: "축시",
    worryText: "건강운 및 사주 전반",
    history: []
  },
  {
    id: "SIM_0718",
    name: "송혜교",
    phone: "010-4444-5555",
    email: "song@naver.com",
    productName: "평생 종합사주 (심화리포트)",
    amount: 30000,
    status: "paid",
    createdAt: "2026-07-16 11:00:00",
    sajuGanji: "1981년 11-22 (인시)",
    gender: "female",
    calendar: "solar",
    year: "1981",
    month: "11",
    day: "22",
    hour: "인시",
    worryText: "올해 신년운세 종합",
    history: [
      { changedAt: "2026-07-16 11:30", managerName: "김관리자", detail: "출생시간 변경 (14:00 -> 10:15)", reason: "고객 전화 요청" }
    ]
  },
  {
    id: "SIM_0719",
    name: "현빈",
    phone: "010-9999-0000",
    email: "hyun@gmail.com",
    productName: "신년운세 (고급리포트)",
    amount: 25000,
    status: "paid",
    createdAt: "2026-07-16 13:40:00",
    sajuGanji: "1982년 9월 25일 (신시)",
    gender: "male",
    calendar: "solar",
    year: "1982",
    month: "9",
    day: "25",
    hour: "신시",
    worryText: "종합사주 리포트 문의",
    history: []
  }
];

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const adminPassword = searchParams.get("adminPassword");
    
    // If admin check passes, we can safely return the mock fallback list to guarantee client rendering!
    // Commented out to fetch real SQLite/MySQL DB orders instead of simulated mock data.
    // if (adminPassword === "artpani1234") {
    //   return NextResponse.json(fallbackOrdersList);
    // }
    
    const queryPhone = searchParams.get("phone");
    const queryName = searchParams.get("name");


    // 1. 개별 고객 조회 모드 (비밀번호 불필요 - 자신의 폰번호와 이름으로 매치되는 결제 상태만 조회)
    if (queryPhone && queryName) {
      const user = await db.user.findUnique({
        where: { phone: queryPhone },
        include: {
          orders: {
            orderBy: { createdAt: "desc" },
            take: 1
          },
          reports: {
            orderBy: { createdAt: "desc" },
            take: 1
          }
        }
      });

      if (!user || user.name !== queryName) {
        return NextResponse.json([]); // 매칭되는 유저가 없거나 이름 불일치 시 빈 배열 반환 (보안성 확보)
      }

      const latestOrder = user.orders[0] || null;
      const latestReport = user.reports[0] || null;

      // 해당 고객 본인의 1개 데이터만 포맷에 맞춰 리턴
      return NextResponse.json([{
        id: latestOrder?.id || "none",
        name: user.name,
        phone: user.phone,
        email: user.email || "",
        amount: latestOrder?.amount || 0,
        status: latestOrder ? latestOrder.status.toLowerCase() : "pending",
        unlocked: latestReport ? latestReport.unlocked : false,
        createdAt: latestOrder ? latestOrder.createdAt.toISOString() : new Date().toISOString()
      }]);
    }

    // 2. 전체 주문 관리자 조회 모드 (보안 비밀번호 필수)
    if (adminPassword !== "artpani1234") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    // DB에서 모든 주문 데이터 조회 (유저 및 유저의 사주 레코드 포함, SajuReportHistory 포함)
    const dbOrders = await db.order.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          include: {
            reports: {
              orderBy: { createdAt: "desc" },
              take: 1,
              include: {
                histories: {
                  orderBy: { changedAt: "desc" }
                }
              }
            }
          }
        }
      }
    });

    // 기존 JSON 파일 포맷과 호환되도록 가공
    const formattedOrders = dbOrders.map(order => {
      const user = order.user;
      const latestReport = user?.reports?.[0] || null;

      const formattedDate = order.createdAt.toISOString().slice(0, 19).replace('T', ' ');

      return {
        id: order.id,
        name: user?.name || "알 수 없음",
        email: user?.email || "",
        phone: user?.phone || "",
        productName: "평생 종합 사주팔자 보감",
        amount: order.amount,
        status: order.status.toLowerCase(), // paid, pending 등
        sajuGanji: latestReport ? `${latestReport.birthYear}년 ${latestReport.birthMonth}월 ${latestReport.birthDay}일 (${latestReport.birthHour || "미정"})` : "기록 없음",
        emailStatus: "sent",
        createdAt: formattedDate,
        gender: user?.gender || "female",
        calendar: user?.calendarType || "solar",
        year: String(user?.birthYear || ""),
        month: String(user?.birthMonth || ""),
        day: String(user?.birthDay || ""),
        hour: user?.birthHour || "",
        worryText: user?.worryText || "",
        referer: order.referer || "direct",
        histories: latestReport?.histories || []
      };
    });

    return NextResponse.json(formattedOrders);
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST: 주문 등록 (고객 결제 또는 무료 사주 확인 시)
export async function POST(req) {
  try {
    const newOrderData = await req.json();
    const { name, email, phone, amount, status, gender, calendar, year, month, day, hour, worryText, referer } = newOrderData;

    if (!phone || !name) {
      return NextResponse.json({ success: false, error: "이름과 연락처는 필수 입력입니다." }, { status: 400 });
    }

    // 트랜잭션으로 유저 생성/조회, 리포트 생성, 주문 생성 처리
    const result = await db.$transaction(async (tx) => {
      const user = await tx.user.upsert({
        where: { phone },
        update: { name, email },
        create: { name, email, phone }
      });

      const unlockedState = status === "paid" || status === "PAID";
      const report = await tx.sajuReport.create({
        data: {
          userId: user.id,
          gender: gender || "female",
          calendarType: calendar || "solar",
          birthYear: Number(year) || 1995,
          birthMonth: Number(month) || 1,
          birthDay: Number(day) || 1,
          birthHour: hour || null,
          worryCategory: "진로",
          worryText: worryText || "",
          unlocked: unlockedState
        }
      });

      const order = await tx.order.create({
        data: {
          userId: user.id,
          amount: Number(amount) || 0,
          status: status ? status.toUpperCase() : "PENDING",
          referer: referer || "direct"
        }
      });

      return { user, report, order };
    });

    return NextResponse.json({ 
      success: true, 
      order: {
        id: result.order.id,
        name: result.user.name,
        email: result.user.email,
        phone: result.user.phone,
        amount: result.order.amount,
        status: result.order.status.toLowerCase(),
        referer: result.order.referer || "direct",
        gender: result.report.gender,
        calendar: result.report.calendarType,
        year: String(result.report.birthYear),
        month: String(result.report.birthMonth),
        day: String(result.report.birthDay),
        hour: result.report.birthHour,
        worryText: result.report.worryText
      } 
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// PUT: 주문 데이터 수정 (관리자 전용)
export async function PUT(req) {
  try {
    const body = await req.json();
    const { adminPassword, id, status, ...updatedFields } = body;

    if (adminPassword !== "artpani1234") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    if (!id) {
      return NextResponse.json({ success: false, error: "Order ID is required" }, { status: 400 });
    }

    await db.$transaction(async (tx) => {
      const order = await tx.order.update({
        where: { id },
        data: {
          status: status ? status.toUpperCase() : undefined
        }
      });

      if (status === "paid" || status === "PAID") {
        await tx.sajuReport.updateMany({
          where: { userId: order.userId },
          data: { unlocked: true }
        });
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// DELETE: 주문 삭제 (관리자 전용)
export async function DELETE(req) {
  try {
    const { searchParams } = new URL(req.url);
    const adminPassword = searchParams.get("adminPassword");
    const id = searchParams.get("id");

    if (adminPassword !== "artpani1234") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    if (!id) {
      return NextResponse.json({ success: false, error: "Order ID is required" }, { status: 400 });
    }

    await db.order.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
