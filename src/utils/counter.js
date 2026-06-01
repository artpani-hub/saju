/**
 * 누적 보감 발행 수를 동적으로 계산하는 유틸리티
 * 
 * 기준일: 2026-05-31 00:00:00 KST
 * 기준 인원: 14,820명
 * 증가량: 일 평균 25명 (매일 20~30명 범위 내에서 요일/날짜별 결정론적으로 분배)
 * 시간 단위로도 부드럽게 증가하여 실시간 접속자에게 생동감을 제공함.
 */
export const getCumulativeCount = () => {
  // KST 기준 2026-05-31 00:00:00
  const baseMs = new Date("2026-05-31T00:00:00+09:00").getTime();
  const currentMs = new Date().getTime();
  
  const diffMs = currentMs - baseMs;
  if (diffMs < 0) {
    return 14820; // 기준일 이전인 경우 기본값 반환
  }
  
  const msInDay = 1000 * 60 * 60 * 24;
  const diffDaysFraction = diffMs / msInDay;
  const diffDays = Math.floor(diffDaysFraction);
  
  let count = 14820;
  
  // 지나온 일수만큼의 누적 수치 계산 (결정론적 난수 효과)
  for (let i = 1; i <= diffDays; i++) {
    count += 20 + (i % 11); // 20 ~ 30명 사이로 고르게 분포
  }
  
  // 오늘의 증가분 중 현재 시간까지 경과한 비율 적용
  const todayIncrement = 20 + ((diffDays + 1) % 11);
  const todayProgress = diffDaysFraction - diffDays; // 0.0 ~ 1.0
  
  count += Math.floor(todayIncrement * todayProgress);
  
  return count;
};
