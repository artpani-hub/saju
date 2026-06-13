const fs = require('fs');
const path = require('path');

const filePath = path.join('d:', '인터그리비티', 'saju', 'src', 'app', 'result', 'components', 'renderNewYearPageContent.js');
const backupPath = path.join('d:', '인터그리비티', 'saju', 'src', 'app', 'result', 'components', 'renderNewYearPageContent.js.bak_ny_4_to_8');

// 1. Read original content
let content = fs.readFileSync(filePath, 'utf8');

// 2. Create backup if not exists
if (!fs.existsSync(backupPath)) {
  fs.writeFileSync(backupPath, content, 'utf8');
  console.log(`Created backup of page.js at: ${backupPath}`);
} else {
  console.log(`Backup already exists at: ${backupPath}`);
}

console.log("=== Enriching New Year Pages 4 ~ 8 ===");

// 헬퍼 함수: case "startCase": ~ case "endCase": 영역 치환
function replaceCase(startCase, endCase, newContent) {
  const startTarget = `case "${startCase}":`;
  const endTarget = `case "${endCase}":`;
  
  const startIdx = content.indexOf(startTarget);
  if (startIdx === -1) {
    throw new Error(`Start case not found: ${startCase}`);
  }
  
  const endIdx = content.indexOf(endTarget, startIdx + startTarget.length);
  if (endIdx === -1) {
    throw new Error(`End case not found: ${endCase}`);
  }
  
  // startIdx 전까지 + 신규 내용 + endIdx 부터 끝까지 결합
  content = content.slice(0, startIdx) + newContent + "\n\n      " + content.slice(endIdx);
  console.log(`Successfully replaced case "${startCase}" -> case "${endCase}"`);
}

// -------------------------------------------------------------
// [신년운세 4페이지] case "ny_daewun_flow": -> case "ny_seoun_analysis":
// -------------------------------------------------------------
const enrichedNyDaewunFlow = `case "ny_daewun_flow": {
        const dayStemElVal = sajuInfo.day.stemEl;
        let harmonyVal = 70;
        let stressVal = 60;
        let opportunityVal = 75;

        if (dayStemElVal === "수" || dayStemElVal === "水") {
          harmonyVal = 85; stressVal = 45; opportunityVal = 90;
        } else if (dayStemElVal === "금" || dayStemElVal === "金") {
          harmonyVal = 75; stressVal = 75; opportunityVal = 80;
        } else if (dayStemElVal === "화" || dayStemElVal === "火") {
          harmonyVal = 50; stressVal = 85; opportunityVal = 55;
        } else if (dayStemElVal === "목" || dayStemElVal === "木") {
          harmonyVal = 65; stressVal = 70; opportunityVal = 70;
        } else {
          harmonyVal = 80; stressVal = 50; opportunityVal = 75;
        }

        return wrapLock(
          <div className="space-y-6 py-4">
            <div className="text-center space-y-2 mb-8">
              <span className="text-xs text-[#A3845B] font-bold block">생애 대운(大運)</span>
              <h2 className="font-myeongjo text-2xl font-bold text-[#1A1A1A]">운명의 거대한 강물, 10년 대운과 신년의 융합</h2>
              <div className="w-16 h-0.5 bg-[#A3845B]/30 mx-auto my-1" />
            </div>

            {/* 프리미엄 시각화 1: 대운-세운 상호작용 에너지 튜브 흐름도 (SVG) */}
            <div className="bg-white border border-[#E2DDD5] rounded-xl p-5 shadow-sm space-y-4">
              <span className="font-bold text-xs text-[#8A6F4C] block">🌀 대운(大運) &amp; 세운(歲運) 에너지 조화 튜브</span>
              <div className="relative h-14 bg-gray-50 rounded-lg flex items-center justify-between px-6 border border-gray-100">
                <div className="flex flex-col text-left">
                  <span className="text-[9px] text-gray-400">10년 주기</span>
                  <span className="text-xs font-bold text-gray-800">대운 환경</span>
                </div>
                <div className="flex-1 mx-4 h-6 relative">
                  <svg className="w-full h-full" viewBox="0 0 100 20" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="tubeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#A3845B" />
                        <stop offset="50%" stopColor="#E2DDD5" />
                        <stop offset="100%" stopColor="#DC2626" />
                      </linearGradient>
                    </defs>
                    <path d="M 0 10 Q 25 2, 50 10 T 100 10" fill="none" stroke="url(#tubeGrad)" strokeWidth="4" strokeLinecap="round" />
                    <circle cx="50" cy="10" r="4" fill="#8B221E" />
                  </svg>
                </div>
                <div className="flex flex-col text-right">
                  <span className="text-[9px] text-gray-400">2026 병오년</span>
                  <span className="text-xs font-bold text-red-600">세운 불꽃</span>
                </div>
              </div>
            </div>

            {/* 프리미엄 시각화 2: 신년 대운 융합 지표 */}
            <div className="bg-[#FAF8F5] border border-[#E2DDD5] rounded-xl p-5 space-y-3">
              <span className="font-bold text-xs text-[#8A6F4C] block">📊 2026 신년 대운 조율 지표</span>
              <div className="space-y-2 text-[9px] font-semibold text-gray-700">
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span>에너지 융합 조화도</span>
                    <span className="text-emerald-700">{harmonyVal}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-600 rounded-full" style={{ width: \`\${harmonyVal}%\` }} />
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span>신년 기회 포착률</span>
                    <span className="text-blue-700">{opportunityVal}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-600 rounded-full" style={{ width: \`\${opportunityVal}%\` }} />
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span>기류 과열 스트레스</span>
                    <span className="text-red-600">{stressVal}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-red-600 rounded-full" style={{ width: \`\${stressVal}%\` }} />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white border border-[#E2DDD5] rounded-lg p-6 space-y-4 shadow-sm text-xs leading-relaxed font-light text-gray-700 font-traditional">
              <p className="text-justify font-light">
                명리학에서 흔히 말하는 대운(大運)이란 '갑자기 찾아오는 엄청나게 좋은 대박 행운'이 아니라, 10년마다 순환하며 바뀌는 <strong>내 인생의 거대한 기후적 환경과 무대</strong>를 의미합니다.
              </p>
              <p className="text-justify font-light">
                쉽게 말해 대운은 내가 운전해 가야 하는 도로의 포장 상태나 계절적 계절(봄·여름·가을·겨울)과 같으며, 매년 들어오는 세운(歲運)은 그 계절 위에서 날씨 변화처럼 매일 요동치는 비바람과 태양에 비유할 수 있습니다. 내가 달리는 고속도로(대운)가 비포장도로라면 아무리 맑은 날씨의 세운을 만나더라도 속도를 내기 어렵고, 도로 상태가 매끄러운 8차선 아스팔트 대운을 지나고 있다면 일시적으로 태풍이나 눈비(나쁜 세운)가 찾아오더라도 가볍게 이겨내며 안정을 유지할 수 있는 이치입니다.
              </p>
              <p className="text-justify font-light">
                의뢰인 {name}님의 현재 10년 대운의 궤적은 2026년 병오년의 맹렬한 불꽃 기류와 만나 인생의 실질적인 전환점과 삶의 우선순위 조정을 강력하게 암시하고 있습니다. 대운의 지지가 나의 사주 균형을 돕는 오행인 수(水)나 금(金) 기운을 다정하게 머금고 있다면 세운의 과도한 화기를 정밀 제어하여 유용한 황동 보검으로 제련해 내는 생애 최고의 번영기가 펼쳐질 것이고, 대운마저 불씨를 자극하는 목(木)이나 화(火) 기류로 치우쳐 있다면 감정적 과열과 돌발 손재수를 방어하는 보수적 수비 전략이 강력하게 요구됩니다.
              </p>
              <div className="bg-[#FAF7F0] p-4 rounded border border-[#E2DDD5]/60 text-center text-[11px] font-semibold text-gray-800">
                💡 내 인생의 대세 대운을 면밀하게 이해하고, 세운의 기후 변화에 유연하게 옷을 갈아입는 자만이 무모한 질주를 차단하고 다가올 10년의 경제적·신체적 안정을 견고하게 수호할 수 있습니다.
              </div>
            </div>
          </div>,
          "생애 대운 흐름과 세운의 융합 분석"
        );
      }`;

