import { NextResponse } from "next/server";
import { db } from "../../../../lib/db";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

const dataDir = path.join(process.cwd(), "data");
const filePath = path.join(dataDir, "inquiries.json");

function getAdminPassword() {
  return process.env.ADMIN_PASSWORD || "";
}

function safeReadJson() {
  try {
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, "utf8");
      const parsed = JSON.parse(data);
      return Array.isArray(parsed) ? parsed : [];
    }
  } catch (e) {
    console.error("[safeReadJson error]:", e.message);
  }
  return [];
}

function safeWriteJson(inquiries) {
  try {
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    const tempPath = `${filePath}.${Date.now()}.tmp`;
    fs.writeFileSync(tempPath, JSON.stringify(inquiries, null, 2), "utf8");
    fs.renameSync(tempPath, filePath);
    return true;
  } catch (e) {
    console.error("[safeWriteJson error]:", e.message);
    try {
      fs.writeFileSync(filePath, JSON.stringify(inquiries, null, 2), "utf8");
      return true;
    } catch (fallbackErr) {
      console.error("[safeWriteJson fallback error]:", fallbackErr.message);
      return false;
    }
  }
}

function normalizeType(type) {
  if (!type) return "기타 문의";
  if (type === "delivery" || type.includes("발송") || type.includes("배송")) return "발송 문의";
  if (type === "general" || type.includes("기타") || type.includes("수정") || type.includes("문의")) return "기타 문의";
  return type;
}

function formatDate(dateVal) {
  if (!dateVal) return "";
  try {
    const d = new Date(dateVal);
    if (isNaN(d.getTime())) return String(dateVal);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    const hh = String(d.getHours()).padStart(2, "0");
    const mm = String(d.getMinutes()).padStart(2, "0");
    return `${y}-${m}-${day} ${hh}:${mm}`;
  } catch {
    return String(dateVal);
  }
}

