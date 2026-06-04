const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'src', 'app', 'result', 'page.js');
let content = fs.readFileSync(filePath, 'utf8');

console.log("=== Enriching Tojeongbi-gyeol 30 Pages & SMS 2 Pages (Line Scan) ===");

const lines = content.split(/\r?\n/);

// 1. getNewYearPagesConfiguration 치환
let configStartIdx = -1;
let configEndIdx = -1;

for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('const getNewYearPagesConfiguration =')) {
    configStartIdx = i;
  }
  // getNewYearPagesConfiguration 함수가 끝나는 닫는 중괄호 찾기
  // 기존 코드 4058번째 줄 부근: `    ];` 뒤에 `  };` 가 있는 곳
  if (configStartIdx !== -1 && i > configStartIdx && lines[i].includes('};') && lines[i-1].includes('];')) {
    configEndIdx = i;
    break;
  }
}

if (configStartIdx === -1 || configEndIdx === -1) {
  console.error("Failed to find getNewYearPagesConfiguration bounds!", configStartIdx, configEndIdx);
  process.exit(1);
}

console.log(`Found config function bounds: lines ${configStartIdx + 1} to ${configEndIdx + 1}`);

const newConfigBody = `  const getNewYearPagesConfiguration = (name, partnerName) => {
    const isTojeong = typeParam === "tojeong";
    const suffix = isTojeong ? "토정비결" : "신수비결";
    
    if (isTojeong) {
      return [
        { page: 1, type: "tj_cover", title: "2026년 병오년 정통 토정비결 표지" },
        { page: 2, type: "tj_preface", title: "토정 이지함의 역학적 지혜와 서막" },
        { page: 3, type: "tj_intro_saju", title: "의뢰인 명조 분석과 오행 원국 배치" },
        { page: 4, type: "tj_daewun_flow", title: "생애 대운 흐름과 신년 기류의 융합" },
        { page: 5, type: "tj_seoun_analysis", title: "병오년 천지합화 세운 총평" },
        { page: 6, type: "tj_wealth", title: "재물운 심층 분석 (Wealth Deep Dive)" },
        { page: 7, type: "tj_career", title: "직장 및 커리어운 분석 (Career Deep Dive)" },
        { page: 8, type: "tj_love", title: "애정 및 대인관계운 분석 (Love Deep Dive)" },
        { page: 9, type: "tj_health", title: "건강 및 신수운 분석 (Health Deep Dive)" },
        { page: 10, type: "tj_monthly", title: "음력 1월 상세 토정비결", monthNum: 1 },
        { page: 11, type: "tj_monthly", title: "음력 2월 상세 토정비결", monthNum: 2 },
        { page: 12, type: "tj_monthly", title: "음력 3월 상세 토정비결", monthNum: 3 },
        { page: 13, type: "tj_monthly", title: "음력 4월 상세 토정비결", monthNum: 4 },
        { page: 14, type: "tj_monthly", title: "음력 5월 상세 토정비결", monthNum: 5 },
        { page: 15, type: "tj_monthly", title: "음력 6월 상세 토정비결", monthNum: 6 },
        { page: 16, type: "tj_monthly", title: "음력 7월 상세 토정비결", monthNum: 7 },
        { page: 17, type: "tj_monthly", title: "음력 8월 상세 토정비결", monthNum: 8 },
        { page: 18, type: "tj_monthly", title: "음력 9월 상세 토정비결", monthNum: 9 },
        { page: 19, type: "tj_monthly", title: "음력 10월 상세 토정비결", monthNum: 10 },
        { page: 20, type: "tj_monthly", title: "음력 11월 상세 토정비결", monthNum: 11 },
        { page: 21, type: "tj_monthly", title: "음력 12월 상세 토정비결", monthNum: 12 },
        { page: 22, type: "tj_action_plan", title: "올해의 개운(開運) 솔루션" },
        { page: 23, type: "tj_warning_advice", title: "올해의 조심할 점과 이지함 선생의 조언" },
        { page: 24, type: "tj_fengshui", title: "신년 공간 풍수 인테리어 처방" },
        { page: 25, type: "tj_lucky_items", title: "신년 추천 수호 소품 리스트" },
        { page: 26, type: "tj_diet", title: "체질 맞춤형 오행 섭생 처방" },
        { page: 27, type: "tj_roadmap_2027", title: "2027년 정미년(丁未年) 세운 로드맵" },
        { page: 28, type: "tj_roadmap_2028", title: "2028년 무신년(戊申年) 세운 로드맵" },
        { page: 29, type: "tj_roadmap_2029", title: "2029년 기유년(己酉年) 세운 로드맵" },
        { page: 30, type: "tj_final_blessing", title: "병오년 성공 기원 최종 축원문" }
      ];
    }

    return [
      { page: 1, type: "ny_cover", title: \`2026년 병오년(丙午年) 혜안당 정통 \${suffix} 표지\` },
      { page: 2, type: "ny_preface", title: "새해를 맞이하는 마음가짐과 명리 서막" },
      { page: 3, type: "ny_intro_saju", title: "의뢰인 명조(命造) 분석과 오행 원국 배치" },
      { page: 4, type: "ny_daewun_flow", title: "생애 대운(大運)의 흐름과 2026년의 영향" },
      { page: 5, type: "ny_seoun_analysis", title: "병오년 천지합화(天地合火) 세운 총평" },
      { page: 6, type: "ny_stem_harmony", title: "일간(日干) 오행과 병오년 불꽃 기류 융합" },
      { page: 7, type: "ny_ilju_harmony", title: "일주(日柱)와 2026 세운의 합·충·형·파·해 진단" },
      { page: 8, type: "ny_elements_balance", title: "신년 오행 과잉/결핍 진단" },
      { page: 9, type: "ny_elements_supplement", title: "부족한 오행을 채우는 일상 개운법" },
      { page: 10, type: "ny_health_presc", title: "세운 기류 변화에 따른 신년 건강 처방" },
      { page: 11, type: "ny_mind_meditation", title: "스트레스 조율 및 정신 건강 명상 처방" },
      { page: 12, type: "ny_lucky_secrets", title: "병오년 맞춤 신년 행운 비방" },
      { page: 13, type: "ny_season_spring", title: "봄철(음력 1~3월) 계절적 세부 기운과 전략" },
      { page: 14, type: "ny_monthly", title: \`음력 1월 상세 \${suffix}\`, monthNum: 1 },
      { page: 15, type: "ny_monthly", title: \`음력 2월 상세 \${suffix}\`, monthNum: 2 },
      { page: 16, type: "ny_monthly", title: \`음력 3월 상세 \${suffix}\`, monthNum: 3 },
      { page: 17, type: "ny_season_summer", title: "여름철(음력 4~6월) 계절적 세부 기운과 전략" },
      { page: 18, type: "ny_monthly", title: \`음력 4월 상세 \${suffix}\`, monthNum: 4 },
      { page: 19, type: "ny_monthly", title: \`음력 5월 상세 \${suffix}\`, monthNum: 5 },
      { page: 20, type: "ny_monthly", title: \`음력 6월 상세 \${suffix}\`, monthNum: 6 },
      { page: 21, type: "ny_season_autumn", title: "가을철(음력 7~9월) 계절적 세부 기운과 전략" },
      { page: 22, type: "ny_monthly", title: \`음력 7월 상세 \${suffix}\`, monthNum: 7 },
      { page: 23, type: "ny_monthly", title: \`음력 8월 상세 \${suffix}\`, monthNum: 8 },
      { page: 24, type: "ny_monthly", title: \`음력 9월 상세 \${suffix}\`, monthNum: 9 },
      { page: 25, type: "ny_season_winter", title: "겨울철(음력 10~12월) 계절적 세부 기운과 전략" },
      { page: 26, type: "ny_monthly", title: \`음력 10월 상세 \${suffix}\`, monthNum: 10 },
      { page: 27, type: "ny_monthly", title: \`음력 11월 상세 \${suffix}\`, monthNum: 11 },
      { page: 28, type: "ny_monthly", title: \`음력 12월 상세 \${suffix}\`, monthNum: 12 },
      { page: 29, type: "ny_wealth_fortune", title: "신년 재물 및 사업운 분석" },
      { page: 30, type: "ny_wealth_portfolio", title: "오행별 추천 투자 스타일 및 재무 가이드" },
      { page: 31, type: "ny_career_fortune", title: "신년 직장 및 커리어운세" },
      { page: 32, type: "ny_career_detailed", title: "이직 및 승진 상세 타이밍 가이드" },
      { page: 33, type: "ny_love_fortune", title: "신년 연애 및 가정운 주파수 조율" },
      { page: 34, type: "ny_social_life", title: "신년 인맥 관리 및 대인관계 조율" },
      { page: 35, type: "ny_study_fortune", title: "신년 학업 및 시험운 처방" },
      { page: 36, type: "ny_gossip_defense", title: "신년 구설 및 시비수 예방 수칙" },
      { page: 37, type: "ny_sinsal_active", title: "신년 3대 신살 작동 현황 분석" },
      { page: 38, type: "ny_gwiin_harmony", title: "신년 인연 및 귀인 조화 분석" },
      { page: 39, type: "ny_warning_period", title: "치명적인 액난 경보 및 방어 비책" },
      { page: 40, type: "ny_worry_solution", title: "고민 해결 맞춤형 솔루션" },
      { page: 41, type: "ny_personal_worry", title: "의뢰인 맞춤형 고민 정밀 비책" },
      { page: 42, type: "ny_roadmap_2027", title: "2027년 정미년(丁未年) 세운 로드맵" },
      { page: 43, type: "ny_roadmap_2028", title: "2028년 무신년(戊申年) 세운 로드맵" },
      { page: 44, type: "ny_roadmap_2029", title: "2029년 기유년(己酉年) 세운 로드맵" },
      { page: 45, type: "ny_roadmap_2030", title: "2030년 경술년(庚戌年) 세운 로드맵" },
      { page: 46, type: "ny_roadmap_2031", title: "2031년 신해년(Skin해年) 세운 로드맵" },
      { page: 47, type: "ny_action_rules", title: "신년 개운 실천 3대 행동 강령" },
      { page: 48, type: "ny_fengshui_interior", title: "신년 공간 풍수 인테리어 처방" },
      { page: 49, type: "ny_lucky_items", title: "신년 추천 수호 소품 리스트" },
      { page: 50, type: "ny_lucky_fashion", title: "신년 패션 메이크업 스타일링 가이드" },
      { page: 51, type: "ny_diet_presc", title: "체질 맞춤형 오행 섭생 음식 처방" },
      { page: 52, type: "ny_final_blessing", title: "병오년 성공 기원 마지막 축원문" }
    ];
  };`;