// -------------------------------------------------------------
// [신년운세 5페이지] case "ny_seoun_analysis": -> case "ny_stem_harmony":
// -------------------------------------------------------------
const enrichedNySeounAnalysis = `case "ny_seoun_analysis": {
        const speedAngle = -180 + (92 / 100) * 180;
        const rad = speedAngle * Math.PI / 180;
        const needleX = 100 + 60 * Math.cos(rad);
        const needleY = 90 + 60 * Math.sin(rad);

        return wrapLock(
          <div className="space-y-6 py-4">
            <div className="text-center space-y-2 mb-8">
              <span className="text-xs text-[#A3845B] font-bold block">2026 병오년(丙午年)</span>
              <h2 className="font-myeongjo text-2xl font-bold text-[#1A1A1A]">천지합화(天地合火) - 태양과 용광로의 역동적 서사</h2>
              <div className="w-16 h-0.5 bg-[#A3845B]/30 mx-auto my-1" />
            </div>

            {/* 프리미엄 시각화 1: 화기 팽창도 스피도미터 */}
            <div className="bg-white border border-[#E2DDD5] rounded-xl p-5 shadow-sm flex flex-col items-center">
              <span className="font-bold text-xs text-[#8A6F4C] mb-2">🔥 2026 병오년 세운 화기(火氣) 팽창도</span>
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
                  <path d="M 25 90 A 75 75 0 0 1 175 90" fill="none" stroke="url(#gaugeGrad)" strokeWidth="12" strokeLinecap="round" strokeDasharray="235" strokeDashoffset="18" />
                  
                  <circle cx="100" cy="90" r="5" fill="#1A1A1A" />
                  <line x1="100" y1="90" x2={needleX} y2={needleY} stroke="#1A1A1A" strokeWidth="2.5" strokeLinecap="round" />
                  
                  <text x="100" y="80" textAnchor="middle" fontSize="13" fontWeight="bold" fill="#8B221E">92% 극대화</text>
                  <text x="25" y="105" textAnchor="middle" fontSize="8" fill="#9CA3AF">안정</text>
                  <text x="175" y="105" textAnchor="middle" fontSize="8" fill="#EF4444">임계(팽창)</text>
                </svg>
              </div>
              <p className="text-[9px] text-gray-400 font-light mt-1">
                * 올해 천지합화(天地合火) 기운에 의해 우주적 열팽창도가 임계치에 다다라 자아 및 감정이 과열되기 쉽습니다.
              </p>
            </div>

            {/* 프리미엄 시각화 2: 4대 분야별 신년 운세 등급 카드 */}
            <div className="bg-[#FAF8F5] border border-[#E2DDD5] rounded-xl p-5 space-y-3">
              <span className="font-bold text-xs text-[#8A6F4C] block">📊 2026 분야별 길흉 대조 카드</span>
              <div className="grid grid-cols-4 gap-2 text-center text-[9px] font-bold">
                <div className="bg-white border border-[#E2DDD5] p-2.5 rounded shadow-sm">
                  <span className="text-gray-400 block font-normal mb-1">🪙 재물운</span>
                  <span className="bg-emerald-50 text-emerald-800 px-1 py-0.5 rounded block">대길 (大吉)</span>
                </div>
                <div className="bg-white border border-[#E2DDD5] p-2.5 rounded shadow-sm">
                  <span className="text-gray-400 block font-normal mb-1">💼 직업운</span>
                  <span className="bg-blue-50 text-blue-800 px-1 py-0.5 rounded block">상승 (吉)</span>
                </div>
                <div className="bg-white border border-[#E2DDD5] p-2.5 rounded shadow-sm">
                  <span className="text-gray-400 block font-normal mb-1">🌿 건강운</span>
                  <span className="bg-red-50 text-red-800 px-1 py-0.5 rounded block">경고 (凶)</span>
                </div>
                <div className="bg-white border border-[#E2DDD5] p-2.5 rounded shadow-sm">
                  <span className="text-gray-400 block font-normal mb-1">🤝 대인운</span>
                  <span className="bg-amber-50 text-amber-800 px-1 py-0.5 rounded block">조율 (平)</span>
                </div>
              </div>
            </div>

            <div className="bg-white border border-[#E2DDD5] rounded-lg p-6 space-y-4 shadow-sm text-xs leading-relaxed font-light text-gray-700 font-traditional">
              <div className="border-l-4 border-[#8B221E] pl-4 py-1">
                <h4 className="font-myeongjo text-sm font-bold text-gray-800">하늘과 대지를 붉게 태우는 거대한 에너지</h4>
                <p className="text-[11px] text-gray-500 mt-1">천간 丙火(태양)와 지지 午火(용광로)가 일으키는 극단적 양기(陽氣)의 절정</p>
              </div>
              <p className="text-justify font-light">
                2026년 병오년은 하늘의 환하고 눈부신 태양이자 만물을 비추는 순수 불꽃인 <strong>병화(丙火)</strong>와 지상의 거대한 용광로이자 쉬지 않고 거칠게 질주하는 준마인 <strong>오화(午火)</strong>가 위아래로 하나를 이루며 다가오는 격정적인 해입니다. 명리학에서는 이처럼 천간과 지지가 모두 화(火) 기운으로 강력하게 결합한 형세를 <strong>천지합화(天地合火)</strong>라 칭하며, 우주의 팽창력과 열정이 극한에 다다르는 시기로 정의합니다.
              </p>
              <p className="text-justify font-light">
                이 기류 하에서는 온 세상의 라이프사이클 속도가 무서우리만치 빨라집니다. 감추어졌던 어두운 위선이나 묵은 조직의 모순들이 태양 아래 적나라하게 폭로되며 강제적인 개혁과 정리가 단행되고, 문화, 기술, IT 산업에서는 기존 패러다임을 뒤흔드는 파괴적 혁신이 불길처럼 번집니다. 개인 역시 그간 억눌러 왔던 자립심과 열망이 폭발하여 이직, 독립, 새로운 공부나 비즈니스에 도전하고자 하는 마음의 역동성이 최대로 상승하게 됩니다.
              </p>
              <p className="text-justify font-light">
                그러나 과도한 화염은 반드시 주위의 물과 쇠를 메마르게 하고 산을 가뭄에 찌들게 합니다. 심리적인 조급함으로 인해 섣부른 계약서 도장을 찍거나, 분노를 조절하지 못해 소중한 인맥을 태워버릴 리스크가 공존하므로, 타오르는 불길 한가운데에서 차가운 호수 같은 침묵과 정교한 자금 수비 대책을 세워 두는 것만이 올해 약속된 번영과 권세를 완전히 내 것으로 만드는 혜안의 핵심입니다.
              </p>
            </div>
          </div>,
          "병오년 세운 기류 총평"
        );
      }`;

