import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const dataDir = path.join(process.cwd(), "data");
const filePath = path.join(dataDir, "orders.json");

function ensureFile() {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify([
      {
        id: 1004,
        name: "이지혜",
        email: "jihye@example.com",
        phone: "010-1234-5678",
        productName: "평생 종합 사주팔자",
        amount: 30000,
        status: "paid",
        sajuGanji: "己亥年 己巳月 甲子일 (사시)",
        emailStatus: "sent",
        createdAt: "2026-05-23 17:15",
        gender: "female",
        calendar: "solar",
        year: "1995",
        month: "8",
        day: "25",
        hour: "10:00",
        worryText: "이번 가을에 다니던 IT 회사를 퇴사하고 다른 회사 서비스 기획팀으로 이직을 준비하고 있는데 무사히 합격할 수 있을지 고민입니다."
      },
      {
        id: 1003,
        name: "김민우",
        email: "minwoo@test.com",
        phone: "010-9876-5432",
        productName: "재물 & 비즈니스운",
        amount: 20000,
        status: "paid",
        sajuGanji: "庚午년 戊子월 丙寅일 (오시)",
        emailStatus: "sent",
        createdAt: "2026-05-23 16:02",
        gender: "male",
        calendar: "solar",
        year: "1990",
        month: "6",
        day: "15",
        hour: "12:00",
        worryText: "최근에 동업 제안을 받아 쇼핑몰 창업을 계획하고 있는데, 지금 시기에 돈을 대출받아 투자해도 괜찮을지 알고 싶습니다."
      },
      {
        id: 1002,
        name: "박서연",
        email: "seoyeon@example.net",
        phone: "010-5555-4444",
        productName: "신년 운세 / 토정비결",
        amount: 35000,
        status: "paid",
        sajuGanji: "癸酉년 乙丑월 己未일 (묘시)",
        emailStatus: "failed",
        createdAt: "2026-05-23 14:45",
        gender: "female",
        calendar: "solar",
        year: "1993",
        month: "1",
        day: "20",
        hour: "08:30",
        worryText: "올해 유독 회사 일이 안 풀려서 스트레스가 많고 이직 준비를 하려는데 자격증 합격이나 다른 곳으로의 기운이 따를지 조언을 부탁드립니다."
      },
      {
        id: 1001,
        name: "최준혁",
        email: "junhyuk@mail.com",
        phone: "010-8888-9999",
        productName: "심층 종합 운세 리포트",
        amount: 50000,
        status: "failed",
        sajuGanji: "辛未년 壬辰월 癸亥일 (진시)",
        emailStatus: "unsent",
        createdAt: "2026-05-23 11:20",
        gender: "male",
        calendar: "solar",
        year: "1991",
        month: "4",
        day: "12",
        hour: "08:00",
        worryText: "올해 주식 투자로 손실이 좀 크게 났는데, 언제쯤 재물 운이 회복되어 손실을 복구할 수 있을지 알고 싶습니다."
      }
    ], null, 2), "utf8");
  }
}

// GET: 주문 내역 목록 조회 (관리자 전용)
export async function GET(req) {
  try {
    ensureFile();
    const { searchParams } = new URL(req.url);
    const adminPassword = searchParams.get("adminPassword");

    if (adminPassword !== "artpani1234") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const data = fs.readFileSync(filePath, "utf8");
    return NextResponse.json(JSON.parse(data));
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST: 주문 등록 (고객 결제 또는 무료 사주 확인 시)
export async function POST(req) {
  try {
    ensureFile();
    const newOrder = await req.json();
    const data = fs.readFileSync(filePath, "utf8");
    const orders = JSON.parse(data);

    // 주문 번호 중복 방지 및 자동 생성(기존 max ID + 1)
    if (!newOrder.id) {
      const maxId = orders.reduce((max, order) => (order.id > max ? order.id : max), 1000);
      newOrder.id = maxId + 1;
    }

    orders.unshift(newOrder);
    fs.writeFileSync(filePath, JSON.stringify(orders, null, 2), "utf8");

    return NextResponse.json({ success: true, order: newOrder });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// PUT: 주문 데이터 수정 (관리자 전용)
export async function PUT(req) {
  try {
    ensureFile();
    const body = await req.json();
    const { adminPassword, id, ...updatedFields } = body;

    if (adminPassword !== "artpani1234") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const data = fs.readFileSync(filePath, "utf8");
    const orders = JSON.parse(data);

    const updated = orders.map(order => {
      if (order.id === Number(id) || order.id === id) {
        return { ...order, ...updatedFields };
      }
      return order;
    });

    fs.writeFileSync(filePath, JSON.stringify(updated, null, 2), "utf8");
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// DELETE: 주문 삭제 (관리자 전용)
export async function DELETE(req) {
  try {
    ensureFile();
    const { searchParams } = new URL(req.url);
    const adminPassword = searchParams.get("adminPassword");
    const id = searchParams.get("id");

    if (adminPassword !== "artpani1234") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    if (!id) {
      return NextResponse.json({ success: false, error: "ID is required" }, { status: 400 });
    }

    const data = fs.readFileSync(filePath, "utf8");
    const orders = JSON.parse(data);

    const filtered = orders.filter(order => order.id !== Number(id) && order.id !== id);
    fs.writeFileSync(filePath, JSON.stringify(filtered, null, 2), "utf8");

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