// 2. wrapLock 치환
let wrapLockStartIdx = -1;
let wrapLockEndIdx = -1;

for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('const wrapLock = (content, sectionTitle) => {')) {
    wrapLockStartIdx = i;
  }
  if (wrapLockStartIdx !== -1 && i > wrapLockStartIdx && lines[i].includes('const shouldBlur = isFree || isUpgradeLocked;')) {
    wrapLockEndIdx = i;
    break;
  }
}

if (wrapLockStartIdx === -1 || wrapLockEndIdx === -1) {
  console.error("Failed to find wrapLock bounds!");
  process.exit(1);
}

console.log(`Found wrapLock bounds: lines ${wrapLockStartIdx + 1} to ${wrapLockEndIdx + 1}`);

const newWrapLock = `    const wrapLock = (content, sectionTitle) => {
      const isNewYear = type === "newyear" && typeParam !== "tojeong";
      const isTojeong = typeParam === "tojeong";
      const premiumOnlyPages = [
        "ny_ilju_harmony",
        "ny_sinsal_active",
        "ny_warning_period",
        "ny_worry_solution",
        "ny_personal_worry",
        "ny_roadmap_2027",
        "ny_roadmap_2028",
        "ny_roadmap_2029",
        "ny_fengshui_interior"
      ];
      
      const isUpgradeLocked = isNewYear && currentGrade === "premium" && premiumOnlyPages.includes(page.type);
      const shouldBlur = !isTojeong && (isFree || isUpgradeLocked);`;

// 치환 및 주입 적용
const linesBeforeConfig = lines.slice(0, configStartIdx);
const linesBetweenConfigAndWrapLock = lines.slice(configEndIdx + 1, wrapLockStartIdx);
const linesAfterWrapLock = lines.slice(wrapLockEndIdx + 1);

let updatedLines = [
  ...linesBeforeConfig,
  newConfigBody + "\n  const renderNewYearPageContent = (page, ctx) => {",
  ...linesBetweenConfigAndWrapLock,
  newWrapLock,
  ...linesAfterWrapLock
];

content = updatedLines.join('\n');

