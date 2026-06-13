const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/app/result/components/renderNewYearPageContent.js');
let content = fs.readFileSync(filePath, 'utf8');

// analysis와 timing 출력 태그를 dangerouslySetInnerHTML 형태로 치환
content = content.replace(
  /<p className="text-justify text-gray-650 font-light pl-3 border-l border-gray-200">\s*\{\s*categorySolution\.timing\s*\}\s*<\/p>/g,
  `<p className="text-justify text-gray-650 font-light pl-3 border-l border-gray-200" dangerouslySetInnerHTML={{ __html: categorySolution.timing }} />`
);

content = content.replace(
  /<p className="text-justify text-gray-650 font-light pl-3 border-l border-gray-200">\s*\{\s*textSolution\.timing\s*\}\s*<\/p>/g,
  `<p className="text-justify text-gray-650 font-light pl-3 border-l border-gray-200" dangerouslySetInnerHTML={{ __html: textSolution.timing }} />`
);

// 일반적인 gray-600 매치도 처리
content = content.replace(
  /<p className="text-justify text-gray-600 font-light pl-3 border-l border-gray-200">\s*\{\s*textSolution\.analysis\s*\}\s*<\/p>/g,
  `<p className="text-justify text-gray-600 font-light pl-3 border-l border-gray-200" dangerouslySetInnerHTML={{ __html: textSolution.analysis }} />`
);

content = content.replace(
  /<p className="text-justify text-gray-600 font-light pl-3 border-l border-gray-200">\s*\{\s*textSolution\.timing\s*\}\s*<\/p>/g,
  `<p className="text-justify text-gray-600 font-light pl-3 border-l border-gray-200" dangerouslySetInnerHTML={{ __html: textSolution.timing }} />`
);

content = content.replace(
  /<p className="text-justify text-gray-600 font-light pl-3 border-l border-gray-200">\s*\{\s*categorySolution\.analysis\s*\}\s*<\/p>/g,
  `<p className="text-justify text-gray-600 font-light pl-3 border-l border-gray-200" dangerouslySetInnerHTML={{ __html: categorySolution.analysis }} />`
);

content = content.replace(
  /<p className="text-justify text-gray-600 font-light pl-3 border-l border-gray-200">\s*\{\s*categorySolution\.timing\s*\}\s*<\/p>/g,
  `<p className="text-justify text-gray-600 font-light pl-3 border-l border-gray-200" dangerouslySetInnerHTML={{ __html: categorySolution.timing }} />`
);

// 이제 getPersonalizedSolution 함수의 텍스트 문구들에 강조 스타일 태그 적용
// 1. "의뢰인 ${name}님의 사주 기질과 운세를 바탕으로..." -> "사주 기질과 운세" 강조
// 2. "현금 흐름의 60% 이상은 수동적 예적금이나 연금저축..." -> "수동적 예적금이나 연금저축" 강조
// 3. "노란색(土) 지갑이나 브라운 계열의 의상..." -> "노란색(土) 지갑이나 브라운 계열의 의상" 강조
// 등등 분석 결과 속 핵심 정보들에 <span style="color: #8A6F4C; font-weight: bold;">...</span> 태그 적용

