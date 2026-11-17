import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { db } from "../../../lib/db";

export const dynamic = "force-dynamic";

const dataDir = path.join(process.cwd(), "data");
const filePath = path.join(dataDir, "inquiries.json");

function getAdminPassword() {
  return process.env.ADMIN_PASSWORD || "";
}

function ensureFile() {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify([
      {
        id: "inq_171928372619",
        type: "발송 문의",
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

function safeReadJson() {
  ensureFile();
  try {
    const data = fs.readFileSync(filePath, "utf8");
    const parsed = JSON.parse(data);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.error("[safeReadJson error]:", e.message);
    return [];
  }
}

function safeWriteJson(data) {
  ensureFile();
  try {
    const tempPath = `${filePath}.${Date.now()}.tmp`;
    fs.writeFileSync(tempPath, JSON.stringify(data, null, 2), "utf8");
    fs.renameSync(tempPath, filePath);
    return true;
  } catch (e) {
    console.error("[safeWriteJson error]:", e.message);
    try {
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf8");
      return true;
    } catch (fallbackErr) {
      console.error("[safeWriteJson fallback error]:", fallbackErr.message);
      return false;
    }
  }
}

// GET: Q&A 목록 조회 (관리자 또는 일반 유저)
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const adminPassword = searchParams.get("adminPassword");
    const phone = searchParams.get("phone");
    const password = searchParams.get("password");

    const inquiries = safeReadJson();

    // 1. 관리자 조회 (비밀번호 일치 확인)
    if (adminPassword && adminPassword === getAdminPassword()) {
      return NextResponse.json(inquiries);
    }

    // 2. 일반 사용자 본인 문의 조회
    if (phone && password) {
      const cleanInputPhone = phone.replace(/[^0-9]/g, "");
      const filtered = inquiries.filter(inq => {
        if (!inq || !inq.phone) return false;
        const inqPhone = inq.phone.replace(/[^0-9]/g, "");
        return inqPhone === cleanInputPhone && String(inq.password) === String(password);
      });
      return NextResponse.json(filtered);
    }

    // 3. 권한 없음
    return NextResponse.json([], { status: 401 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST: 신규 문의 작성 (파일 및 DB 동시 저장 + 멱등성 보장)
export async function POST(req) {
  try {
    const body = await req.json();
    const inquiries = safeReadJson();

    // 타입 통일화 (delivery -> 발송 문의, general -> 기타 문의)
    const normalizedType = body.type === "delivery" ? "발송 문의" : body.type === "general" ? "기타 문의" : (body.type || "기타 문의");
    const inquiryId = body.id || `inq_${Date.now()}`;
    const inquiryItem = {
      ...body,
      id: inquiryId,
      type: normalizedType,
      status: body.status || "pending",
      createdAt: body.createdAt || new Date().toISOString().replace('T', ' ').substring(0, 16)
    };

    // 파일 중복 방지 (기존 동일 ID 존재 시 업데이트, 없으면 추가)
    const existsIndex = inquiries.findIndex(i => i.id === inquiryItem.id);
    if (existsIndex >= 0) {
      inquiries[existsIndex] = inquiryItem;
    } else {
      inquiries.unshift(inquiryItem);
    }
    safeWriteJson(inquiries);

    // DB 동기화 저장 시도 (Upsert 기반 중복 방지 및 원자성 확보)
    try {
      if (body.phone && body.name) {
        const user = await db.user.upsert({
          where: { phone: body.phone },
          update: { name: body.name },
          create: { name: body.name, phone: body.phone }
        });

        await db.inquiry.upsert({
          where: { id: inquiryId },
          update: {
            content: body.content,
            type: normalizedType,
            status: "PENDING"
          },
          create: {
            id: inquiryId,
            userId: user.id,
            type: normalizedType,
            content: body.content,
            status: "PENDING"
          }
        });
      }
    } catch (dbErr) {
      console.error("[Inquiry DB Sync Error]:", dbErr.message);
    }

    return NextResponse.json({ success: true, inquiry: inquiryItem });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// PUT: 답변 등록 및 수정 (관리자 전용, 파일 및 DB 동시 갱신)
export async function PUT(req) {
  try {
    const { adminPassword, id, reply, status, repliedAt } = await req.json();
    
    if (!adminPassword || adminPassword !== getAdminPassword()) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const inquiries = safeReadJson();
    const updated = inquiries.map(inq => {
      if (inq.id === id) {
        return { ...inq, reply, status: status || "answered", repliedAt };
      }
      return inq;
    });
    safeWriteJson(updated);

    // DB 동기화 업데이트 시도
    try {
      await db.inquiry.update({
        where: { id },
        data: {
          answer: reply,
          status: "ANSWERED"
        }
      });
    } catch (dbErr) {
      console.error("[Inquiry DB Update Error]:", dbErr.message);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// DELETE: 문의글 삭제 (관리자 전용, 파일 및 DB 동시 삭제)
export async function DELETE(req) {
  try {
    const { searchParams } = new URL(req.url);
    const adminPassword = searchParams.get("adminPassword");
    const id = searchParams.get("id");

    if (!adminPassword || adminPassword !== getAdminPassword()) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    if (!id) {
      return NextResponse.json({ success: false, error: "ID is required" }, { status: 400 });
    }

    const inquiries = safeReadJson();
    const filtered = inquiries.filter(inq => inq.id !== id);
    safeWriteJson(filtered);

    // DB 동기화 삭제 시도
    try {
      await db.inquiry.delete({
        where: { id }
      });
    } catch (dbErr) {
      console.error("[Inquiry DB Delete Error]:", dbErr.message);
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