// 3. Switch page.type 아래에 tj_* 케이스들 주입
const switchTarget = '    switch (page.type) {';
const switchReplacement = `    switch (page.type) {
      // ----------------------------------------------------
      // [NEW] 토정비결 전용 30페이지 렌더링 케이스
      // ----------------------------------------------------
      case "tj_cover":
        return (
          <div className="text-center space-y-12 py-16 bg-[#FDFBF7] border border-[#E2DDD5]/80 rounded-lg p-8 shadow-inner relative min-h-[400px]">
            <div className="space-y-4">
              <span className="text-xs tracking-[0.35em] text-[#A3845B] font-bold block font-myeongjo">— 慧眼堂 寶鑑 —</span>
              <div className="w-24 h-0.5 bg-[#A3845B]/40 mx-auto" />
            </div>
            <div className="space-y-6 py-8">
              <h1 className="font-myeongjo text-3xl md:text-5xl font-extrabold text-[#1A1A1A] tracking-widest leading-normal">
                2026 丙午年<br />
                정통 토정비결 (土亭秘訣)
              </h1>
              <p className="text-sm text-[#5F5F5F] font-light tracking-wide font-traditional">
                조선 명의 토정 이지함 선생의 비결로 풀어보는 귀하의 일생 지침 보감
              </p>
            </div>
            <div className="border border-[#E2DDD5] bg-white rounded-lg p-6 max-w-sm mx-auto space-y-4 text-xs shadow-sm text-left">
              <div className="grid grid-cols-2 gap-4 border-b border-[#E2DDD5]/50 pb-3">
                <div>
                  <span className="text-[#A3845B] font-bold block mb-1">의뢰인 성명</span>
                  <span className="font-semibold text-gray-800 text-sm">{name} 님 ({gender})</span>
                </div>
                <div>
                  <span className="text-[#A3845B] font-bold block mb-1">출생 정보</span>
                  <span className="font-semibold text-gray-800">{year}년 {month}월 {day}일 {hour}</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-[#A3845B] font-bold block mb-1">분석 상품</span>
                  <span className="font-semibold text-gray-800">정통 토정비결</span>
                </div>
                <div>
                  <span className="text-[#A3845B] font-bold block mb-1">리포트 등급</span>
                  <span className="font-semibold text-emerald-700 uppercase font-sans font-bold">
                    고급 리포트 (무제한)
                  </span>
                </div>
              </div>
            </div>
            <div className="space-y-2 pt-12">
              <span className="font-myeongjo text-sm font-bold text-[#1A1A1A]">慧眼堂 명리연구소</span>
              <p className="text-[9px] text-[#A3845B]/60 font-light">본 보감의 복제 및 무단 전재를 금합니다.</p>
            </div>
            
            {/* 혜안당 공식 직인 */}
            <div className="absolute right-8 bottom-8 select-none opacity-80">
              <svg viewBox="0 0 60 60" className="w-[45px] h-[45px] transform -rotate-12">
                <rect x="5" y="5" width="50" height="50" rx="3" fill="none" stroke="#8B221E" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="30 1 10 1" />
                <text x="30" y="24" textAnchor="middle" fontSize="12" fontWeight="900" fill="#8B221E" fontFamily="font-myeongjo" letterSpacing="0.5">
                  慧眼
                </text>
                <text x="30" y="41" textAnchor="middle" fontSize="12" fontWeight="900" fill="#8B221E" fontFamily="font-myeongjo" letterSpacing="0.5">
                  堂印
                </text>
              </svg>
            </div>
          </div>
        );

      case "tj_preface":
        return (
          <div className="space-y-6 py-4">
            <div className="text-center space-y-2 mb-8">
              <span className="text-xs text-[#A3845B] font-bold block">토정비결 서막 (土亭 序幕)</span>
              <h2 className="font-myeongjo text-2xl font-bold text-[#1A1A1A]">토정 이지함의 역학적 지혜와 신년의 등대</h2>
              <div className="w-16 h-0.5 bg-[#A3845B]/30 mx-auto my-1" />
            </div>
            <div className="bg-white border border-[#E2DDD5] rounded-lg p-6 space-y-4 shadow-sm text-xs leading-relaxed font-light text-gray-700 font-traditional">
              <p>
                토정비결은 조선 선조 시기의 대학자이자 기인인 <strong>토정 이지함(土亭 李之菡)</strong> 선생이 고단한 백성들의 흉함을 피하고 길함을 돕기 위해 천문 지리와 주역의 괘를 통속적으로 재해석하여 저술한 지혜서입니다.
              </p>
              <p>
                이지함 선생은 한평생을 흙집(土亭)에 머물며 스스로 가난한 삶을 자처하셨고, 길거리의 걸인들과 백성들의 아픔을 몸소 위로하셨습니다. 그분이 사주와 숫자의 오행적 상생상극 조합을 이용해 한 해의 길흉을 풀어낸 것은, 단순한 점술이 아닌 다가올 역경에 대비하여 긍정의 개운을 이뤄내고자 한 따뜻한 휴머니즘의 소산이었습니다.
              </p>
              <p>
                본 혜안당 정통 토정비결은 2026년 병오년(丙午年) 세운의 불꽃(火) 기운과 의뢰인 <strong>{name}</strong>님의 사주 원국의 융합 관계를 추길피흉(趨吉避凶)의 관점으로 풀어낸 30페이지 분량의 완결 보감입니다. 올해의 뜨거운 에너지를 제련하여 행운으로 취하는 비책을 마음속 깊이 새기시길 권합니다.
              </p>
            </div>
          </div>
        );

      case "tj_intro_saju":
        return (
          <div className="space-y-6 py-4">
            <div className="text-center space-y-2 mb-8">
              <span className="text-xs text-[#A3845B] font-bold block">명조 분석 (命造 分析)</span>
              <h2 className="font-myeongjo text-2xl font-bold text-[#1A1A1A]">나를 증명하는 우주의 지도, 사주 원국 정밀 해설</h2>
              <div className="w-16 h-0.5 bg-[#A3845B]/30 mx-auto my-1" />
            </div>
            <div className="bg-white border border-[#E2DDD5] rounded-lg p-6 space-y-6 shadow-sm text-xs leading-relaxed font-light text-gray-700 font-traditional">
              <p>
                의뢰인 <strong>{name}</strong>님이 태어난 우주적 순간의 여덟 글자(사주 원국) 배치입니다. 이는 의뢰인의 정신적 기틀이자 평생 변하지 않는 유전적 성향의 원형을 상징합니다.
              </p>
              <div className="grid grid-cols-4 gap-2 text-center font-bold">
                <div className="bg-[#FAF7F0] p-2.5 rounded border border-[#E2DDD5]/50">
                  <div className="text-[10px] text-gray-400">시주(時柱)</div>
                  <div className="text-sm text-[#A3845B] mt-1.5">{sajuInfo.hour.stem}{sajuInfo.hour.branch}</div>
                  <div className="text-[9px] text-gray-500 font-light mt-0.5">{sajuInfo.hour.stemEl}/{sajuInfo.hour.branchEl}</div>
                  <div className="text-[8px] text-gray-400 mt-1.5 font-normal border-t border-gray-200/60 pt-1">노년·자식운</div>
                </div>
                <div className="bg-[#FAF7F0] p-2.5 rounded border border-[#E2DDD5]/50 border-2 border-brass">
                  <div className="text-[10px] text-brass">일주(日柱)</div>
                  <div className="text-sm text-brass mt-1.5">{sajuInfo.day.stem}{sajuInfo.day.branch}</div>
                  <div className="text-[9px] text-brass font-light mt-0.5">{sajuInfo.day.stemEl}/{sajuInfo.day.branchEl}</div>
                  <div className="text-[8px] text-brass mt-1.5 font-normal border-t border-brass/20 pt-1">중년·배우자궁</div>
                </div>
                <div className="bg-[#FAF7F0] p-2.5 rounded border border-[#E2DDD5]/50">
                  <div className="text-[10px] text-gray-400">월주(月柱)</div>
                  <div className="text-sm text-[#A3845B] mt-1.5">{sajuInfo.month.stem}{sajuInfo.month.branch}</div>
                  <div className="text-[9px] text-gray-500 font-light mt-0.5">{sajuInfo.month.stemEl}/{sajuInfo.month.branchEl}</div>
                  <div className="text-[8px] text-gray-400 mt-1.5 font-normal border-t border-gray-200/60 pt-1">청년·사회운</div>
                </div>
                <div className="bg-[#FAF7F0] p-2.5 rounded border border-[#E2DDD5]/50">
                  <div className="text-[10px] text-gray-400">년주(年柱)</div>
                  <div className="text-sm text-[#A3845B] mt-1.5">{sajuInfo.year.stem}{sajuInfo.year.branch}</div>
                  <div className="text-[9px] text-gray-500 font-light mt-0.5">{sajuInfo.year.stemEl}/{sajuInfo.year.branchEl}</div>
                  <div className="text-[8px] text-gray-400 mt-1.5 font-normal border-t border-gray-200/60 pt-1">초년·조상궁</div>
                </div>
              </div>
              <div className="space-y-2 pt-2">
                <p>
                  네 기둥 중에서도 나 자신을 대표하는 <strong>일간(日干: {sajuInfo.day.stem})</strong>은 나의 자아를 상징하며, 년주({sajuInfo.year.stem}{sajuInfo.year.branch})는 나의 든든한 가문과 사회적 뿌리를 의미합니다. 올 한 해 병오년의 기운이 이 여덟 글자와 마주하여 일으키는 상호 융합 작용을 상세 분석하여 최적의 대처 비책을 제공합니다.
                </p>
              </div>
            </div>
          </div>
        );

      case "tj_daewun_flow":
        return (
          <div className="space-y-6 py-4">
            <div className="text-center space-y-2 mb-8">
              <span className="text-xs text-[#A3845B] font-bold block">대운 흐름 (大運 潮流)</span>
              <h2 className="font-myeongjo text-2xl font-bold text-[#1A1A1A]">인생의 거대한 물결, 대운과 신년 세운의 융합</h2>
              <div className="w-16 h-0.5 bg-[#A3845B]/30 mx-auto my-1" />
            </div>
            
            <div className="bg-white border border-[#E2DDD5] rounded-lg p-6 space-y-4 shadow-sm text-xs leading-relaxed font-light text-gray-700 font-traditional">
              <p>
                명리학에서 <strong>대운(大運)</strong>이란 10년 주기로 움직이는 내 영혼의 도로 기후 상태를 의미하며, <strong>세운(歲運)</strong>은 매년 변하는 일시적인 날씨 변화에 비유됩니다.
              </p>
              <div className="bg-[#FAF8F5] border border-[#E2DDD5]/60 rounded-xl p-4 space-y-3">
                <span className="font-bold text-xs text-[#8A6F4C] block">🌀 2026 신년 대운 및 세운 조화도</span>
                <div className="space-y-2">
                  <div className="flex justify-between text-[10px]">
                    <span>대운-세운 에너지 융합 지수</span>
                    <span className="text-emerald-700 font-bold">80%</span>
                  </div>
                  <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-600 rounded-full" style={{ width: "80%" }} />
                  </div>
                </div>
              </div>
              <p>
                의뢰인 {name}님의 타고난 일간 오행과 대운 지지의 관계가 2026년 병오년의 맹렬한 불꽃 기류와 만나 인생의 전환기적 합(合)과 팽창을 유도하고 있습니다. 지나치게 공격적인 영역 확장보다는 안정성을 기반으로 대운의 순탄함을 수호해야 합니다.
              </p>
            </div>
          </div>
        );

      case "tj_seoun_analysis":
        return (
          <div className="space-y-6 py-4">
            <div className="text-center space-y-2 mb-8">
              <span className="text-xs text-[#A3845B] font-bold block">세운 총평 (歲運 總評)</span>
              <h2 className="font-myeongjo text-2xl font-bold text-[#1A1A1A]">2026년 병오년(丙午年) 천지합화 세운의 궤적</h2>
              <div className="w-16 h-0.5 bg-[#A3845B]/30 mx-auto my-1" />
            </div>
            <div className="bg-white border border-[#E2DDD5] rounded-lg p-6 space-y-6 shadow-sm text-xs leading-relaxed font-light text-gray-700 font-traditional">
              <p>
                2026년 병오년(丙午年)은 천간의 丙(양화)과 지지의 午(양화)가 만나 위아래가 모두 거대한 불꽃으로 화하는 **천지합화(天地合火)**의 형국을 띱니다.
              </p>
              
              {/* 화기 팽창도 게이지 */}
              <div className="bg-[#FAF8F5] border border-[#E2DDD5]/60 rounded-xl p-5 flex flex-col items-center">
                <span className="font-bold text-xs text-[#8A6F4C] mb-2">🔥 2026년 병오년 세운 화기(火氣) 팽창도</span>
                <div className="relative w-[180px] h-[105px]">
                  <svg viewBox="0 0 200 110" className="w-full h-full">
                    <defs>
                      <linearGradient id="gaugeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#3B82F6" />
                        <stop offset="50%" stopColor="#F59E0B" />
                        <stop offset="100%" stopColor="#EF4444" />
                      </linearGradient>
                    </defs>
                    <path d="M 25 90 A 75 75 0 0 1 175 90" fill="none" stroke="#F3F4F6" strokeWidth="12" strokeLinecap="round" />
                    <path d="M 25 90 A 75 75 0 0 1 175 90" fill="none" stroke="url(#gaugeGrad)" strokeWidth="12" strokeLinecap="round" strokeDasharray="235" strokeDashoffset="24" />
                    <circle cx="100" cy="90" r="5" fill="#1A1A1A" />
                    <line x1="100" y1="90" x2="155" y2="40" stroke="#1A1A1A" strokeWidth="3.5" strokeLinecap="round" />
                  </svg>
                  <div className="absolute bottom-2 left-0 right-0 text-center font-bold text-[10px] text-red-650">화기 과열 상태 (90%)</div>
                </div>
              </div>
              <p>
                이 맹렬한 불꽃 에너지는 의뢰인에게 강력한 추진력을 선물하는 한편, 감정적 조급증이나 충동적 결정을 유발할 위험을 동반합니다. 불을 다스리는 냉철한 수기(水氣)와 금기(金氣)의 균형을 활용하는 지혜가 중요하게 요구됩니다.
              </p>
            </div>
          </div>
        );

      case "tj_wealth":
        return (
          <div className="space-y-6 py-4">
            <div className="text-center space-y-2 mb-8">
              <span className="text-xs text-[#A3845B] font-bold block">재물운 (Wealth Deep Dive)</span>
              <h2 className="font-myeongjo text-2xl font-bold text-[#1A1A1A]">재물 유입 타이밍과 누수 방지 비책</h2>
              <div className="w-16 h-0.5 bg-[#A3845B]/30 mx-auto my-1" />
            </div>
            <div className="bg-white border border-[#E2DDD5] rounded-lg p-6 space-y-5 shadow-sm text-xs leading-relaxed font-light text-gray-700 font-traditional">
              <p>
                올해 재물 흐름은 <strong>가을철(음력 7월~9월) 금(金) 기운</strong>이 세운의 과도한 화기를 설기하여 재물 문서로 안착시키는 골든타임을 맞이합니다. 새로운 무리한 주식/코인 투자는 봄과 여름철에 자금이 묶여 손재수(午午自刑)를 맞이하기 쉬우니 극히 엄금해야 합니다.
              </p>
              
              <div className="bg-[#FAF8F5] border border-[#E2DDD5]/60 rounded-xl p-4 space-y-3">
                <span className="font-bold text-xs text-[#8A6F4C] block">📊 2026년 재물운 핵심 지표</span>
                <div className="grid grid-cols-2 gap-4 text-[9px] font-semibold text-gray-700">
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span>목돈 유입 및 성과율</span>
                      <span className="text-emerald-700">85%</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-600 rounded-full" style={{ width: "85%" }} />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span>불필요한 충동 손실 위험도</span>
                      <span className="text-red-700">65%</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-red-600 rounded-full" style={{ width: "65%" }} />
                    </div>
                  </div>
                </div>
              </div>
              <p className="bg-[#FAF7F0] p-3.5 rounded border border-[#E2DDD5]/60">
                💡 <strong>재무 전술:</strong> 봄철에는 부동산 매수나 지인 거래를 사양하시고, 번 소득의 50% 이상은 안정된 저축 문서 자산으로 동결시켜 자금 누수 구멍을 원천 차단하십시오.
              </p>
            </div>
          </div>
        );

      case "tj_career":
        return (
          <div className="space-y-6 py-4">
            <div className="text-center space-y-2 mb-8">
              <span className="text-xs text-[#A3845B] font-bold block">직장 &amp; 커리어운 (Career Deep Dive)</span>
              <h2 className="font-myeongjo text-2xl font-bold text-[#1A1A1A]">이직, 승진 기회와 조직 내 귀인의 동향</h2>
              <div className="w-16 h-0.5 bg-[#A3845B]/30 mx-auto my-1" />
            </div>
            <div className="bg-white border border-[#E2DDD5] rounded-lg p-6 space-y-5 shadow-sm text-xs leading-relaxed font-light text-gray-700 font-traditional">
              <p>
                직장 및 커리어에서는 귀하의 숨겨둔 재능을 높이 평가하는 윗사람이나 선배(귀인)의 천거가 예상됩니다. 특히 음력 3월과 8월에 이직 또는 승진과 관련된 중대한 합의 기운이 깃듭니다. 시험 합격 가능성도 하반기에 높은 편입니다.
              </p>
              
              <div className="bg-[#FAF8F5] border border-[#E2DDD5]/60 rounded-xl p-4 space-y-3">
                <span className="font-bold text-xs text-[#8A6F4C] block">📊 커리어 성취 및 시너지 지수</span>
                <div className="grid grid-cols-2 gap-4 text-[9px] font-semibold text-gray-700">
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span>승진 및 취업 성사율</span>
                      <span className="text-blue-700">80%</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-600 rounded-full" style={{ width: "80%" }} />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span>조직 귀인 조력 지수</span>
                      <span className="text-blue-700">90%</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-600 rounded-full" style={{ width: "90%" }} />
                    </div>
                  </div>
                </div>
              </div>
              <p>
                주의할 점은 2분기(음력 5월 전후)에 발생하는 동료와의 사소한 언쟁입니다. 감정이 격해졌을 때 즉답을 피하고 침묵을 유지하는 것이 커리어 평판을 방어하는 최상의 플레이북입니다.
              </p>
            </div>
          </div>
        );

      case "tj_love":
        return (
          <div className="space-y-6 py-4">
            <div className="text-center space-y-2 mb-8">
              <span className="text-xs text-[#A3845B] font-bold block">애정 &amp; 대인관계 (Love Deep Dive)</span>
              <h2 className="font-myeongjo text-2xl font-bold text-[#1A1A1A]">인연의 시작과 갈등 예방 대처 강령</h2>
              <div className="w-16 h-0.5 bg-[#A3845B]/30 mx-auto my-1" />
            </div>
            <div className="bg-white border border-[#E2DDD5] rounded-lg p-6 space-y-5 shadow-sm text-xs leading-relaxed font-light text-gray-700 font-traditional">
              <p>
                <strong>솔로 의뢰인:</strong> 올해 하반기(음력 8월~10월)에 침착하고 지적인 이성을 소개받을 수 있는 강한 인연운이 들어옵니다. 예술이나 공부 모임 등 차분한 공간에서 인연이 시작될 확률이 높습니다.<br />
                <strong>커플 및 부부:</strong> 세운의 뜨거운 화기로 인해 사소한 의견 대립이 큰 말다툼으로 번지기 쉽습니다. 특히 한여름에 자존심 대립을 조심해야 합니다.
              </p>
              
              <div className="bg-[#FAF8F5] border border-[#E2DDD5]/60 rounded-xl p-4 space-y-3">
                <span className="font-bold text-xs text-[#8A6F4C] block">📊 애정 주파수 조화도</span>
                <div className="grid grid-cols-2 gap-4 text-[9px] font-semibold text-gray-700">
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span>소통 및 공감 시너지</span>
                      <span className="text-rose-700">75%</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-rose-500 rounded-full" style={{ width: "75%" }} />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span>감정 과열 마찰 지수</span>
                      <span className="text-rose-700">80%</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-rose-600 rounded-full" style={{ width: "80%" }} />
                    </div>
                  </div>
                </div>
              </div>
              <p className="bg-[#FAF7F0] p-3 text-[11px] text-center rounded border border-[#E2DDD5]/60">
                💬 <strong>소통 팁:</strong> 대화 시 서로에게 10초 늦게 반응하는 냉각 훈련을 도입하여 액운을 비껴가십시오.
              </p>
            </div>
          </div>
        );

      case "tj_health":
        return (
          <div className="space-y-6 py-4">
            <div className="text-center space-y-2 mb-8">
              <span className="text-xs text-[#A3845B] font-bold block">건강 &amp; 신수 (Health Deep Dive)</span>
              <h2 className="font-myeongjo text-2xl font-bold text-[#1A1A1A]">조심할 질병수와 활력 충전 건강 처방</h2>
              <div className="w-16 h-0.5 bg-[#A3845B]/30 mx-auto my-1" />
            </div>
            <div className="bg-white border border-[#E2DDD5] rounded-lg p-6 space-y-5 shadow-sm text-xs leading-relaxed font-light text-gray-700 font-traditional">
              <p>
                병오년의 강렬한 불꽃 기운은 상체 상열감, 심혈관계 만성 피로, 안구 건조증을 유발하기 쉽습니다. 특히 체내 수분이 마르는 극심한 더위 시기(음력 5월)에는 탈수 및 무리한 장거리 야외 활동을 삼가야 합니다.
              </p>
              
              <div className="bg-[#FAF8F5] border border-[#E2DDD5]/60 rounded-xl p-4 space-y-3">
                <span className="font-bold text-xs text-[#8A6F4C] block">📊 신체 에너지 밸런스</span>
                <div className="grid grid-cols-2 gap-4 text-[9px] font-semibold text-gray-700">
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span>심혈관 과열 피로도</span>
                      <span className="text-red-700">85%</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-red-500 rounded-full" style={{ width: "85%" }} />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span>신·방광 음액 보습도</span>
                      <span className="text-emerald-700">40%</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-600 rounded-full" style={{ width: "40%" }} />
                    </div>
                  </div>
                </div>
              </div>
              <p className="bg-[#FAF7F0] p-3.5 rounded border border-[#E2DDD5]/60">
                🥗 <strong>건강 솔루션:</strong> 찬물 샤워보다는 따뜻한 물 족욕을 통해 머리의 열을 발아래로 끌어내리는 수승화강을 실천하시고, 물을 하루 1.5리터 이상 자주 드십시오.
              </p>
            </div>
          </div>
        );

      case "tj_monthly": {
        const mNum = page.monthNum;
        const data = getMonthlyFortuneData(mNum, sajuInfo?.day?.stemEl || "목");
        const stars = "★".repeat(Math.round(data.score / 20)) + "☆".repeat(5 - Math.round(data.score / 20));
        
        return (
          <div className="space-y-6 py-4">
            <div className="text-center space-y-2 mb-8">
              <span className="text-xs text-[#A3845B] font-bold block">월별 상세 운세 (Monthly Timeline)</span>
              <h2 className="font-myeongjo text-2xl font-bold text-[#1A1A1A]">음력 {mNum}월 토정비결 상세 해설</h2>
              <div className="w-16 h-0.5 bg-[#A3845B]/30 mx-auto my-1" />
            </div>
            
            <div className="bg-[#FAF8F5] border border-[#E2DDD5] rounded-xl p-5 space-y-3 text-center shadow-inner">
              <span className="text-[10px] text-[#A3845B] font-bold block">음력 {mNum}월 길흉 지수</span>
              <div className="text-xl text-[#8B221E] tracking-widest font-bold">{stars}</div>
              <p className="font-myeongjo text-xs font-bold text-gray-800 leading-snug pt-1 border-t border-[#E2DDD5]/40 max-w-xs mx-auto">
                "{data.summary}"
              </p>
            </div>

            <div className="bg-white border border-[#E2DDD5] rounded-lg p-6 space-y-5 shadow-sm text-xs leading-relaxed font-light text-gray-700 font-traditional">
              <div className="space-y-1">
                <span className="font-bold text-[#8A6F4C] block">🔍 本월 흐름 정밀 분석</span>
                <p className="text-justify font-light text-gray-600 bg-white p-3 rounded border border-gray-100">
                  {data.analysis}
                </p>
              </div>
              <div className="space-y-1">
                <span className="font-bold text-[#8A6F4C] block">💡 이번 달 행동 개운 수칙</span>
                <p className="text-justify font-light text-gray-600 bg-[#FAF7F0]/40 p-3 rounded border border-[#E2DDD5]/40">
                  {data.tactics}
                </p>
              </div>
            </div>
          </div>
        );
      }

      case "tj_action_plan": {
        const dayStemEl = sajuInfo?.day?.stemEl || "목";
        const presets = {
          "목": { color: "청색 (Green)", number: "3, 8", direction: "동쪽 (East)", items: "나무 소재 키링, 아로마 수목 향수" },
          "화": { color: "적색 (Red)", number: "2, 7", direction: "남쪽 (South)", items: "가죽 카드 홀더, 우디 캔들" },
          "토": { color: "황색 (Yellow)", number: "5, 10", direction: "중앙 (Center)", items: "도자기 머그컵, 오렌지 립밤" },
          "금": { color: "백색 (White)", number: "4, 9", direction: "서쪽 (West)", items: "메탈 스냅 시계, 실버 액세서리" },
          "수": { color: "흑색 (Black)", number: "1, 6", direction: "북쪽 (North)", items: "어두운 네이비 의상, 미네랄 워터 미스트" }
        }[dayStemEl] || { color: "황색", number: "5, 10", direction: "중앙", items: "소품" };

        return (
          <div className="space-y-6 py-4">
            <div className="text-center space-y-2 mb-8">
              <span className="text-xs text-[#A3845B] font-bold block">개운 솔루션 (Action Plan)</span>
              <h2 className="font-myeongjo text-2xl font-bold text-[#1A1A1A]">기운을 상승시키는 신년 맞춤 실천 가이드</h2>
              <div className="w-16 h-0.5 bg-[#A3845B]/30 mx-auto my-1" />
            </div>
            
            <div className="bg-white border border-[#E2DDD5] rounded-lg p-6 space-y-6 shadow-sm text-xs leading-relaxed font-light text-gray-700 font-traditional">
              <p>
                사주의 비대칭적 기운을 보강하고 나쁜 액운을 지혜롭게 제어하기 위한 일상 속의 오행 치유 실천 행동 요령입니다.
              </p>
              
              <div className="border border-[#E2DDD5] rounded-xl overflow-hidden shadow-sm">
                <div className="bg-[#FAF7F0] p-3 text-center border-b border-[#E2DDD5] font-bold text-[#8A6F4C]">
                  🍀 {name}님만을 위한 올해의 행운 처방 조견표
                </div>
                <div className="p-4 space-y-3 bg-white text-[11px] text-gray-700 leading-normal">
                  <p><strong>• 행운의 색상:</strong> <span className="font-semibold text-emerald-800">{presets.color}</span></p>
                  <p><strong>• 행운의 숫자:</strong> <span className="font-semibold text-amber-800">{presets.number}</span></p>
                  <p><strong>• 행운의 방향:</strong> <span className="font-semibold text-blue-800">{presets.direction}</span></p>
                  <p><strong>• 행운의 아이템:</strong> <span className="font-semibold text-gray-800">{presets.items}</span></p>
                </div>
              </div>
              <p className="bg-[#FAF7F0]/40 p-4 rounded-xl border border-[#E2DDD5]/60 text-justify text-[11px] leading-relaxed">
                📢 결과가 기대에 미치지 못하더라도, 개운이란 <strong>나의 마음가짐과 일상 환경을 긍정의 주파수로 다듬는 주체적인 노력</strong>입니다. 행운의 소품과 컬러를 의복이나 가방, 집무 공간에 곁에 두고 실천할 때 비로소 닫혔던 행운의 빗장이 활짝 열리게 됩니다.
              </p>
            </div>
          </div>
        );
      }

      case "tj_warning_advice": {
        const dayStemEl = sajuInfo?.day?.stemEl || "목";
        const warningInfo = {
          "목": { place: "습하고 바람이 강하게 부는 협곡이나 지하 터널", surname: "금(金) 성향을 지닌 성씨 (경, 신, 민, 유 씨 등)", behavior: "주변인과의 동업 서명 및 섣부른 구두 보증" },
          "화": { place: "화재나 인화 물질이 범람하는 주방, 사우나, 유흥가", surname: "수(Water) 성향을 지닌 성씨 (임, 계, 조, 하 씨 등)", behavior: "홧김에 던지는 이직 발언 및 충동적 감정 표출" },
          "토": { place: "토사가 무너질 염려가 있거나 먼지가 자욱한 공사장", surname: "목(木) 성향을 지닌 성씨 (갑, 을, 임, 박 씨 등)", behavior: "타인과의 구설에 동조하여 뒷얘기를 함께 나누는 행동" },
          "금": { place: "차가운 에어컨 바람에 종일 노출되는 골방이나 금속 가구점", surname: "화(火) 성향을 지닌 성씨 (병, 정, 오, 최 씨 등)", behavior: "피로가 누적된 상태에서의 무리한 중장거리 운전" },
          "수": { place: "물살이 세차게 소용돌이치는 깊은 저수지나 밤의 낚시터", surname: "토(土) 성향을 지닌 성씨 (무, 기, 황, 배 씨 등)", behavior: "가까운 지인과의 금전 단기 차용 및 동업 서명" }
        }[dayStemEl] || { place: "사람이 지나치게 붐비는 야외", surname: "조심할 성씨", behavior: "충동적인 결정" };

        return (
          <div className="space-y-6 py-4">
            <div className="text-center space-y-2 mb-8">
              <span className="text-xs text-[#A3845B] font-bold block">조심할 점 &amp; 이지함의 한마디</span>
              <h2 className="font-myeongjo text-2xl font-bold text-[#1A1A1A]">올해의 위험 예방 수칙과 토정 이지함의 위로</h2>
              <div className="w-16 h-0.5 bg-[#A3845B]/30 mx-auto my-1" />
            </div>
            
            <div className="bg-white border border-[#E2DDD5] rounded-lg p-6 space-y-5 shadow-sm text-xs leading-relaxed font-light text-gray-700 font-traditional">
              <div className="bg-rose-50/20 border border-rose-100 rounded-xl p-4 space-y-2.5 text-[11px] leading-relaxed text-rose-950">
                <span className="font-bold text-rose-800 block">⚠️ 2026년 극도로 경계해야 할 3대 악재 요인</span>
                <p><strong>• 피해야 할 장소:</strong> {warningInfo.place}</p>
                <p><strong>• 상극인 성씨:</strong> {warningInfo.surname}</p>
                <p><strong>• 경계할 행동:</strong> {warningInfo.behavior}</p>
              </div>

              {/* 토정 이지함의 명언 카드 */}
              <div className="border-2 border-double border-[#A3845B] bg-[#1C1613] text-[#FAF7F0] rounded-xl p-5 text-center space-y-3 shadow-md relative overflow-hidden">
                <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-[#A3845B]/60" />
                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-[#A3845B]/60" />
                <span className="text-[9px] tracking-widest text-[#A3845B] block font-myeongjo">— 土亭 李之菡 寶鑑 —</span>
                <p className="font-myeongjo text-[11px] font-semibold text-white leading-relaxed italic">
                  "운명이 맑은 하늘에 비를 뿌려 귀하를 적시는 것은, 머지않아 더 넓고 깊은 대지 위로 찬란한 꽃을 피워 올리기 위함이니라. 흔들릴지언정 꺾이지 마라."
                </p>
                <span className="text-[9px] text-[#A3845B]/80 block font-traditional">💡 혜안당 현대적 위로와 조언</span>
              </div>
            </div>
          </div>
        );
      }

      case "tj_fengshui":
        return (
          <div className="space-y-6 py-4">
            <div className="text-center space-y-2 mb-8">
              <span className="text-xs text-[#A3845B] font-bold block">공간 풍수 (地理 處方)</span>
              <h2 className="font-myeongjo text-2xl font-bold text-[#1A1A1A]">병오년 화기를 가라앉히는 신년 공간 인테리어</h2>
              <div className="w-16 h-0.5 bg-[#A3845B]/30 mx-auto my-1" />
            </div>
            <div className="bg-white border border-[#E2DDD5] rounded-lg p-6 space-y-4 shadow-sm text-xs leading-relaxed font-light text-gray-700 font-traditional">
              <p>
                대지와 가구 배치를 뜻하는 <strong>지리(地理)</strong> 처방입니다. 병오년에는 집안의 <strong>북쪽 영역</strong>에 맑고 시원한 기운(수기)이 순환해야 재물운이 안정됩니다.
              </p>
              <div className="bg-[#FAF8F5] border border-[#E2DDD5]/60 p-4 rounded-xl space-y-2.5 text-[11px] leading-relaxed">
                <p>• 침대 머리 방향을 차가운 수기를 뿜는 북쪽 또는 서쪽으로 두어 숙면을 도모하십시오.</p>
                <p>• 거실이나 집무실의 중심에 메탈 스틸 소품이나 크리스탈 유리 공예품을 배치하여 공간 열기를 냉각시키십시오.</p>
              </div>
            </div>
          </div>
        );

      case "tj_lucky_items":
        return (
          <div className="space-y-6 py-4">
            <div className="text-center space-y-2 mb-8">
              <span className="text-xs text-[#A3845B] font-bold block">수호 소품 (吉祥 裝飾)</span>
              <h2 className="font-myeongjo text-2xl font-bold text-[#1A1A1A]">의뢰인을 지켜주는 수호 행운 소품 리스트</h2>
              <div className="w-16 h-0.5 bg-[#A3845B]/30 mx-auto my-1" />
            </div>
            <div className="bg-white border border-[#E2DDD5] rounded-lg p-6 space-y-4 shadow-sm text-xs leading-relaxed font-light text-gray-700 font-traditional">
              <p>
                의뢰인의 일간 오행과 올해 세운의 부딪힘을 예방해주는 최적의 수호 소품 가이드입니다.
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#FAF7F0] p-4 rounded-xl border border-[#E2DDD5]/60 space-y-1.5">
                  <span className="font-bold text-[#8A6F4C] text-[11px] block">💎 천연 흑요석 또는 오닉스</span>
                  <p className="text-[10px] text-gray-500 font-light leading-normal">어두운 색상의 돌 소품은 불안한 액운을 차단하고 든든한 보호막이 되어 줍니다.</p>
                </div>
                <div className="bg-[#FAF7F0] p-4 rounded-xl border border-[#E2DDD5]/60 space-y-1.5">
                  <span className="font-bold text-[#8A6F4C] text-[11px] block">⌚ 메탈 실버 스틸 제품</span>
                  <p className="text-[10px] text-gray-500 font-light leading-normal">금속 성질의 소품은 판단력을 선명하게 하고 직무 상 명예운을 수호합니다.</p>
                </div>
              </div>
            </div>
          </div>
        );

      case "tj_diet":
        return (
          <div className="space-y-6 py-4">
            <div className="text-center space-y-2 mb-8">
              <span className="text-xs text-[#A3845B] font-bold block">오행 섭생 (五行 攝生)</span>
              <h2 className="font-myeongjo text-2xl font-bold text-[#1A1A1A]">신진대사를 돕는 오행 섭생 음식 처방</h2>
              <div className="w-16 h-0.5 bg-[#A3845B]/30 mx-auto my-1" />
            </div>
            <div className="bg-white border border-[#E2DDD5] rounded-lg p-6 space-y-4 shadow-sm text-xs leading-relaxed font-light text-gray-700 font-traditional">
              <p>
                오장육부의 상열감과 피로를 낮추기 위한 약선 음식 섭생 처방입니다.
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-emerald-50/40 border border-emerald-100 p-4 rounded-xl space-y-1.5">
                  <span className="font-bold text-emerald-800 text-[11px] block">🟢 추천 식재료</span>
                  <p className="text-[10px] text-emerald-950 font-light leading-normal">수박, 참외, 브로콜리, 검은콩차, 해조류 등 체내 열을 내리고 수분을 채우는 시원한 약선 요리</p>
                </div>
                <div className="bg-rose-50/40 border border-rose-100 p-4 rounded-xl space-y-1.5">
                  <span className="font-bold text-rose-800 text-[11px] block">🔴 주의할 음식</span>
                  <p className="text-[10px] text-rose-950 font-light leading-normal">고도수의 음주, 극도로 매운 자극적인 음식, 과도하게 탄 고기 등 체내 화기를 극대화하는 성질</p>
                </div>
              </div>
            </div>
          </div>
        );

      case "tj_roadmap_2027":
        return (
          <div className="space-y-6 py-4">
            <div className="text-center space-y-2 mb-8">
              <span className="text-xs text-[#A3845B] font-bold block">3개년 로드맵 (2027)</span>
              <h2 className="font-myeongjo text-2xl font-bold text-[#1A1A1A]">2027년 정미년(丁未年) 세운 로드맵</h2>
              <div className="w-16 h-0.5 bg-[#A3845B]/30 mx-auto my-1" />
            </div>
            <div className="bg-white border border-[#E2DDD5] rounded-lg p-6 space-y-4 shadow-sm text-xs leading-relaxed font-light text-gray-700 font-traditional">
              <p>
                2027년 정미년(丁未年)은 병오년의 불꽃이 흙(土)의 기운을 만나 열기를 수축하고 가두어 두는 <strong>화생토(火生土)의 완환기</strong>를 상징합니다. 
              </p>
              <p>
                올해 벌여두었던 여러 사안들이 마침내 법적인 계약이나 직급 상승, 자격증 획득 등의 문서상 실익으로 귀결되는 시점입니다. 서투른 확장보다는 2026년에 제련해둔 결실을 안정적인 자기 권리로 확고히 하기에 아주 유리한 한 해가 될 것입니다.
              </p>
            </div>
          </div>
        );

      case "tj_roadmap_2028":
        return (
          <div className="space-y-6 py-4">
            <div className="text-center space-y-2 mb-8">
              <span className="text-xs text-[#A3845B] font-bold block">3개년 로드맵 (2028)</span>
              <h2 className="font-myeongjo text-2xl font-bold text-[#1A1A1A]">2028년 무신년(戊申年) 세운 로드맵</h2>
              <div className="w-16 h-0.5 bg-[#A3845B]/30 mx-auto my-1" />
            </div>
            <div className="bg-white border border-[#E2DDD5] rounded-lg p-6 space-y-4 shadow-sm text-xs leading-relaxed font-light text-gray-700 font-traditional">
              <p>
                2028년 무신년(戊申年)은 드디어 차가운 금(金)의 기운이 하늘과 땅에 가득 차오르는 <strong>수확과 경제적 결실의 원년</strong>입니다.
              </p>
              <p>
                그동안 묶여있던 현금 흐름에 강한 활로가 뚫리며 실질적인 투자 수익이나 영업 이익이 발생합니다. 적극적인 추진력을 단행하여 목돈을 쟁취하고 자산 포트폴리오를 다변화하기에 평생에 몇 안 되는 중요한 골든타임이 도래합니다.
              </p>
            </div>
          </div>
        );

      case "tj_roadmap_2029":
        return (
          <div className="space-y-6 py-4">
            <div className="text-center space-y-2 mb-8">
              <span className="text-xs text-[#A3845B] font-bold block">3개년 로드맵 (2029)</span>
              <h2 className="font-myeongjo text-2xl font-bold text-[#1A1A1A]">2029년 기유년(己酉年) 세운 로드맵</h2>
              <div className="w-16 h-0.5 bg-[#A3845B]/30 mx-auto my-1" />
            </div>
            <div className="bg-white border border-[#E2DDD5] rounded-lg p-6 space-y-4 shadow-sm text-xs leading-relaxed font-light text-gray-700 font-traditional">
              <p>
                2029년 기유년(己酉年)은 단단한 원석이 다정한 보석으로 매끄럽게 다듬어지는 <strong>인맥 및 대외 명예 완성의 해</strong>입니다.
              </p>
              <p>
                귀하를 따르는 신뢰할 수 있는 부하 동료나 협력 파트너가 늘어나며 직장 내 승진의 종착지에 도달하게 됩니다. 무리한 모험을 단행하기보다 쟁취해낸 번영의 영토를 보수적으로 수비하고 건강에 깊게 집중하는 자세가 최고의 전략입니다.
              </p>
            </div>
          </div>
        );

      case "tj_final_blessing":
        return (
          <div className="text-center space-y-12 py-16 bg-[#FDFBF7] border border-[#E2DDD5]/80 rounded-lg p-8 shadow-inner relative min-h-[400px]">
            <div className="space-y-4">
              <span className="text-xs tracking-[0.35em] text-[#A3845B] font-bold block font-myeongjo">— 慧眼堂 寶鑑 —</span>
              <div className="w-24 h-0.5 bg-[#A3845B]/40 mx-auto" />
            </div>
            <div className="space-y-6 py-8">
              <h1 className="font-myeongjo text-2xl md:text-3xl font-extrabold text-[#1A1A1A] leading-normal">
                병오년 성공 기원 최종 축원문 (祝願文)
              </h1>
              <p className="text-xs text-[#5F5F5F] font-light tracking-wide leading-relaxed font-traditional max-w-md mx-auto text-justify">
                천지합화의 불꽃 기운이 의뢰인 <strong>{name}</strong>님의 앞길을 환히 비추는 빛이 되어, 흉한 액난은 모두 불길 속으로 소멸하고 오직 성공의 금빛 복록만이 굳건하게 영글기를 혜안당 명리연구소의 정성을 담아 간절히 기원합니다. 다가올 한 해 모든 선택의 기로에서 평화와 용기가 함께하시길 축원합니다.
              </p>
            </div>
            <div className="space-y-2 pt-12">
              <span className="font-myeongjo text-sm font-bold text-[#1A1A1A]">慧眼堂 명리연구소 소장 배상</span>
            </div>
            
            {/* 혜안당 공식 직인 */}
            <div className="absolute right-8 bottom-8 select-none opacity-80">
              <svg viewBox="0 0 60 60" className="w-[45px] h-[45px] transform -rotate-12">
                <rect x="5" y="5" width="50" height="50" rx="3" fill="none" stroke="#8B221E" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="30 1 10 1" />
                <text x="30" y="24" textAnchor="middle" fontSize="12" fontWeight="900" fill="#8B221E" fontFamily="font-myeongjo" letterSpacing="0.5">
                  慧眼
                </text>
                <text x="30" y="41" textAnchor="middle" fontSize="12" fontWeight="900" fill="#8B221E" fontFamily="font-myeongjo" letterSpacing="0.5">
                  堂인
                </text>
              </svg>
            </div>
          </div>
        );
`;

