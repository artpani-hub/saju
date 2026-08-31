import { NextResponse } from "next/server";
import { db } from "../../../lib/db";

export const dynamic = "force-dynamic";

// GET: 일반 사용자 및 신청 페이지용 상품 목록 조회
export async function GET() {
  try {
    const products = await db.product.findMany({
      orderBy: { displayOrder: "asc" },
    });

    return NextResponse.json({ success: true, products });
  } catch (error) {
    console.error("GET public products error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
