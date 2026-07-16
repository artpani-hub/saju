import { NextResponse } from "next/server";
import { db } from "../../../../lib/db";

export const dynamic = "force-dynamic";

// GET: 모든 고객 문의 내역 조회 (유저 및 최신 주문, 리포트 내역 포함하여 이중 연계)
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const adminPassword = searchParams.get("adminPassword");

    if (adminPassword !== "artpani1234") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const inquiries = await db.inquiry.findMany({
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

    return NextResponse.json(inquiries);
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST: 문의 등록 또는 관리자 답변 등록/수정
export async function POST(req) {
  try {
    const body = await req.json();
    const { adminPassword, inquiryId, answer, type, content, phone, name } = body;

    // 1. 고객이 직접 신규 문의 등록 시 (이름, 폰번호로 유저 매칭 혹은 신규 생성하여 문의 등록)
    if (!adminPassword) {
      if (!phone || !name || !content || !type) {
        return NextResponse.json({ success: false, error: "필수 입력 항목이 누락되었습니다." }, { status: 400 });
      }

      const result = await db.$transaction(async (tx) => {
        const user = await tx.user.upsert({
          where: { phone },
          update: { name },
          create: { name, phone }
        });

        const newInquiry = await tx.inquiry.create({
          data: {
            userId: user.id,
            type,
            content,
            status: "PENDING"
          }
        });

        return newInquiry;
      });

      return NextResponse.json({ success: true, inquiry: result });
    }

    // 2. 관리자가 답변 작성/수정 시
    if (adminPassword !== "artpani1234") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    if (!inquiryId || !answer) {
      return NextResponse.json({ success: false, error: "Inquiry ID and Answer content are required" }, { status: 400 });
    }

    const updatedInquiry = await db.inquiry.update({
      where: { id: inquiryId },
      data: {
        answer,
        status: "ANSWERED"
      }
    });

    return NextResponse.json({ success: true, inquiry: updatedInquiry });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