if (content.includes(switchTarget)) {
  content = content.replace(switchTarget, switchReplacement);
  console.log("-> tj_* page.type cases injected successfully.");
} else {
  console.error("switchTarget not found!");
  process.exit(1);
}

// 4. renderSmsNewYearContent 치환
const smsFunctionTarget = '  const renderSmsNewYearContent = () => {';
const smsFunctionReplacement = `  const renderSmsNewYearContent = () => {
    // 만약 토정비결일 경우 2페이지 요약본으로 분기 렌더링
    if (typeParam === "tojeong") {
      const decodedWorry = worryText ? decodeURIComponent(worryText) : "";
      const worrySolutionText = decodedWorry
        ? \`귀하의 고민 [\${decodedWorry}]에 대해:\\n올해는 병오년의 조급한 화(火) 기운으로 인해 성급히 판단하면 그르치기 쉽습니다. 가을철(음력 8월) 이전까지는 중요한 결정을 유보하고, 현상을 안정적으로 유지하며 에너지를 실속 있게 다지는 것이 가장 유리합니다.\`
        : "올해 고민 솔루션:\\n올해는 조급한 감정적 충동을 억제하고 정중동(靜中動)의 자세를 유지하는 것이 좋습니다. 특히 가을 이전에는 서투른 확장을 피해 손재수를 차단하십시오.";

      const elStats = \`목(\${sajuInfo.elements.목}개) | 화(\${sajuInfo.elements.화}개) | 토(\${sajuInfo.elements.토}개) | 금(\${sajuInfo.elements.금}개) | 수(\${sajuInfo.elements.수}개)\`;

      return (
        <div className="space-y-12 print:space-y-0">
          {/* SMS PAGE 1 - 운세 기조 및 4대 분야 요약 */}
          <div className="print-page-wrapper relative min-h-[1100px] flex flex-col justify-between bg-[#FDFBF7] border border-[#E2DDD5] rounded-xl p-2 shadow-md print:border-none print:shadow-none print:p-0 print:m-0 print:min-h-screen">
            <div className="border border-[#E2DDD5]/60 rounded-lg p-6 h-full flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center border-b border-[#E2DDD5]/50 pb-2 mb-6 print:mb-8">
                  <span className="text-[10px] font-bold text-[#A3845B] tracking-wider font-myeongjo">慧眼堂 寶鑑 · 토정비결 요약</span>
                  <span className="text-[9px] text-gray-400 font-light font-traditional">1. 세운 기조 및 4대 분야 요약</span>
                </div>

                <div className="space-y-5">
                  <div className="text-center py-4 space-y-2">
                    <span className="text-xs text-[#A3845B] tracking-widest font-bold block font-myeongjo">— 2026 丙午年 —</span>
                    <h2 className="font-myeongjo text-3xl font-bold text-[#1A1A1A] tracking-wide">{name} 님 토정비결 요약</h2>
                    <div className="w-20 h-0.5 bg-[#A3845B]/40 mx-auto mt-1" />
                  </div>

                  {/* 병오년 세운 기조 */}
                  <div className="bg-white border border-[#E2DDD5] rounded-xl p-5 space-y-3.5 shadow-sm">
                    <span className="font-bold text-[#A3845B] text-xs block font-myeongjo">■ 1. 2026년 병오년 세운 기조</span>
                    <div className="text-xs text-[#5F5F5F] font-light leading-relaxed space-y-1.5">
                      <p><strong>• 세운 특징:</strong> <span className="font-semibold text-[#A3845B]">천지합화(天地合火)</span> - 위아래가 모두 거대한 불꽃으로 화하는 역동적 한 해입니다.</p>
                      <p><strong>• 오행 분포:</strong> <span className="font-semibold text-gray-700">{elStats}</span></p>
                    </div>
                  </div>

                  {/* 4대 분야별 심층 요약 카드 */}
                  <div className="space-y-3">
                    <span className="font-bold text-[#A3845B] text-xs block font-myeongjo">■ 2. 4대 핵심 분야 운세 요약</span>
                    <div className="grid grid-cols-2 gap-3 text-[10px]">
                      <div className="bg-white p-3.5 rounded-xl border border-[#E2DDD5]/60 space-y-1 shadow-sm">
                        <span className="font-bold text-amber-800 block">① 재물운 (Wealth)</span>
                        <p className="text-gray-500 leading-normal font-light">가을철(음력 7~9월) 금(金)의 수축기에 재물이 쌓이는 구조입니다. 상반기 투자는 절대 금물입니다.</p>
                      </div>
                      <div className="bg-white p-3.5 rounded-xl border border-[#E2DDD5]/60 space-y-1 shadow-sm">
                        <span className="font-bold text-blue-800 block">② 직장운 (Career)</span>
                        <p className="text-gray-500 leading-normal font-light">윗사람이나 선배(귀인)의 천거가 예상되며 이직/승진 기회는 음력 3, 8월에 집중됩니다.</p>
                      </div>
                      <div className="bg-white p-3.5 rounded-xl border border-[#E2DDD5]/60 space-y-1 shadow-sm">
                        <span className="font-bold text-rose-800 block">③ 애정운 (Love)</span>
                        <p className="text-gray-500 leading-normal font-light">하반기에 차분하고 지적인 인연운이 들며, 기혼자는 상반기 감정 충동 대립을 경계하십시오.</p>
                      </div>
                      <div className="bg-white p-3.5 rounded-xl border border-[#E2DDD5]/60 space-y-1 shadow-sm">
                        <span className="font-bold text-emerald-800 block">④ 건강운 (Health)</span>
                        <p className="text-gray-500 leading-normal font-light">상열감, 심혈관계 피로가 늘기 쉽습니다. 수분을 자주 섭취하고 족욕을 생활화하십시오.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 하단 푸터 */}
              <div className="relative pt-6 border-t border-[#E2DDD5]/50 flex justify-between items-center text-[9px] text-[#5F5F5F] mt-6">
                <span className="font-myeongjo font-light">慧眼堂 寶鑑 · 병오년 토정비결 요약</span>
                <span className="font-myeongjo font-bold">1 / 2</span>
              </div>
            </div>
          </div>

          {/* SMS PAGE 2 - 12개월 타임라인 및 솔루션 */}
          <div className="print-page-wrapper relative min-h-[1100px] flex flex-col justify-between bg-[#FDFBF7] border border-[#E2DDD5] rounded-xl p-2 shadow-md print:border-none print:shadow-none print:p-0 print:m-0 print:min-h-screen">
            <div className="border border-[#E2DDD5]/60 rounded-lg p-6 h-full flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center border-b border-[#E2DDD5]/50 pb-2 mb-6 print:mb-8">
                  <span className="text-[10px] font-bold text-[#A3845B] tracking-wider font-myeongjo">慧眼堂 寶鑑 · 토정비결 요약</span>
                  <span className="text-[9px] text-gray-400 font-light font-traditional">2. 월별 타임라인 및 처방</span>
                </div>

                <div className="space-y-5">
                  {/* 12개월 타임라인 핵심 요약 */}
                  <div className="bg-white border border-[#E2DDD5] rounded-xl p-4 space-y-3 shadow-sm">
                    <span className="font-bold text-[#A3845B] text-xs block font-myeongjo">■ 3. 12개월 월별 길흉 지수 요약</span>
                    <div className="grid grid-cols-4 gap-2 text-[9px] text-center">
                      {[
                        { m: 1, s: "★★★★☆" }, { m: 2, s: "★★★☆☆" }, { m: 3, s: "★★★★☆" }, { m: 4, s: "★★★☆☆" },
                        { m: 5, s: "★★☆☆☆" }, { m: 6, s: "★★★☆☆" }, { m: 7, s: "★★★★☆" }, { m: 8, s: "★★★★★" },
                        { m: 9, s: "★★★★☆" }, { m: 10, s: "★★★★☆" }, { m: 11, s: "★★★☆☆" }, { m: 12, s: "★★★★☆" }
                      ].map(item => (
                        <div key={item.m} className="bg-[#FAF8F5] p-1.5 rounded border border-[#E2DDD5]/45">
                          <span className="font-bold block text-gray-700">음력 {item.m}월</span>
                          <span className="text-red-700 text-[8px] tracking-tighter block mt-0.5">{item.s}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 올해의 개운 솔루션 & 조언 */}
                  <div className="grid grid-cols-2 gap-3 text-[10px]">
                    <div className="border border-[#E2DDD5] rounded-xl p-4 bg-white shadow-sm space-y-2">
                      <span className="font-bold text-[#A3845B] block font-myeongjo">🍀 4. 행운의 개운 비법</span>
                      <div className="text-[9px] text-gray-500 space-y-1 font-light leading-normal">
                        <p><strong>• 행운의 색상/숫자:</strong> 백색, 흑색 / 1, 4, 6, 9</p>
                        <p><strong>• 행운의 방향:</strong> 서쪽, 북쪽</p>
                        <p><strong>• 수호 아이템:</strong> 메탈 시계, 실버 펄, 어두운 네이비 의류</p>
                      </div>
                    </div>
                    <div className="border border-[#E2DDD5] rounded-xl p-4 bg-white shadow-sm space-y-2">
                      <span className="font-bold text-[#A3845B] block font-myeongjo">🔑 5. 맞춤 고민 처방</span>
                      <p className="text-[9px] text-gray-500 font-light leading-relaxed text-justify">
                        {worrySolutionText}
                      </p>
                    </div>
                  </div>

                  {/* 고급 리포트 업그레이드 CTA 배너 */}
                  <div className="border-2 border-double border-[#A3845B] bg-[#1C1613] text-[#FAF7F0] rounded-xl p-5 shadow-lg text-center space-y-3 mt-4 print:hidden">
                    <span className="text-[9px] tracking-widest text-[#A3845B] block font-myeongjo">— 혜안당 정밀 분석 추가 제안 —</span>
                    <h4 className="font-myeongjo text-xs font-bold text-white leading-normal max-w-xs mx-auto">
                      {name}님을 위한 30페이지 분량의 심층 분석 전체가 포함된 고급 리포트가 대기하고 있습니다.
                    </h4>
                    <button
                      type="button"
                      onClick={() => handleUpgradeFromSms("premium", 15000)}
                      className="w-full py-3 bg-[#A3845B] hover:bg-[#8A6F4C] text-[#1C1613] rounded font-bold text-[11px] shadow transition-all cursor-pointer"
                    >
                      👑 정통 토정비결 고급 리포트 업그레이드 (+15,000원) →
                      <span className="block text-[8px] font-normal text-[#1C1613]/70 mt-0.5">30페이지 전체 풀이 및 조언 즉시 해제</span>
                    </button>
                    <div className="flex justify-center gap-4 text-[9px] text-gray-400">
                      <p>✓ 결제 즉시 페이지가 새로고침되어 잠금이 해제됩니다.</p>
                      <button type="button" onClick={() => setIsPaid(true)} className="hover:text-white underline">
                        [테스트용 즉시 해제]
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* 하단 푸터 및 공식 검증인 낙관 */}
              <div className="relative pt-6 border-t border-[#E2DDD5]/50 flex justify-between items-center text-[9px] text-[#5F5F5F] mt-6">
                <div className="space-y-0.5">
                  <span className="font-myeongjo font-light block">慧眼堂 寶鑑 · 병오년 토정비결 요약</span>
                  <span className="font-sans text-gray-400">Copyright © 慧眼堂 명리연구소 All Rights Reserved.</span>
                </div>
                <span className="font-myeongjo font-bold pr-12">2 / 2</span>
                
                {/* 혜안당 공식 낙관 */}
                <div className="absolute right-0 bottom-2 select-none">
                  <svg viewBox="0 0 60 60" className="w-[36px] h-[36px] transform -rotate-12">
                    <rect x="5" y="5" width="50" height="50" rx="3" fill="none" stroke="#8B221E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="30 1 10 1" />
                    <text x="30" y="24" textAnchor="middle" fontSize="12" fontWeight="900" fill="#8B221E" fontFamily="font-myeongjo" letterSpacing="0.5">
                      慧眼
                    </text>
                    <text x="30" y="41" textAnchor="middle" fontSize="12" fontWeight="900" fill="#8B221E" fontFamily="font-myeongjo" letterSpacing="0.5">
                      堂인
                    </text>
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    const lacks = prescriptions.map(p => p.name.split(" - ")[0]).join(", ");`;

if (content.includes(smsFunctionTarget)) {
  content = content.replace(smsFunctionTarget, smsFunctionReplacement);
  console.log("-> renderSmsNewYearContent branching added successfully.");
} else {
  console.error("smsFunctionTarget not found!");
  process.exit(1);
}

fs.writeFileSync(filePath, content, 'utf8');
console.log("=== All Tojeongbi-gyeol 30 Pages & SMS 2 Pages Modifications Completed Successfully! ===");