// -------------------------------------------------------------
// [신년운세 6페이지] case "ny_stem_harmony": -> case "ny_ilju_harmony":
// -------------------------------------------------------------
const enrichedNyStemHarmony = `case "ny_stem_harmony": {
        let stemHarmonyDesc = "";
        let relationGraph = null;
        const dayStemEl = sajuInfo.day.stemEl;
        const dayStem = sajuInfo.day.stem;
        
        let harmonyPercent = 80;
        let harmonyText = "안정적 융합";
        let cardBg = "from-[#FAF8F5] to-[#EDE8DE]";
        let badgeColor = "bg-[#A3845B]";

        if (dayStemEl === "목") {
          harmonyPercent = 85; harmonyText = "목생화 (설기 개화)"; cardBg = "from-emerald-50/30 to-[#FAF8F5]"; badgeColor = "bg-[#5F7A68]";
          stemHarmonyDesc = \`의뢰인 \${name}님은 청량한 나무(木)의 일간(\${dayStem}) 기질을 품고 계십니다. 나무가 병오년의 불꽃(화)을 만나면 자신의 잎과 꽃을 흐드러지게 피워내는 '식상(食傷)'의 작용이 일어납니다. 올해는 창의적인 아이디어가 번뜩이고 표현 능력이 극대화되어 나의 매력과 실력을 세상에 널리 알릴 최고의 기회입니다. 새로운 프로젝트의 기획이나 예술적 창작, 그리고 대외적인 마케팅 활동에서 누구보다 눈부신 두각을 나타내게 될 것입니다. 다만, 불이 맹렬해질수록 내 본연의 수분이 빠르게 고갈되므로 감정적 번아웃과 불만족(욱하는 감정)을 슬기롭게 다스려야 합니다. 특히 대인 관계에서 자존심을 앞세우기보다 한 템포 물러서서 상대의 의견을 경청하는 유연성이 올 한 해의 성패를 가를 것입니다.\`;
          relationGraph = (
            <div className="flex items-center justify-center gap-4 py-4 my-2 bg-[#FAF7F0] rounded-lg border border-[#E2DDD5]/50">
              <div className="px-3 py-1 bg-[#5F7A68] text-white rounded font-bold text-xs shadow-sm">나 ({dayStem}木)</div>
              <span className="text-[#A3845B] font-bold text-sm">➔</span>
              <div className="px-2 py-0.5 bg-amber-100 text-amber-900 border border-amber-300 rounded text-[9px] font-semibold">목생화 (식상·발산)</div>
              <span className="text-[#A3845B] font-bold text-sm">➔</span>
              <div className="px-3 py-1 bg-red-600 text-white rounded font-bold text-xs shadow-sm">병오년 (丙火)</div>
            </div>
          );
        } else if (dayStemEl === "화") {
          harmonyPercent = 50; harmonyText = "화기태과 (감정 과열)"; cardBg = "from-red-50/20 to-[#FAF8F5]"; badgeColor = "bg-red-600";
          stemHarmonyDesc = \`의뢰인 \${name}님은 태양 혹은 횃불(화)의 일간(\${dayStem}) 기질을 지니셨습니다. 내 기운과 동일한 병오년의 거대한 불꽃(화)을 조우하여 '비겁(比劫)'이 극에 달하는 주체적인 해가 됩니다. 자신감과 독립심이 극대화되어 신규 사업, 창업, 혹은 강력한 자립을 도모하려는 에너지가 솟구칩니다. 남의 눈치를 보지 않고 오롯이 내 주도하에 판을 짜고 리드할 수 있는 최적의 시기입니다. 다만, 강한 자존심끼리 마주쳐 동료, 배우자와 대립하거나 자만으로 손재수를 입기 쉬우니 한 걸음 양보가 운을 살리는 지름길입니다. 주변 사람들과의 공생을 먼저 고려하고, 지나친 확장을 경계하는 신중함이야말로 솟구치는 불길을 황금으로 바꾸는 연쇠가 될 것입니다.\`;
          relationGraph = (
            <div className="flex items-center justify-center gap-4 py-4 my-2 bg-[#FAF7F0] rounded-lg border border-[#E2DDD5]/50">
              <div className="px-3 py-1 bg-red-500 text-white rounded font-bold text-xs shadow-sm">나 ({dayStem}火)</div>
              <span className="text-[#A3845B] font-bold text-sm">➔</span>
              <div className="px-2 py-0.5 bg-amber-100 text-amber-900 border border-amber-300 rounded text-[9px] font-semibold">비겁중중 (경쟁·자립)</div>
              <span className="text-[#A3845B] font-bold text-sm">➔</span>
              <div className="px-3 py-1 bg-red-600 text-white rounded font-bold text-xs shadow-sm">병오년 (丙火)</div>
            </div>
          );
        } else if (dayStemEl === "토") {
          harmonyPercent = 90; harmonyText = "화생토 (귀인 생조)"; cardBg = "from-[#FAF8F5] to-[#F1ECE1]"; badgeColor = "bg-[#A3845B]";
          stemHarmonyDesc = \`의뢰인 \${name}님은 넉넉한 대지(토)의 일간(\${dayStem}) 기질을 소유하고 계십니다. 불꽃(화)이 흙을 다정하게 익혀주고 단단히 다져주는 '인성(印星)'의 대단히 길한 기류가 도래합니다. 공부, 학업, 국가 고시, 자격증 취득 등 문서상의 경사가 따르며, 나를 후원해 주는 조력자나 은인(귀인)의 등장이 강력하게 보장되는 은혜롭고 든든한 한 해가 될 것입니다. 인생의 중요한 계약서 도장을 찍거나, 부동산 및 문서 형태의 자산을 확보하는 데 최고의 타이밍입니다. 다만, 들어오는 기운이 지나치게 강해지면 스스로 안일함에 빠지거나 행동하지 않고 생각만 많아지는 부작용이 생길 수 있으니, 계획을 세웠다면 지체 없이 실천으로 옮기는 기동력을 발휘하십시오.\`;
          relationGraph = (
            <div className="flex items-center justify-center gap-4 py-4 my-2 bg-[#FAF7F0] rounded-lg border border-[#E2DDD5]/50">
              <div className="px-3 py-1 bg-[#A3845B] text-white rounded font-bold text-xs shadow-sm">나 ({dayStem}土)</div>
              <span className="text-[#A3845B] font-bold text-sm">⇠</span>
              <div className="px-2 py-0.5 bg-amber-100 text-amber-900 border border-amber-300 rounded text-[9px] font-semibold">화생토 (인성·후원)</div>
              <span className="text-[#A3845B] font-bold text-sm">⇠</span>
              <div className="px-3 py-1 bg-red-600 text-white rounded font-bold text-xs shadow-sm">병오년 (丙火)</div>
            </div>
          );
        } else if (dayStemEl === "금") {
          harmonyPercent = 70; harmonyText = "화극금 (명예 제련)"; cardBg = "from-gray-50 to-[#FAF8F5]"; badgeColor = "bg-gray-400 text-gray-900";
          stemHarmonyDesc = \`의뢰인 \${name}님은 단단한 바위나 보석(금)의 일간(\${dayStem}) 기질을 타고나셨습니다. 맹렬한 불꽃(화)이 쇠붙이를 제련하고 쓸모 있는 도구로 다듬는 강력한 '관성(官星)'의 해를 지납니다. 직장에서 중책을 맡아 공적 위상이 올라가거나 승진 및 영전의 기회를 얻게 됩니다. 나의 명예와 신용도가 크게 올라가 주변의 존경을 받는 귀한 시기입니다. 다만 압박감과 책임감이 극에 달해 뼈, 호흡기 계통 건강 관리 및 상사와의 충돌 조절에 만전을 기해야 합니다. 지나친 완벽주의로 스스로를 옥죄기 쉬우니, 일과 휴식의 균형을 엄격하게 관리하고 사소한 실수에는 관대해지는 너그러운 마음가짐이 절대적으로 요구됩니다.\`;
          relationGraph = (
            <div className="flex items-center justify-center gap-4 py-4 my-2 bg-[#FAF7F0] rounded-lg border border-[#E2DDD5]/50">
              <div className="px-3 py-1 bg-gray-400 text-gray-900 rounded font-bold text-xs shadow-sm">나 ({dayStem}金)</div>
              <span className="text-[#A3845B] font-bold text-sm">⇠</span>
              <div className="px-2 py-0.5 bg-red-100 text-red-950 border border-red-300 rounded text-[9px] font-semibold">화극금 (관성·제련)</div>
              <span className="text-[#A3845B] font-bold text-sm">⇠</span>
              <div className="px-3 py-1 bg-red-600 text-white rounded font-bold text-xs shadow-sm">병오년 (丙火)</div>
            </div>
          );
        } else {
          harmonyPercent = 95; harmonyText = "수극화 (재물 쟁취)"; cardBg = "from-slate-50 to-[#FAF8F5]"; badgeColor = "bg-gray-800";
          stemHarmonyDesc = \`의뢰인 \${name}님은 깊고 차가운 물(수)의 일간(\${dayStem}) 기질을 지니고 태어나셨습니다. 차가운 물줄기가 2026년 병오년의 거대한 화기(화)를 통제하고 가두는 '재성(財星)'의 해가 열립니다. 막혔던 현금 흐름이 트이고 투자 소득, 연봉 협상 타결, 횡재수 등 경제적 기회가 요동칩니다. 내 노력의 결실이 눈에 보이는 성과물로 뚜렷하게 환원되는 가장 역동적인 한 해가 될 것입니다. 다만 불을 끄느라 내 수분이 소모되므로 건강을 챙기며 에너지를 완급 조절하십시오. 급격하게 늘어나는 지출이나 감정적 소비를 통제하고, 안정적인 저축 비중을 늘려야 연말에 새어나가는 자금 없이 든든한 금고를 지킬 수 있습니다.\`;
          relationGraph = (
            <div className="flex items-center justify-center gap-4 py-4 my-2 bg-[#FAF7F0] rounded-lg border border-[#E2DDD5]/50">
              <div className="px-3 py-1 bg-gray-800 text-white rounded font-bold text-xs shadow-sm">나 ({dayStem}水)</div>
              <span className="text-[#A3845B] font-bold text-sm">➔</span>
              <div className="px-2 py-0.5 bg-amber-100 text-amber-900 border border-amber-300 rounded text-[9px] font-semibold">수극화 (재성·획득)</div>
              <span className="text-[#A3845B] font-bold text-sm">➔</span>
              <div className="px-3 py-1 bg-red-600 text-white rounded font-bold text-xs shadow-sm">병오년 (丙火)</div>
            </div>
          );
        }

        return wrapLock(
          <div className="space-y-6 py-4">
            <div className="text-center space-y-2 mb-8">
              <span className="text-xs text-[#A3845B] font-bold block">일간(日干)과의 융합</span>
              <h2 className="font-myeongjo text-2xl font-bold text-[#1A1A1A]">나의 타고난 일간과 세운의 융합</h2>
              <div className="w-16 h-0.5 bg-[#A3845B]/30 mx-auto my-1" />
            </div>

            {/* 프리미엄 시각화 1: 천간 융합 시너지 블록판 */}
            <div className={\`bg-gradient-to-br \${cardBg} border-2 border-[#E2DDD5] rounded-xl p-5 shadow-sm space-y-3\`}>
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-gray-800 font-myeongjo">🔮 천간 융합 파동 분석</span>
                <span className={\`text-[9px] text-white px-2 py-0.5 rounded font-bold \${badgeColor}\`}>{harmonyText}</span>
              </div>
              <div className="flex justify-center items-center gap-4 py-2">
                <div className="w-12 h-12 bg-white rounded-full flex flex-col justify-center items-center border-2 border-brass shadow-sm">
                  <span className="text-sm font-bold text-[#1A1A1A] font-myeongjo">{dayStem}</span>
                  <span className="text-[7px] text-gray-400">일간</span>
                </div>
                <div className="h-0.5 w-10 bg-gradient-to-r from-brass to-red-500 relative">
                  <span className="absolute -top-1.5 left-3.5 text-[8px] animate-pulse">⚡</span>
                </div>
                <div className="w-12 h-12 bg-red-500 rounded-full flex flex-col justify-center items-center border-2 border-red-600 shadow-sm text-white">
                  <span className="text-sm font-bold font-myeongjo">丙</span>
                  <span className="text-[7px] opacity-80">세운</span>
                </div>
              </div>
              <div className="space-y-1 text-[9px] font-semibold text-gray-500 pt-1.5">
                <div className="flex justify-between">
                  <span>신년 천간 융합율</span>
                  <span className="text-[#8B221E]">{harmonyPercent}%</span>
                </div>
                <div className="w-full h-1 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-[#8B221E] rounded-full" style={{ width: \`\${harmonyPercent}%\` }} />
                </div>
              </div>
            </div>

            <div className="bg-white border border-[#E2DDD5] rounded-lg p-6 space-y-4 shadow-sm text-xs leading-relaxed font-light text-gray-700 font-traditional">
              <div className="bg-[#FAF7F0] p-4 rounded border border-[#E2DDD5]/60 text-center font-bold text-sm text-[#A3845B]">
                {name}님의 일간: {dayStem} ({dayStemEl}의 기운)
              </div>
              
              {relationGraph}
 
              <p className="mt-4 text-justify font-light text-gray-600">
                {stemHarmonyDesc}
              </p>
            </div>
          </div>,
          "일간 오행과 세운의 융합 분석"
        );
      }`;

