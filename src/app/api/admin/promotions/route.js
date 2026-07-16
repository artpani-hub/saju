import { NextResponse } from "next/server";
import { db } from "../../../../lib/db";

export const dynamic = "force-dynamic";

// GET: 프로모션 쿠폰 목록 조회
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const adminPassword = searchParams.get("adminPassword");

    if (adminPassword !== "artpani1234") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const promotions = await db.promotion.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        uses: {
          include: { user: true }
        }
      }
    });

    return NextResponse.json(promotions);
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST: 신규 프로모션 쿠폰 생성
export async function POST(req) {
  try {
    const body = await req.json();
    const { adminPassword, code, type, value, maxUses, expiryDate } = body;

    if (adminPassword !== "artpani1234") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    if (!code || !type || value === undefined) {
      return NextResponse.json({ success: false, error: "필수 항목(코드명, 쿠폰유형, 수치)이 누락되었습니다." }, { status: 400 });
    }

    const newPromotion = await db.promotion.create({
      data: {
        code,
        type,
        value: Number(value),
        maxUses: maxUses ? Number(maxUses) : 1,
        expiryDate: expiryDate ? new Date(expiryDate) : null,
        isActive: true
      }
    });

    return NextResponse.json({ success: true, promotion: newPromotion });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
