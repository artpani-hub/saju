import { NextResponse } from "next/server";
import { db } from "../../../../lib/db";

export const dynamic = "force-dynamic";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const adminPassword = searchParams.get("adminPassword");

    if (adminPassword !== "artpani1234") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    // Direct mock fallback return to ensure local simulation works 100% flawlessly under DB connection delay
    // Commented out to fetch real SQLite/MySQL DB statistics
    // return NextResponse.json({
    //   success: true,
    //   stats: {
    //     todayUsers: 10,
    //     todayPaid: 9,
    //     reportSuccess: 8,
    //     reportFailed: 1,
    //     pendingPayments: 1,
    //     refundRequests: 0,
    //     pendingInquiries: 0,
    //     todaySales: 230000,
    //     monthSales: 680000,
    //     statusSummary: {
    //       INPUT_COMPLETED: 1,
    //       WAITING_PAYMENT: 1,
    //       PAID: 3,
    //       ANALYZING: 2,
    //       COMPLETED: 2,
    //       DELIVERED: 1
    //     }
    //   }
    // });

    // KST(한국 표준시) 기준으로 오늘 시작 및 이번 달 시작 시각을 계산하여 UTC DB 쿼리에 최적화
    const nowKst = new Date(new Date().getTime() + (9 * 60 * 60 * 1000));
    
    const startOfTodayKst = new Date(nowKst.getFullYear(), nowKst.getMonth(), nowKst.getDate());
    const startOfToday = new Date(startOfTodayKst.getTime() - (9 * 60 * 60 * 1000));

    const startOfMonthKst = new Date(nowKst.getFullYear(), nowKst.getMonth(), 1);
    const startOfMonth = new Date(startOfMonthKst.getTime() - (9 * 60 * 60 * 1000));

    // 1. 오늘 신청 건수 (전체 Order 주문 수로 변경하여 주문관리 탭의 오늘 검색 수량과 일치시킴)
    const todayUsersCount = await db.order.count({
      where: {
        createdAt: { gte: startOfToday }
      }
    });

    // 2. 결제 완료 건수 (오늘 PAID 유료 주문 수, 무료 FREE 제외, 취소/환불 완료 건 제외)
    const todayPaidOrdersCount = await db.order.count({
      where: {
        status: { in: ["PAID", "paid", "결제 완료", "결제완료"] },
        OR: [
          { refundStatus: null },
          { refundStatus: { notIn: ["REFUNDED", "REFUND_COMPLETED", "refunded", "refund_completed"] } }
        ],
        createdAt: { gte: startOfToday }
      }
    });

    // 3. 보고서 생성 완료 및 실패 건수 (오늘)
    const todayReportSuccess = await db.sajuReport.count({
      where: {
        status: { in: ["COMPLETED", "completed"] },
        createdAt: { gte: startOfToday }
      }
    });

    const todayReportFailed = await db.sajuReport.count({
      where: {
        status: { in: ["FAILED", "failed"] },
        createdAt: { gte: startOfToday }
      }
    });

    // 4. 미결제 건수 (오늘 PENDING 또는 입금 확인 대기 주문)
    const todayPendingOrders = await db.order.count({
      where: {
        status: { in: ["PENDING", "WAITING_DEPOSIT", "pending", "waiting_deposit"] },
        createdAt: { gte: startOfToday }
      }
    });

    // 5. 환불 요청 건수 (오늘 REFUND_REQUESTED 주문)
    const todayRefundRequests = await db.order.count({
      where: {
        refundStatus: { in: ["REFUND_REQUESTED", "refund_requested"] }
      }
    });

    // 6. 고객 문의 건수 (전체 PENDING 문의 수)
    const pendingInquiriesCount = await db.inquiry.count({
      where: {
        status: { in: ["PENDING", "pending"] }
      }
    });

    // 7. 매출 통계 (오늘 및 이번 달 매출, 유료 PAID 주문 합산)
    const todayOrders = await db.order.findMany({
      where: {
        status: { in: ["PAID", "paid", "결제 완료", "결제완료"] },
        createdAt: { gte: startOfToday }
      },
      select: { amount: true }
    });
    const todaySales = todayOrders.reduce((sum, o) => sum + o.amount, 0);

    const monthOrders = await db.order.findMany({
      where: {
        status: { in: ["PAID", "paid", "결제 완료", "결제완료"] },
        createdAt: { gte: startOfMonth }
      },
      select: { amount: true }
    });
    const monthSales = monthOrders.reduce((sum, o) => sum + o.amount, 0);

    // 8. 사주 리포트 진행 상태별 요약 카운트
    const statusSummary = {
      INPUT_COMPLETED: await db.sajuReport.count({ where: { status: { in: ["INPUT_COMPLETED", "input_completed"] } } }),
      WAITING_PAYMENT: await db.sajuReport.count({ where: { status: { in: ["WAITING_PAYMENT", "waiting_payment"] } } }),
      PAID: await db.sajuReport.count({ where: { status: { in: ["PAID", "paid"] } } }),
      ANALYZING: await db.sajuReport.count({ where: { status: { in: ["ANALYZING", "analyzing"] } } }),
      COMPLETED: await db.sajuReport.count({ where: { status: { in: ["COMPLETED", "completed"] } } }),
      DELIVERED: await db.sajuReport.count({ where: { status: { in: ["DELIVERED", "delivered"] } } })
    };

    return NextResponse.json({
      success: true,
      stats: {
        todayUsers: todayUsersCount,
        todayPaid: todayPaidOrdersCount,
        reportSuccess: todayReportSuccess,
        reportFailed: todayReportFailed,
        pendingPayments: todayPendingOrders,
        refundRequests: todayRefundRequests,
        pendingInquiries: pendingInquiriesCount,
        todaySales,
        monthSales,
        statusSummary
      }
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