// -------------------------------------------------------------
// [신년운세 7페이지] case "ny_ilju_harmony": -> case "ny_elements_balance":
// -------------------------------------------------------------
const enrichedNyIljuHarmony = `case "ny_ilju_harmony": {
        const ilju = sajuInfo.day.stem + sajuInfo.day.branch;
        const dayBranch = sajuInfo.day.branch;
        let relationDesc = "";
        let statusBadge = <span className="bg-blue-100 text-blue-800 border border-blue-200 text-[10px] font-bold px-2 py-0.5 rounded shadow-sm">완만한 조화 (평온)</span>;
        
        let lightColor = "bg-blue-500";
        let borderClass = "border-blue-200";
        let cardBgClass = "bg-blue-50/10";
        let scoreLabel = "안전지대";

        if (dayBranch === "子") {
          relationDesc = "2026년 오화(午火) 세운은 귀하의 일지 자수(子水)와 격렬히 부딪치는 자오충(子午沖)을 유발합니다. 이는 집터, 근무지 이동, 혹은 부부 관계의 급격한 지각변동을 뜻합니다. 흔들림을 두려워하기보다 고여있던 나쁜 습관을 털어내는 계기로 삼으십시오.";
          statusBadge = <span className="bg-red-100 text-red-800 border border-red-200 text-[10px] font-bold px-2 py-0.5 rounded animate-pulse shadow-sm">⚠️ 격렬한 변화 (충살)</span>;
          lightColor = "bg-red-600";
          borderClass = "border-red-300";
          cardBgClass = "bg-red-50/40";
          scoreLabel = "주의경보 (변동수)";
        } else if (dayBranch === "午") {
          relationDesc = "2026년 오화(午火)는 내 일지의 오화와 겹쳐 스스로를 옭아매는 오오자형(午午自刑)을 일으킵니다. 감정 기복이 심해져 섣부른 말이나 행동으로 일을 그르치기 쉬우니 계약 체결 시에는 반드시 타인의 피드백을 한 번 더 거치십시오.";
          statusBadge = <span className="bg-orange-100 text-orange-800 border border-orange-200 text-[10px] font-bold px-2 py-0.5 rounded shadow-sm">⚠️ 스스로 단속 (자형)</span>;
          lightColor = "bg-orange-500";
          borderClass = "border-orange-300";
          cardBgClass = "bg-orange-50/40";
          scoreLabel = "감정단속 (자성)";
        } else if (dayBranch === "未" || dayBranch === "寅" || dayBranch === "戌") {
          relationDesc = "2026년 세운의 오화(午火)는 내 일지와 따뜻한 합(午未 육합, 寅午戌 삼합)을 이루어 평화롭고 조화로운 기류를 형성합니다. 대인관계의 오해가 눈 녹듯 풀리고 귀인의 적극적인 협력을 받아 편안하게 안정을 얻을 수 있는 대길한 흐름입니다.";
          statusBadge = <span className="bg-emerald-100 text-emerald-800 border border-emerald-200 text-[10px] font-bold px-2 py-0.5 rounded shadow-sm">★ 대길한 화합 (지합)</span>;
          lightColor = "bg-emerald-600";
          borderClass = "border-emerald-300";
          cardBgClass = "bg-emerald-50/40";
          scoreLabel = "대길화합 (귀인조력)";
        } else if (dayBranch === "丑") {
          relationDesc = "2026년 오화(午火)는 내 일지 축토(丑土)와 만나며 서로 은근히 밀어내고 원망하게 만드는 축오원진(丑午怨嗔) 및 귀문관살 기류를 생성합니다. 예민함과 심리적 불안정이 높아져 가까운 이의 말 한마디에 큰 상처를 입거나 오해를 하기 쉽습니다. 상대방을 비난하기 전에 한 템포 호흡을 고르고 이성적으로 팩트를 점검하십시오.";
          statusBadge = <span className="bg-purple-100 text-purple-800 border border-purple-200 text-[10px] font-bold px-2 py-0.5 rounded shadow-sm">⚠️ 감정 오해 (원진)</span>;
          lightColor = "bg-purple-600";
          borderClass = "border-purple-300";
          cardBgClass = "bg-purple-50/40";
          scoreLabel = "신경안정 (예민도상승)";
        }

        return wrapLock(
          <div className="space-y-6 py-4">
            <div className="text-center space-y-2 mb-8">
              <span className="text-xs text-[#A3845B] font-bold block">일주(日柱) 지합·충 진단</span>
              <h2 className="font-myeongjo text-2xl font-bold text-[#1A1A1A]">일주와 세운의 형·충·회·합 정밀 진단</h2>
              <div className="w-16 h-0.5 bg-[#A3845B]/30 mx-auto my-1" />
            </div>

            {/* 프리미엄 시각화 1: 신년 일지 안전성 신호등 */}
            <div className={\`border \${borderClass} \${cardBgClass} rounded-xl p-5 space-y-3\`}>
              <div className="flex items-center gap-2">
                <div className="relative flex h-3.5 w-3.5">
                  <span className={\`animate-ping absolute inline-flex h-full w-full rounded-full \${lightColor} opacity-75\`}></span>
                  <span className={\`relative inline-flex rounded-full h-3.5 w-3.5 \${lightColor}\`}></span>
                </div>
                <div className="pl-2">
                  <span className="text-[10px] text-gray-400 block font-semibold">신년 내밀궁(안식처) 보안 상태</span>
                  <span className="font-myeongjo text-xs font-bold text-gray-800">진단 키워드: {scoreLabel}</span>
                </div>
              </div>
              <p className="text-[10px] text-gray-500 font-light leading-relaxed text-justify">
                지지는 하늘의 에너지가 땅에 내린 실제 환경으로, 배우자와 가정 안락함을 지배합니다. 신호등 색상이 적색이나 자색 계열일 때는 충돌이나 시비수가 강하니 대외 마찰을 보수적으로 회피하십시오.
              </p>
            </div>

            <div className="bg-white border border-[#E2DDD5] rounded-lg p-6 space-y-4 shadow-sm text-xs leading-relaxed font-light text-gray-700 font-traditional">
              <div className="flex justify-between items-center bg-[#FAF7F0] p-4 rounded border border-[#E2DDD5]/60 text-sm font-bold text-[#8B221E]">
                <span>귀하의 타고난 일주: {ilju}일주</span>
                {statusBadge}
              </div>
              <p className="text-justify font-light text-gray-600">
                일지는 사주에서 <strong>나의 개인적인 안식처, 침실, 그리고 배우자 궁</strong>을 상징합니다. 1년의 기류를 지배하는 세운의 지지(오화)가 내 안식처의 글자와 어떤 관계를 맺느냐에 따라 실질적인 신체 컨디션และ 가정생활의 평화 지수가 좌우됩니다.
              </p>
              <p className="text-justify font-light text-gray-600">
                {relationDesc}
              </p>
            </div>
          </div>,
          "일주와 세운의 합·충·형·파·해 진단"
        );
      }`;

