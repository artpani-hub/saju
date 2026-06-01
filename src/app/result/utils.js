// utils.js – 귀인·직업 매칭 로직
export const getGwiinData = (metrics, elements) => {
  // 귀인 연관도 = 8대 성향 중 독립·승부·추진·통찰 가중치 + 오행 비중
  const scoreWeight = {
    independence: 1.2,
    competitiveness: 1.1,
    drive: 1.3,
    insight: 1.2,
  };
  const elementWeight = {
    목: 1.0,
    화: 1.0,
    토: 1.0,
    금: 1.0,
    수: 1.0,
  };

  const totalScore = Object.entries(scoreWeight).reduce(
    (sum, [k, w]) => sum + (metrics.scores[k] ?? 0) * w,
    0,
  );
  const elementScore = Object.entries(elements).reduce(
    (sum, [el, cnt]) => sum + (cnt ?? 0) * (elementWeight[el] ?? 0),
    0,
  );

  return {
    totalScore: Math.round(totalScore + elementScore),
    breakdown: { ...metrics.scores, ...elements },
  };
};

export const getJobMatches = (metrics, elements) => {
  // 간단 직업 매핑 (예시 8개)
  const jobs = [
    { name: '프로젝트 매니저', o: '목', s: ['independence', 'drive'] },
    { name: '데이터 사이언티스트', o: '수', s: ['insight', 'patience'] },
    { name: '마케팅 전략가', o: '화', s: ['competitiveness', 'opportunity'] },
    { name: '재무 설계사', o: '금', s: ['business', 'negotiation'] },
    { name: '디자인 디렉터', o: '목', s: ['insight', 'drive'] },
    { name: '법률 상담가', o: '금', s: ['negotiation', 'patience'] },
    { name: '교육 강사', o: '수', s: ['insight', 'competitiveness'] },
    { name: '창업가', o: '화', s: ['drive', 'opportunity'] },
  ];

  return jobs
    .map(job => {
      const score =
        (metrics.scores[job.s[0]] ?? 0) * 0.6 +
        (metrics.scores[job.s[1]] ?? 0) * 0.4 +
        (elements[job.o] ?? 0) * 8; // 오행 가중치
      return { ...job, match: Math.round(score) };
    })
    .sort((a, b) => b.match - a.match);
};