const replacements = [
  // 1. 공통/총론
  {
    target: "사주 기질과 운세",
    replace: "<span style=\\\"color: #8A6F4C; font-weight: bold;\\\">사주 기질과 운세</span>"
  },
  {
    target: "음력 8월(酉월) 이후",
    replace: "<span style=\\\"color: #8A6F4C; font-weight: bold;\\\">음력 8월(酉월) 이후</span>"
  },
  // 2. 건강/헬스
  {
    target: "화기운의 과다 혹은 수기운의 결핍",
    replace: "<span style=\\\"color: #8A6F4C; font-weight: bold;\\\">화기운의 과다 혹은 수기운의 결핍</span>"
  },
  {
    target: "가을철(음력 7~8월) 및 겨울철(음력 10~11월)",
    replace: "<span style=\\\"color: #8A6F4C; font-weight: bold;\\\">가을철(음력 7~8월) 및 겨울철(음력 10~11월)</span>"
  },
  {
    target: "따뜻한 물로 족욕을 실천",
    replace: "<span style=\\\"color: #8A6F4C; font-weight: bold;\\\">따뜻한 물로 족욕을 실천</span>"
  },
  {
    target: "수승화강(水昇火降)",
    replace: "<span style=\\\"color: #8A6F4C; font-weight: bold;\\\">수승화강(水昇火降)</span>"
  },
  {
    target: "녹색 식물을 방에 두거나 가벼운 숲길 산책",
    replace: "<span style=\\\"color: #8A6F4C; font-weight: bold;\\\">녹색 식물을 방에 두거나 가벼운 숲길 산책</span>"
  },
  // 3. 공부/학업
  {
    target: "인성(印星)의 기운",
    replace: "<span style=\\\"color: #8A6F4C; font-weight: bold;\\\">인성(印星)의 기운</span>"
  },
  {
    target: "2026년 음력 8월(酉월) 및 9월(戌월)",
    replace: "<span style=\\\"color: #8A6F4C; font-weight: bold;\\\">2026년 음력 8월(酉월) 및 9월(戌월)</span>"
  },
  {
    target: "남서쪽이나 서쪽을 향하도록 배치",
    replace: "<span style=\\\"color: #8A6F4C; font-weight: bold;\\\">남서쪽이나 서쪽을 향하도록 배치</span>"
  },
  {
    target: "노란색(土)이나 브라운 계열의 의상",
    replace: "<span style=\\\"color: #8A6F4C; font-weight: bold;\\\">노란색(土)이나 브라운 계열의 의상</span>"
  },
  // 4. 직장/이직
  {
    target: "직장 상사의 비합리적인 지시나 융통성 없는 조직의 룰(관성)",
    replace: "<span style=\\\"color: #8A6F4C; font-weight: bold;\\\">직장 상사의 비합리적인 지시나 융통성 없는 조직의 룰(관성)</span>"
  },
  {
    target: "음력 7~9월 사이",
    replace: "<span style=\\\"color: #8A6F4C; font-weight: bold;\\\">음력 7~9월 사이</span>"
  },
  {
    target: "화이트(金)나 실버 액세서리를 착용",
    replace: "<span style=\\\"color: #8A6F4C; font-weight: bold;\\\">화이트(金)나 실버 액세서리를 착용</span>"
  },
  {
    target: "서쪽(西) 방향에 위치한 회사나 기관",
    replace: "<span style=\\\"color: #8A6F4C; font-weight: bold;\\\">서쪽(西) 방향에 위치한 회사나 기관</span>"
  },
  // 5. 애정/관계
  {
    target: "음력 10월(亥월) 및 11월(子월)",
    replace: "<span style=\\\"color: #8A6F4C; font-weight: bold;\\\">음력 10월(亥월) 및 11월(子월)</span>"
  },
  {
    target: "따뜻한 붉은색 계열(火)의 홈웨어",
    replace: "<span style=\\\"color: #8A6F4C; font-weight: bold;\\\">따뜻한 붉은색 계열(火)의 홈웨어</span>"
  },
  {
    target: "나란히 걸으며 이야기할 때",
    replace: "<span style=\\\"color: #8A6F4C; font-weight: bold;\\\">나란히 걸으며 이야기할 때</span>"
  },
  // 6. 재정/금전
  {
    target: "고위험 코인, 부동산 모험",
    replace: "<span style=\\\"color: #8A6F4C; font-weight: bold;\\\">고위험 코인, 부동산 모험</span>"
  },
  {
    target: "수동적 예적금이나 연금저축",
    replace: "<span style=\\\"color: #8A6F4C; font-weight: bold;\\\">수동적 예적금이나 연금저축</span>"
  },
  {
    target: "노란색(土) 지갑이나 브라운 계열의 의상",
    replace: "<span style=\\\"color: #8A6F4C; font-weight: bold;\\\">노란색(土) 지갑이나 브라운 계열의 의상</span>"
  },
  {
    target: "노란 색상의 낙관 도장",
    replace: "<span style=\\\"color: #8A6F4C; font-weight: bold;\\\">노란 색상의 낙관 도장</span>"
  },
  // 7. 사업/비즈니스
  {
    target: "과도한 화(火) 기운",
    replace: "<span style=\\\"color: #8A6F4C; font-weight: bold;\\\">과도한 화(火) 기운</span>"
  },
  {
    target: "음력 8월(酉월) 하반기 및 10월(亥월)",
    replace: "<span style=\\\"color: #8A6F4C; font-weight: bold;\\\">음력 8월(酉월) 하반기 및 10월(亥월)</span>"
  },
  {
    target: "북쪽(水) 방향에 수경 식물이나 미니 분수를 배치",
    replace: "<span style=\\\"color: #8A6F4C; font-weight: bold;\\\">북쪽(水) 방향에 수경 식물이나 미니 분수를 배치</span>"
  },
  {
    target: "다크 네이비(水) 계열 의상을 착용",
    replace: "<span style=\\\"color: #8A6F4C; font-weight: bold;\\\">다크 네이비(水) 계열 의상을 착용</span>"
  },
  // 8. 창업/스타트업
  {
    target: "식상생재",
    replace: "<span style=\\\"color: #8A6F4C; font-weight: bold;\\\">식상생재</span>"
  },
  {
    target: "음력 10월(亥월) 이후",
    replace: "<span style=\\\"color: #8A6F4C; font-weight: bold;\\\">음력 10월(亥월) 이후</span>"
  },
  {
    target: "노란색(土)이나 브라운 컬러를 로고나 사무 집기에 적용",
    replace: "<span style=\\\"color: #8A6F4C; font-weight: bold;\\\">노란색(土)이나 브라운 컬러를 로고나 사무 집기에 적용</span>"
  },
  // 9. 장사/유통
  {
    target: "음력 7~9월 가을철",
    replace: "<span style=\\\"color: #8A6F4C; font-weight: bold;\\\">음력 7~9월 가을철</span>"
  },
  {
    target: "붉은색(火) 계열의 행운 장식품",
    replace: "<span style=\\\"color: #8A6F4C; font-weight: bold;\\\">붉은색(火) 계열의 행운 장식품</span>"
  },
  {
    target: "흰색(金) 상의를 착용",
    replace: "<span style=\\\"color: #8A6F4C; font-weight: bold;\\\">흰색(金) 상의를 착용</span>"
  },
  {
    target: "서쪽(西) 방향을 밝게 정리하고, 현금 금고를 노란색 비단 천에 싸서",
    replace: "<span style=\\\"color: #8A6F4C; font-weight: bold;\\\">서쪽(西) 방향을 밝게 정리하고, 현금 금고를 노란색 비단 천에 싸서</span>"
  },
  // 10. 설비/확장
  {
    target: "문서운(인성)과 장비 계약운(관성)",
    replace: "<span style=\\\"color: #8A6F4C; font-weight: bold;\\\">문서운(인성)과 장비 계약운(관성)</span>"
  },
  {
    target: "음력 8월(酉월) 하반기 및 9월(戌월)",
    replace: "<span style=\\\"color: #8A6F4C; font-weight: bold;\\\">음력 8월(酉월) 하반기 및 9월(戌월)</span>"
  },
  {
    target: "노란색(土) 가죽 다이어리나 서류 바인더",
    replace: "<span style=\\\"color: #8A6F4C; font-weight: bold;\\\">노란색(土) 가죽 다이어리나 서류 바인더</span>"
  }
];

replacements.forEach(r => {
  // getPersonalizedSolution 내에서 타겟 문자열을 HTML 강조 문자열로 단 한 번씩 치환
  // 함수 내부 영역(30~105라인 부근)의 문자열만 치환되도록 제약
  const funcStart = content.indexOf('const getPersonalizedSolution');
  const funcEnd = content.indexOf('export const renderNewYearPageContent');
  if (funcStart !== -1 && funcEnd !== -1) {
    let funcContent = content.substring(funcStart, funcEnd);
    funcContent = funcContent.split(r.target).join(r.replace);
    content = content.substring(0, funcStart) + funcContent + content.substring(funcEnd);
  }
});

fs.writeFileSync(filePath, content, 'utf8');
console.log("SUCCESS: renderNewYearPageContent.js styling update applied.");