// -------------------------------------------------------------
// [신년운세 8페이지] case "ny_elements_balance": -> case "ny_elements_supplement":
// -------------------------------------------------------------
const enrichedNyElementsBalance = `case "ny_elements_balance": {
        const elCount = {
          "목": sajuInfo.elements.목 || 0,
          "화": (sajuInfo.elements.화 || 0) + 2,
          "토": sajuInfo.elements.토 || 0,
          "금": sajuInfo.elements.금 || 0,
          "수": sajuInfo.elements.수 || 0
        };

        const totalNyEl = elCount.목 + elCount.화 + elCount.토 + elCount.금 + elCount.수 || 10;
        
        const elementsSorted = [
          { name: "목", count: elCount.목, color: "#5F7A68" },
          { name: "화", count: elCount.화, color: "#DC2626" },
          { name: "토", count: elCount.토, color: "#A3845B" },
          { name: "금", count: elCount.금, color: "#9CA3AF" },
          { name: "수", count: elCount.수, color: "#1F2937" }
        ];

        let accumulatedLength = 0;

        return wrapLock(
          <div className="space-y-6 py-4">
            <div className="text-center space-y-2 mb-8">
              <span className="text-xs text-[#A3845B] font-bold block">신년 오행 균형</span>
              <h2 className="font-myeongjo text-2xl font-bold text-[#1A1A1A]">2026년 세운 유입 오행 균형 분석</h2>
              <div className="w-16 h-0.5 bg-[#A3845B]/30 mx-auto my-1" />
            </div>

            {/* 프리미엄 시각화 1: 2026 보정 오행 밸런스 휠 (SVG) */}
            <div className="bg-white border border-[#E2DDD5] rounded-xl p-5 shadow-sm flex flex-col items-center">
              <span className="font-bold text-xs text-[#8A6F4C] mb-4">🍩 2026 병오년 합산 보정 오행 균형 휠</span>
              <div className="relative w-[180px] h-[180px] flex items-center justify-center">
                <svg viewBox="0 0 120 120" className="w-[160px] h-[160px] transform -rotate-90">
                  <circle cx="60" cy="60" r="45" fill="none" stroke="#F3F4F6" strokeWidth="12" />
                  {elementsSorted.map((item, idx) => {
                    const ratio = item.count / totalNyEl;
                    const strokeLength = ratio * 282.6;
                    const offset = 282.6 - strokeLength - accumulatedLength;
                    accumulatedLength += strokeLength;
                    if (item.count === 0) return null;
                    return (
                      <circle
                        key={idx}
                        cx="60"
                        cy="60"
                        r="45"
                        fill="none"
                        stroke={item.color}
                        strokeWidth="12"
                        strokeDasharray={\`\${strokeLength} \${282.6 - strokeLength}\`}
                        strokeDashoffset={offset}
                        className="transition-all duration-500"
                      />
                    );
                  })}
                  <circle cx="60" cy="60" r="32" fill="#FFFFFF" />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-[8px] text-gray-400 font-semibold">총 유입 오행</span>
                  <span className="text-xs font-bold text-gray-800">{totalNyEl}자 합산</span>
                </div>
              </div>
            </div>

            <div className="bg-white border border-[#E2DDD5] rounded-lg p-6 space-y-6 shadow-sm text-xs text-gray-700 font-traditional font-light">
              <p className="leading-relaxed font-light text-gray-600 text-justify">
                의뢰인 {name}님의 타고난 사주 원국 8글자에 2026년 병오년의 <strong>강렬한 불(火) 기운 2개</strong>가 유입되었을 때의 종합 오행 저울 분포 상태입니다. 오행의 치우침 정도에 따라 한 해의 운명적 컨디션이 요동치게 됩니다.
              </p>
              
              <div className="space-y-3 bg-[#FAF7F0] p-4 rounded border border-[#E2DDD5]/60">
                {Object.entries(elCount).map(([el, count]) => {
                  const percentage = (count / totalNyEl) * 100;
                  return (
                    <div key={el} className="flex items-center gap-3 text-xs">
                      <span className={\`w-16 text-center py-0.5 rounded font-bold text-[10px] \${getElementColor(el)}\`}>
                        {el} ({count}개)
                      </span>
                      <div className="flex-1 h-2.5 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className={\`h-full transition-all duration-500 \${getElementBarColor(el)}\`} 
                          style={{ width: \`\${percentage}%\` }}
                        />
                      </div>
                      <span className="w-8 text-right font-semibold text-gray-500">{Math.round(percentage)}%</span>
                    </div>
                  );
                })}
              </div>

              <p className="leading-relaxed border-t border-[#E2DDD5]/60 pt-3 font-light text-gray-600 text-justify">
                {elCount.화 >= 4 ? (
                  <span className="text-red-700 font-bold block mb-1 flex items-center gap-1">⚠️ [경보] 화(火) 기운의 비대화로 인한 건조/과열 상태</span>
                ) : (
                  <span className="text-gray-800 font-bold block mb-1 flex items-center gap-1">✓ [안정] 적절한 화기 조율 상태</span>
                )}
                올해 세상은 거대한 화염으로 뒤덮여, 상대적으로 <strong>수(水)와 금(金)의 기운이 극단적으로 증발하거나 쇠약해지는 약화 상태</strong>가 발생하기 쉽습니다. 사주 균형이 무너지면 심리적으로 성급해지고 체력이 쉽게 고갈되므로, 일상생활 속에서 인위적으로 물과 금속의 차갑고 안정적인 에너지를 수혈하여 기류의 과열을 방어해 주는 처방이 필수적입니다.
              </p>
            </div>
          </div>,
          "신년 오행 과잉/결핍 진단"
        );
      }`;

// 3. Apply page modifications
try {
  replaceCase("ny_daewun_flow", "ny_seoun_analysis", enrichedNyDaewunFlow);
  replaceCase("ny_seoun_analysis", "ny_stem_harmony", enrichedNySeounAnalysis);
  replaceCase("ny_stem_harmony", "ny_ilju_harmony", enrichedNyStemHarmony);
  replaceCase("ny_ilju_harmony", "ny_elements_balance", enrichedNyIljuHarmony);
  replaceCase("ny_elements_balance", "ny_elements_supplement", enrichedNyElementsBalance);

  // Write changes back to file
  fs.writeFileSync(filePath, content, 'utf8');
  console.log("=== New Year Pages 4 ~ 8 successfully enriched and visual elements integrated! ===");
} catch (error) {
  console.error("Error patching New Year pages 4 ~ 8 in page.js:", error.message);
  process.exit(1);
}
