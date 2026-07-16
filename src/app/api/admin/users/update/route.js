import { NextResponse } from "next/server";
import { db } from "../../../../../lib/db";

export const dynamic = "force-dynamic";

export async function POST(req) {
  try {
    const body = await req.json();
    const { 
      adminPassword, 
      userId, 
      name, 
      email, 
      phone, 
      birthYear, 
      birthMonth, 
      birthDay, 
      calendarType, 
      birthHour,
      recreateReport,
      adminName,
      reason
    } = body;

    if (adminPassword !== "artpani1234") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    if (!userId) {
      return NextResponse.json({ success: false, error: "User ID is required" }, { status: 400 });
    }

    const result = await db.$transaction(async (tx) => {
      // 1. 기존 고객 정보 조회
      const oldUser = await tx.user.findUnique({
        where: { id: userId },
        include: { reports: { orderBy: { createdAt: "desc" }, take: 1 } }
      });

      if (!oldUser) {
        throw new Error("존재하지 않는 고객입니다.");
      }

      const reportId = oldUser.reports[0]?.id || null;
      const historyAdmin = adminName || "관리자";
      const historyReason = reason || "고객 요청";

      // 2. 변경 필드 비교 및 이력(Audit Log) 생성
      const changes = [];

      // 이름 변경
      if (name && name !== oldUser.name) {
        changes.push({ field: "이름 변경", oldVal: oldUser.name, newVal: name });
      }
      // 이메일 변경
      if (email !== undefined && email !== oldUser.email) {
        changes.push({ field: "이메일 변경", oldVal: oldUser.email || "없음", newVal: email || "없음" });
      }
      // 전화번호 변경
      if (phone && phone !== oldUser.phone) {
        changes.push({ field: "연락처 변경", oldVal: oldUser.phone, newVal: phone });
      }
      // 생년월일 오입력 비교
      const oldBirthStr = `${oldUser.birthYear}-${String(oldUser.birthMonth).padStart(2, '0')}-${String(oldUser.birthDay).padStart(2, '0')}`;
      const newBirthYear = birthYear !== undefined ? Number(birthYear) : oldUser.birthYear;
      const newBirthMonth = birthMonth !== undefined ? Number(birthMonth) : oldUser.birthMonth;
      const newBirthDay = birthDay !== undefined ? Number(birthDay) : oldUser.birthDay;
      const newBirthStr = `${newBirthYear}-${String(newBirthMonth).padStart(2, '0')}-${String(newBirthDay).padStart(2, '0')}`;
      
      if (oldBirthStr !== newBirthStr) {
        changes.push({ field: "생년월일 오입력", oldVal: oldBirthStr, newVal: newBirthStr });
      }

      // 음력·양력 변경
      if (calendarType && calendarType !== oldUser.calendarType) {
        changes.push({ field: "음력·양력 변경", oldVal: oldUser.calendarType === "solar" ? "양력" : "음력", newVal: calendarType === "solar" ? "양력" : "음력" });
      }

      // 출생시간 변경
      if (birthHour && birthHour !== oldUser.birthHour) {
        changes.push({ field: "출생시간 변경", oldVal: oldUser.birthHour || "미정/모름", newVal: birthHour });
      }

      // 수정 이력이 있으면 SajuReportHistory에 기록
      if (changes.length > 0 && reportId) {
        for (const change of changes) {
          await tx.sajuReportHistory.create({
            data: {
              reportId: reportId,
              fieldName: change.field,
              oldValue: change.oldVal,
              newValue: change.newVal,
              adminName: historyAdmin,
              reason: historyReason
            }
          });
        }
      }

      // 3. User 정보 업데이트
      const updatedUser = await tx.user.update({
        where: { id: userId },
        data: {
          name: name || undefined,
          email: email !== undefined ? email : undefined,
          phone: phone || undefined,
          birthYear: birthYear !== undefined ? Number(birthYear) : undefined,
          birthMonth: birthMonth !== undefined ? Number(birthMonth) : undefined,
          birthDay: birthDay !== undefined ? Number(birthDay) : undefined,
          gender: oldUser.gender, // Keep gender
          calendarType: calendarType || undefined,
          birthHour: birthHour || undefined
        }
      });

      // 4. 기존 보고서 재생성 플래그 처리
      if (recreateReport === true && reportId) {
        await tx.sajuReport.update({
          where: { id: reportId },
          data: {
            status: "결제 완료", // Re-trigger auto-generation by setting status to paid queue
            unlocked: true       // Ensure unlocked is true for generation to complete
          }
        });
      }

      return updatedUser;
    });

    return NextResponse.json({ success: true, user: result });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
