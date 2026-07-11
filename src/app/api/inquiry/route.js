import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const dataDir = path.join(process.cwd(), "data");
const filePath = path.join(dataDir, "inquiries.json");

function ensureFile() {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify([
      {
        id: "inq_171928372619",
        type: "delivery",
        name: "이지혜",
        phone: "010-1234-5678",
        orderId: 1004,
        content: "결제를 완료했는데 메일과 문자가 모두 오지 않습니다. 확인 부탁드립니다.",
        password: "1234",
        status: "pending",
        reply: "",
        createdAt: "2026-06-29 11:35"
      }
    ], null, 2), "utf8");
  }
}

// GET: Q&A 목록 조회 (관리자 또는 일반 유저)
export async function GET(req) {
  try {
    ensureFile();
    const { searchParams } = new URL(req.url);
    const adminPassword = searchParams.get("adminPassword");
    const phone = searchParams.get("phone");
    const password = searchParams.get("password");

    const data = fs.readFileSync(filePath, "utf8");
    const inquiries = JSON.parse(data);

    // 1. 관리자 조회 (비밀번호 일치 확인)
    if (adminPassword === "artpani1234") {
      return NextResponse.json(inquiries);
    }

    // 2. 일반 사용자 본인 문의 조회
    if (phone && password) {
      const cleanInputPhone = phone.replace(/[^0-9]/g, "");
      const filtered = inquiries.filter(inq => {
        if (!inq) return false;
        const inqPhone = inq.phone.replace(/[^0-9]/g, "");
        return inqPhone === cleanInputPhone && inq.password === password;
      });
      return NextResponse.json(filtered);
    }

    // 3. 권한 없음
    return NextResponse.json([], { status: 401 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST: 신규 문의 작성
export async function POST(req) {
  try {
    ensureFile();
    const body = await req.json();
    const data = fs.readFileSync(filePath, "utf8");
    const inquiries = JSON.parse(data);

    inquiries.unshift(body);
    fs.writeFileSync(filePath, JSON.stringify(inquiries, null, 2), "utf8");

    return NextResponse.json({ success: true, inquiry: body });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// PUT: 답변 등록 및 수정 (관리자 전용)
export async function PUT(req) {
  try {
    ensureFile();
    const { adminPassword, id, reply, status, repliedAt } = await req.json();
    
    if (adminPassword !== "artpani1234") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const data = fs.readFileSync(filePath, "utf8");
    const inquiries = JSON.parse(data);

    const updated = inquiries.map(inq => {
      if (inq.id === id) {
        return { ...inq, reply, status, repliedAt };
      }
      return inq;
    });

    fs.writeFileSync(filePath, JSON.stringify(updated, null, 2), "utf8");
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// DELETE: 문의글 삭제 (관리자 전용)
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
    const inquiries = JSON.parse(data);

    const filtered = inquiries.filter(inq => inq.id !== id);
    fs.writeFileSync(filePath, JSON.stringify(filtered, null, 2), "utf8");
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