// GET: 모든 고객 문의 내역 조회 (DB + 파일 이중 통합 및 자가 치유 동기화)
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const adminPassword = searchParams.get("adminPassword") || searchParams.get("password");

    if (!adminPassword || adminPassword !== getAdminPassword()) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    let dbInquiries = [];
    try {
      dbInquiries = await db.inquiry.findMany({
        orderBy: { createdAt: "desc" },
        include: {
          user: {
            include: {
              orders: { orderBy: { createdAt: "desc" }, take: 1 },
              reports: { orderBy: { createdAt: "desc" }, take: 1 }
            }
          }
        }
      });
    } catch (dbErr) {
      console.error("[Admin Inquiries DB query error]:", dbErr.message);
    }

    const fileInquiries = safeReadJson();

    // Map by ID to merge without duplication
    const mergedMap = new Map();
    const dbIdSet = new Set(dbInquiries.map(d => d.id));
    const fileIdSet = new Set(fileInquiries.map(f => f.id));

    // 1. First add file inquiries
    for (const f of fileInquiries) {
      if (!f || !f.id) continue;
      const fName = f.name || "비회원";
      const fPhone = f.phone || "-";
      mergedMap.set(f.id, {
        id: f.id,
        type: normalizeType(f.type),
        createdAt: formatDate(f.createdAt),
        name: fName,
        phone: fPhone,
        userName: fName,
        userPhone: fPhone,
        user: {
          name: fName,
          phone: fPhone
        },
        orderId: f.orderId ? String(f.orderId) : "-",
        content: f.content || "",
        status: (f.status || "pending").toUpperCase() === "ANSWERED" ? "ANSWERED" : "PENDING",
        answer: f.reply || f.answer || ""
      });

      // Self-Healing: 파일에는 있지만 DB에 없는 항목은 DB에 백필 동기화
      if (!dbIdSet.has(f.id) && f.phone && f.name) {
        db.user.upsert({
          where: { phone: f.phone },
          update: { name: f.name },
          create: { name: f.name, phone: f.phone }
        }).then(user => {
          return db.inquiry.upsert({
            where: { id: f.id },
            update: {
              content: f.content || "",
              type: normalizeType(f.type),
              status: (f.status || "pending").toUpperCase() === "ANSWERED" ? "ANSWERED" : "PENDING",
              answer: f.reply || f.answer || null
            },
            create: {
              id: f.id,
              userId: user.id,
              type: normalizeType(f.type),
              content: f.content || "",
              status: (f.status || "pending").toUpperCase() === "ANSWERED" ? "ANSWERED" : "PENDING",
              answer: f.reply || f.answer || null
            }
          });
        }).catch(err => {
          console.error(`[Self-Healing Sync to DB failed for ${f.id}]:`, err.message);
        });
      }
    }

    // 2. Overlay with DB inquiries
    let hasNewFileItems = false;
    for (const d of dbInquiries) {
      if (!d || !d.id) continue;
      const existing = mergedMap.get(d.id);
      const userName = d.user?.name || existing?.user?.name || "비회원";
      const userPhone = d.user?.phone || existing?.user?.phone || "-";
      const orderId = d.user?.orders?.[0]?.applicationNum || existing?.orderId || "-";
      const answer = d.answer || existing?.answer || "";
      const status = (d.status || existing?.status || "PENDING").toUpperCase();

      mergedMap.set(d.id, {
        id: d.id,
        type: normalizeType(d.type || existing?.type),
        createdAt: formatDate(d.createdAt || existing?.createdAt),
        name: userName,
        phone: userPhone,
        userName: userName,
        userPhone: userPhone,
        user: {
          name: userName,
          phone: userPhone
        },
        orderId,
        content: d.content || existing?.content || "",
        status: status === "ANSWERED" ? "ANSWERED" : "PENDING",
        answer
      });

      // Self-Healing: DB에는 있지만 파일에 없는 항목은 파일 목록에 추가
      if (!fileIdSet.has(d.id)) {
        fileInquiries.unshift({
          id: d.id,
          type: normalizeType(d.type),
          name: userName,
          phone: userPhone,
          orderId: orderId !== "-" ? orderId : null,
          content: d.content || "",
          status: status === "ANSWERED" ? "answered" : "pending",
          reply: answer,
          createdAt: formatDate(d.createdAt)
        });
        hasNewFileItems = true;
      }
    }

    if (hasNewFileItems) {
      safeWriteJson(fileInquiries);
    }

    // Sort by createdAt descending
    const result = Array.from(mergedMap.values()).sort((a, b) => {
      const timeA = new Date(a.createdAt).getTime() || 0;
      const timeB = new Date(b.createdAt).getTime() || 0;
      return timeB - timeA;
    });

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST: 문의 등록 또는 관리자 답변 등록/수정
export async function POST(req) {
  try {
    const body = await req.json();
    const adminPassword = body.adminPassword || body.password;
    const { answer, type, content, phone, name } = body;
    const inquiryId = body.inquiryId || body.id;

    // 1. 고객이 직접 신규 문의 등록 시
    if (!adminPassword) {
      if (!phone || !name || !content) {
        return NextResponse.json({ success: false, error: "필수 입력 항목이 누락되었습니다." }, { status: 400 });
      }

      const normalizedType = normalizeType(type);
      const newId = body.id || `inq_${Date.now()}`;

      // 파일 저장 (멱등성)
      const fileInquiries = safeReadJson();
      const existingIdx = fileInquiries.findIndex(i => i.id === newId);
      const newFileItem = {
        id: newId,
        type: normalizedType,
        name,
        phone,
        content,
        status: "pending",
        reply: "",
        createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16)
      };
      if (existingIdx >= 0) {
        fileInquiries[existingIdx] = newFileItem;
      } else {
        fileInquiries.unshift(newFileItem);
      }
      safeWriteJson(fileInquiries);

      // DB 저장 (Upsert)
      let newInquiry = null;
      try {
        const user = await db.user.upsert({
          where: { phone },
          update: { name },
          create: { name, phone }
        });

        newInquiry = await db.inquiry.upsert({
          where: { id: newId },
          update: {
            content,
            type: normalizedType,
            status: "PENDING"
          },
          create: {
            id: newId,
            userId: user.id,
            type: normalizedType,
            content,
            status: "PENDING"
          }
        });
      } catch (dbErr) {
        console.error("[Inquiry DB create error]:", dbErr.message);
      }

      return NextResponse.json({ success: true, inquiry: newInquiry || { id: newId } });
    }

    // 2. 관리자가 답변 작성/수정 시
    if (adminPassword !== getAdminPassword()) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    if (!inquiryId || answer === undefined) {
      return NextResponse.json({ success: false, error: "Inquiry ID and Answer content are required" }, { status: 400 });
    }

    // 파일 내 답변 동기화
    const fileInquiries = safeReadJson();
    let foundInFile = false;
    const updatedFileInquiries = fileInquiries.map(inq => {
      if (inq.id === inquiryId) {
        foundInFile = true;
        return {
          ...inq,
          reply: answer,
          answer,
          status: "answered",
          repliedAt: new Date().toISOString().replace('T', ' ').substring(0, 16)
        };
      }
      return inq;
    });

    if (foundInFile) {
      safeWriteJson(updatedFileInquiries);
    }

    // DB 내 답변 동기화
    let updatedInquiry = null;
    try {
      updatedInquiry = await db.inquiry.update({
        where: { id: inquiryId },
        data: {
          answer,
          status: "ANSWERED"
        }
      });
    } catch (dbErr) {
      console.error("[Admin Inquiry DB answer error]:", dbErr.message);
    }

    // 파일에 없는데 DB에만 있는 경우 파일에도 추가
    if (!foundInFile && updatedInquiry) {
      fileInquiries.unshift({
        id: updatedInquiry.id,
        type: normalizeType(updatedInquiry.type),
        name: "고객",
        phone: "-",
        content: updatedInquiry.content || "",
        status: "answered",
        reply: answer,
        answer,
        createdAt: formatDate(updatedInquiry.createdAt),
        repliedAt: new Date().toISOString().replace('T', ' ').substring(0, 16)
      });
      safeWriteJson(fileInquiries);
    }

    return NextResponse.json({ success: true, inquiry: updatedInquiry || { id: inquiryId, answer, status: "ANSWERED" } });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// DELETE: 문의글 삭제 (관리자 전용, 파일 및 DB 동시 삭제)
export async function DELETE(req) {
  try {
    const { searchParams } = new URL(req.url);
    const adminPassword = searchParams.get("adminPassword") || searchParams.get("password");
    const id = searchParams.get("id") || searchParams.get("inquiryId");

    if (!adminPassword || adminPassword !== getAdminPassword()) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    if (!id) {
      return NextResponse.json({ success: false, error: "ID is required" }, { status: 400 });
    }

    // 파일에서 삭제
    const fileInquiries = safeReadJson();
    const filtered = fileInquiries.filter(inq => inq.id !== id);
    safeWriteJson(filtered);

    // DB에서 삭제
    try {
      await db.inquiry.delete({
        where: { id }
      });
    } catch (dbErr) {
      console.error("[Inquiry delete DB error]:", dbErr.message);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
