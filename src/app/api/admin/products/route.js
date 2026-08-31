import { NextResponse } from "next/server";
import { db } from "../../../../lib/db";

export const dynamic = "force-dynamic";

// GET: 관리자용 상품 목록 전체 조회
export async function GET() {
  try {
    let products = await db.product.findMany({
      orderBy: { displayOrder: "asc" },
    });

    return NextResponse.json({ success: true, products });
  } catch (error) {
    console.error("GET admin products error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// PUT: 상품 정보 동적 저장 (Prisma Null constraint 방지용 기본값 채움)
export async function PUT(req) {
  try {
    const body = await req.json();
    const { id, key, price, originalPrice, name, tag, badge, isSale, description, reportType } = body;

    const itemKey = key || id;
    if (!itemKey && !id) {
      return NextResponse.json({ success: false, error: "상품 식별자가 필요합니다." }, { status: 400 });
    }

    const priceNum = parseInt(price, 10);
    const validPrice = isNaN(priceNum) || priceNum < 0 ? 0 : priceNum;

    const origPriceNum = originalPrice !== undefined && originalPrice !== null && originalPrice !== "" 
      ? parseInt(originalPrice, 10) 
      : (validPrice > 0 ? validPrice * 10 : 15000);

    const updateData = {
      price: validPrice,
    };

    if (name) updateData.name = name;

    const targetType = reportType || (itemKey === "free_sample" ? "free" : itemKey);

    let updatedProduct = null;

    // 1. Try finding by id first
    if (id) {
      const existingById = await db.product.findUnique({ where: { id } }).catch(() => null);
      if (existingById) {
        updatedProduct = await db.product.update({
          where: { id },
          data: updateData
        });
      }
    }

    // 2. Try finding by reportType or key
    if (!updatedProduct) {
      const existingByType = await db.product.findFirst({
        where: {
          OR: [
            { key: itemKey },
            { reportType: targetType },
            { reportType: itemKey },
            { reportType: itemKey === "free_sample" ? "free" : itemKey }
          ]
        }
      }).catch(() => null);

      if (existingByType) {
        updatedProduct = await db.product.update({
          where: { id: existingByType.id },
          data: updateData
        });
      }
    }

    // 3. Fallback create if not exists
    if (!updatedProduct) {
      updatedProduct = await db.product.create({
        data: {
          key: itemKey || "free_sample",
          name: name || "사주 체험판 리포트",
          reportType: targetType,
          price: validPrice,
          pageCount: 7,
          toc: "{}",
          requiredInputs: "{}",
          estimatedTime: "즉시 생성",
          displayOrder: 1,
        }
      });
    }

    return NextResponse.json({ success: true, product: updatedProduct });
  } catch (error) {
    console.error("PUT admin products error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
