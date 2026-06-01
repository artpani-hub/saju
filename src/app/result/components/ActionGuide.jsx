import React from 'react';

export default function ActionGuide({ job }) {
  const guides = {
    '프로젝트 매니저': [
      'Agile·Scrum 교육 이수',
      '프로젝트 관리 툴(Jira, Asana) 숙련',
      '팀 리더십 서적 3권 읽기',
    ],
    '데이터 사이언티스트': [
      'Python·R 실습 프로젝트 진행',
      '머신러닝 온라인 강좌 수강',
      '데이터 시각화 대회 참여',
    ],
    '마케팅 전략가': [
      '디지털 마케팅 자격증 취득',
      '시장 조사 리포트 작성 연습',
      'SNS 캠페인 실행 경험 쌓기',
    ],
    '재무 설계사': [
      '재무·세무 기본 서적 정리',
      '재무 설계 시뮬레이션 툴 활용',
      '고객 상담 롤플레이 연습',
    ],
    '디자인 디렉터': [
      '디자인 시스템 구축 연습',
      '포트폴리오 최신화',
      'UI/UX 최신 트렌드 조사',
    ],
    '법률 상담가': [
      '법률 사례 분석 스터디',
      '협상·중재 스킬 워크숍',
      '관련 법령 최신 업데이트',
    ],
    '교육 강사': [
      '강의 기획 및 교안 작성',
      '청중 몰입 기술 연습',
      '피드백 기반 개선 루프',
    ],
    '창업가': [
      '비즈니스 모델 캔버스 작성',
      '시장 검증 최소 제품(MVP) 개발',
      '투자자 피칭 연습',
    ],
  };

  const steps = guides[job.name] || ['관련 스킬을 지속적으로 학습하세요.'];

  return (
    <div className="bg-[#FAF7F0] p-4 rounded-lg shadow-sm mt-4">
      <h4 className="font-myeongjo font-bold mb-2">{job.name} 맞춤 가이드</h4>
      <ul className="list-disc list-inside text-sm space-y-1">
        {steps.map((s, i) => (
          <li key={i}>{s}</li>
        ))}
      </ul>
    </div>
  );
}
