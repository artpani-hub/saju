/**
 * 누적 보감 발행 수, 오늘 발행 수, 실시간 열람자 수를 동적으로 계산하는 유틸리티
 * 
 * 1. 누적 보감 발행
 *    - 기준일: 2026-05-31 00:00:00 KST
 *    - 기준 인원: 14,820명
 *    - 증가량: 일 평균 25명 (매일 20~30명 범위)
 * 
 * 2. 오늘 발행
 *    - 매일 자정(00:00)에 초기화되어 시간의 경과에 따라 380 ~ 450명까지 증가
 * 
 * 3. 지금 열람 중
 *    - 실시간 생동감을 주기 위해 15 ~ 28명 사이를 유동적으로 요동침
 */

// 누적 보감 발행 수 계산
export const getCumulativeCount = () => {
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

// 오늘 발행 수 계산
export const getTodayCount = () => {
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const elapsedMs = now.getTime() - startOfDay;
  const progress = elapsedMs / (1000 * 60 * 60 * 24); // 하루 중 경과율 (0.0 ~ 1.0)
  
  // 오늘 총 발행 목표치 (날짜에 따라 380 ~ 452건으로 변화)
  const targetCount = 380 + (now.getDate() % 10) * 8;
  
  // 새벽에도 기본 최소 발행량이 표시되도록 +8 건 베이스 시작
  const count = Math.floor(targetCount * progress) + 8;
  return count;
};

// 지금 열람 중인 접속자 수 계산
export const getActiveUsers = () => {
  const now = new Date();
  // 분과 초의 시드를 조합하여 15 ~ 28명 사이에서 요동치게 만듦 (결정론적 난수)
  const seed = (now.getSeconds() * 3 + now.getMinutes() * 7) % 14;
  return 15 + seed;
};
