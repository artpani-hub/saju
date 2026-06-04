const fs = require('fs');
const path = require('path');

const filePath = path.join('d:', '인터그리비티', 'saju', 'src', 'app', 'result', 'page.js');
const backupPath = path.join('d:', '인터그리비티', 'saju', 'src', 'app', 'result', 'page.js.bak_3');

// 1. Read the original content
let content = fs.readFileSync(filePath, 'utf8');

// 2. Create backup if not exists
if (!fs.existsSync(backupPath)) {
  fs.writeFileSync(backupPath, content, 'utf8');
  console.log(`Created backup of page.js at: ${backupPath}`);
} else {
  console.log(`Backup already exists at: ${backupPath}`);
}

console.log("=== Enriching Page 3 (ny_intro_saju) ===");

// 정확히 trim() 한 결과가 case "ny_intro_saju": 인 라인의 절대 오프셋 찾기
const lines = content.split('\n');
let targetOffset = -1;
let currentLength = 0;

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  if (line.trim() === 'case "ny_intro_saju":') {
    targetOffset = currentLength;
    console.log(`Found actual case "ny_intro_saju": at line ${i + 1}, character offset ${targetOffset}`);
    break;
  }
  currentLength += line.length + 1; // +1은 줄바꿈 문자(\n)
}

if (targetOffset === -1) {
  console.error("Could not find the actual case statement!");
  process.exit(1);
}

function replaceCase(startCase, endCase, newContent, searchOffset = 0) {
  const startIdx = content.indexOf(`case "${startCase}":`, searchOffset);
  if (startIdx === -1) throw new Error(`Start case not found: ${startCase}`);
  const endIdx = content.indexOf(`case "${endCase}":`, startIdx + 10);
  if (endIdx === -1) throw new Error(`End case not found: ${endCase}`);
  
  content = content.slice(0, startIdx) + newContent + "\n\n      " + content.slice(endIdx);
  return startIdx + newContent.length;
}

const enrichedPage3 = `case "ny_intro_saju": {
        const dayStemEl = sajuInfo.day.stemEl;
        let actionTitle = "신년 오행 개운 행동 강령";
        let actionDesc = "";
        let actionTip1 = "";
        let actionTip2 = "";
        let actionTip3 = "";

        if (dayStemEl === "목" || dayStemEl === "木") {
          actionDesc = "목(木) 일간인 귀하에게 2026년은 내 재능을 펼쳐 활동하는 '식상(食傷)'의 해입니다. 거대한 불길에 내 수분이 말라가지 않도록 페이스를 유연하게 늦추는 지혜가 최우선으로 필요합니다.";
          actionTip1 = "📢 감정 한 템포 늦추기: 대화 중 욱하는 충동이 들 때 10초간 눈을 감고 미소로 대처하십시오.";
          actionTip2 = "📝 철저한 문서 검증: 이직이나 동업 계약서 서명 전, 최소 3일 이상 타인의 검토 피드백을 받으십시오.";
          actionTip3 = "🧘 신체 수분 충전: 매일 아침 기상 직후 따뜻한 물 한 잔으로 머리의 상열감을 즉시 가라앉히십시오.";
        } else if (dayStemEl === "화" || dayStemEl === "火") {
          actionDesc = "화(火) 일간인 귀하에게 2026년은 내 주체성과 경쟁심이 동시다발적으로 폭발하는 '비겁(比劫)'의 해입니다. 나 스스로의 독단을 경계하고 타인과의 협력 관계를 우호적으로 굳히는 수성이 필수적입니다.";
          actionTip1 = "🤝 공동 투자/동업 보류: 지인과의 이권 거래나 공동 자금 유치는 올해 하반기 이후로 과감히 유예하십시오.";
          actionTip2 = "🤐 경청 중심 대화법: 내 주장을 앞세우기보다 상대방의 의견을 70% 이상 먼저 경청하는 배려를 실천하십시오.";
          actionTip3 = "🏃 에너지 분산: 격렬한 유산소 운동보다는 차분한 산책이나 요가로 체내 맹렬한 불꽃 기운을 순화하십시오.";
        } else if (dayStemEl === "토" || dayStemEl === "土") {
          actionDesc = "토(土) 일간인 귀하에게 2026년은 귀인의 조력과 문서 취득의 운을 받는 '인성(印星)'의 해입니다. 기회는 풍부하나 생각에만 잠겨 기회를 놓치는 나태함을 깨고 즉각 움직여야 할 때입니다.";
          actionTip1 = "🔑 문서 자산 포착: 시험 합격이나 중요 자격증 공부, 혹은 가치 있는 문서 계약을 능동적으로 추진하십시오.";
          actionTip2 = "⚡ 나태함 경계 행동: 계획 수립은 짧게 마치고, 결정된 사안은 미루지 말고 24시간 내에 기동하십시오.";
          actionTip3 = "🥬 소화기 보호 습관: 비위가 쉽게 메마를 수 있으니 가벼운 한식 위주의 약선 식사를 정기적으로 섭취하십시오.";
        } else if (dayStemEl === "금" || dayStemEl === "金") {
          actionDesc = "금(金) 일간인 귀하에게 2026년은 지위가 오르고 책임이 무거워지는 '관성(官星)'의 해입니다. 날카로운 스트레스와 상사와의 불필요한 마찰을 지혜롭게 방어하여 명예를 지켜야 합니다.";
          actionTip1 = "🛡️ 직장 내 마찰 차단: 업무 피드백을 감정적 공격으로 받아들이지 말고 공적인 필터로 침착하게 접수하십시오.";
          actionTip2 = "👓 냉철한 멘탈 유지: 중요한 결단 시 감정을 완전히 배제하고 오직 팩트와 수치 데이터로만 행동하십시오.";
          actionTip3 = "💨 호흡기/점막 보습: 마른기침과 피부 건조를 막기 위해 실내 가습을 강화하고 물을 자주 음용하십시오.";
        } else {
          actionDesc = "수(水) 일간인 귀하에게 2026년은 뜻밖의 금전적 기회와 성과를 얻게 되는 '재성(財星)'의 해입니다. 하지만 재물을 쫓느라 심신이 극도로 건조해져 건강과 자산을 잃지 않도록 수성이 요구됩니다.";
          actionTip1 = "💰 과도한 레버리지 제한: 무리한 대출을 동반한 공격적 자산 확장은 손재수를 부르니 안전자산 위주로 굳히십시오.";
          actionTip2 = "🛌 신장/뇨기 방어: 무리한 연근무를 피하고, 매일 8시간 이상의 질 좋은 수면 시간을 확보하십시오.";
          actionTip3 = "🌊 쿨다운 명상: 타오르는 불길이 차가운 대형 호수에 스르르 흡수되어 잠기는 시각화 명상을 10분간 수행하십시오.";
        }

        // 오행 컬러 클래스 매핑 헬퍼
        const getElBadgeColor = (el) => {
          if (el === "목" || el === "木") return "bg-[#5F7A68] text-white";
          if (el === "화" || el === "火") return "bg-red-600 text-white";
          if (el === "토" || el === "土") return "bg-[#A3845B] text-white";
          if (el === "금" || el === "金") return "bg-gray-400 text-gray-900";
          return "bg-gray-800 text-white";
        };

        // 오행 총 합 계산
        const totalElCount = sajuInfo.elements.목 + sajuInfo.elements.화 + sajuInfo.elements.토 + sajuInfo.elements.금 + sajuInfo.elements.수;

        return wrapLock(
          <div className="space-y-6 py-4">
            <div className="text-center space-y-2 mb-8">
              <span className="text-xs text-[#A3845B] font-bold block">명조(命造) 분석</span>
              <h2 className="font-myeongjo text-2xl font-bold text-[#1A1A1A]">나를 증명하는 우주의 지도, 사주 원국 정밀 해설</h2>
              <div className="w-16 h-0.5 bg-[#A3845B]/30 mx-auto my-1" />
            </div>

            <div className="bg-white border border-[#E2DDD5] rounded-lg p-6 space-y-6 shadow-sm text-xs leading-relaxed font-light text-gray-700 font-traditional">
              <p className="text-justify font-light text-gray-600">
                의뢰인 {name}님이 탄생하는 그 순간, 우주 공간을 채웠던 여덟 글자의 명조(命造: 사주 원국) 배치입니다. 명리학에서 사주 원국은 평생에 걸쳐 귀하를 구성하는 <strong>정신적 뼈대이자 유전적인 기질의 기본형</strong>을 상징합니다.
              </p>
              
              {/* 시각화 1: 4기둥 간지 오행 카드 보드 */}
              <div className="grid grid-cols-4 gap-2 text-center font-bold">
                <div className="bg-[#FAF7F0] p-2.5 rounded border border-[#E2DDD5]/50 flex flex-col justify-between min-h-[110px]">
                  <div>
                    <div className="text-[10px] text-gray-400 font-normal">시주(時柱)</div>
                    <div className="text-sm text-[#1A1A1A] mt-1.5">{sajuInfo.hour.stem}{sajuInfo.hour.branch}</div>
                  </div>
                  <div className="space-y-1 mt-2">
                    <span className={\`text-[8px] font-bold px-1.5 py-0.5 rounded-full block \${getElBadgeColor(sajuInfo.hour.stemEl)}\`}>{sajuInfo.hour.stemEl}</span>
                    <span className={\`text-[8px] font-bold px-1.5 py-0.5 rounded-full block \${getElBadgeColor(sajuInfo.hour.branchEl)}\`}>{sajuInfo.hour.branchEl}</span>
                  </div>
                  <div className="text-[7px] text-gray-400 font-normal border-t border-gray-200/60 pt-1 mt-1.5">노년·자식</div>
                </div>

                <div className="bg-[#FAF7F0] p-2.5 rounded border-2 border-brass flex flex-col justify-between min-h-[110px] shadow-sm">
                  <div>
                    <div className="text-[10px] text-brass font-bold">일주(日柱)</div>
                    <div className="text-sm text-brass mt-1.5">{sajuInfo.day.stem}{sajuInfo.day.branch}</div>
                  </div>
                  <div className="space-y-1 mt-2">
                    <span className={\`text-[8px] font-bold px-1.5 py-0.5 rounded-full block \${getElBadgeColor(sajuInfo.day.stemEl)}\`}>{sajuInfo.day.stemEl}</span>
                    <span className={\`text-[8px] font-bold px-1.5 py-0.5 rounded-full block \${getElBadgeColor(sajuInfo.day.branchEl)}\`}>{sajuInfo.day.branchEl}</span>
                  </div>
                  <div className="text-[7px] text-brass font-bold border-t border-brass/20 pt-1 mt-1.5">자아·배우자</div>
                </div>

                <div className="bg-[#FAF7F0] p-2.5 rounded border border-[#E2DDD5]/50 flex flex-col justify-between min-h-[110px]">
                  <div>
                    <div className="text-[10px] text-gray-400 font-normal">월주(月柱)</div>
                    <div className="text-sm text-[#1A1A1A] mt-1.5">{sajuInfo.month.stem}{sajuInfo.month.branch}</div>
                  </div>
                  <div className="space-y-1 mt-2">
                    <span className={\`text-[8px] font-bold px-1.5 py-0.5 rounded-full block \${getElBadgeColor(sajuInfo.month.stemEl)}\`}>{sajuInfo.month.stemEl}</span>
                    <span className={\`text-[8px] font-bold px-1.5 py-0.5 rounded-full block \${getElBadgeColor(sajuInfo.month.branchEl)}\`}>{sajuInfo.month.branchEl}</span>
                  </div>
                  <div className="text-[7px] text-gray-400 font-normal border-t border-gray-200/60 pt-1 mt-1.5">청년·사회운</div>
                </div>

                <div className="bg-[#FAF7F0] p-2.5 rounded border border-[#E2DDD5]/50 flex flex-col justify-between min-h-[110px]">
                  <div>
                    <div className="text-[10px] text-gray-400 font-normal">년주(年柱)</div>
                    <div className="text-sm text-[#1A1A1A] mt-1.5">{sajuInfo.year.stem}{sajuInfo.year.branch}</div>
                  </div>
                  <div className="space-y-1 mt-2">
                    <span className={\`text-[8px] font-bold px-1.5 py-0.5 rounded-full block \${getElBadgeColor(sajuInfo.year.stemEl)}\`}>{sajuInfo.year.stemEl}</span>
                    <span className={\`text-[8px] font-bold px-1.5 py-0.5 rounded-full block \${getElBadgeColor(sajuInfo.year.branchEl)}\`}>{sajuInfo.year.branchEl}</span>
                  </div>
                  <div className="text-[7px] text-gray-400 font-normal border-t border-gray-200/60 pt-1 mt-1.5">초년·조상궁</div>
                </div>
              </div>

              {/* 시각화 2: 오행 비중 바 차트 */}
              <div className="bg-[#FBFBFA] border border-[#E2DDD5] rounded-xl p-4 space-y-3 shadow-inner">
                <span className="font-bold text-xs text-[#8A6F4C] block">📊 내 사주 원국 오행(五行) 비중 비율</span>
                <div className="space-y-2 text-[9px] font-semibold text-gray-700">
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span className="text-[#5F7A68] font-bold">나무 (木)</span>
                      <span>{sajuInfo.elements.목}자 ({(sajuInfo.elements.목 / totalElCount * 100).toFixed(0)}%)</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-[#5F7A68] rounded-full" style={{ width: \`\${(sajuInfo.elements.목 / totalElCount * 100)}%\` }} />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span className="text-red-600 font-bold">불 (火)</span>
                      <span>{sajuInfo.elements.화}자 ({(sajuInfo.elements.화 / totalElCount * 100).toFixed(0)}%)</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-red-600 rounded-full" style={{ width: \`\${(sajuInfo.elements.화 / totalElCount * 100)}%\` }} />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span className="text-[#A3845B] font-bold">흙 (土)</span>
                      <span>{sajuInfo.elements.토}자 ({(sajuInfo.elements.토 / totalElCount * 100).toFixed(0)}%)</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-[#A3845B] rounded-full" style={{ width: \`\${(sajuInfo.elements.토 / totalElCount * 100)}%\` }} />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span className="text-gray-400 font-bold">쇠 (金)</span>
                      <span>{sajuInfo.elements.금}자 ({(sajuInfo.elements.금 / totalElCount * 100).toFixed(0)}%)</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-gray-400 rounded-full" style={{ width: \`\${(sajuInfo.elements.금 / totalElCount * 100)}%\` }} />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span className="text-gray-800 font-bold">물 (水)</span>
                      <span>{sajuInfo.elements.수}자 ({(sajuInfo.elements.수 / totalElCount * 100).toFixed(0)}%)</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-gray-800 rounded-full" style={{ width: \`\${(sajuInfo.elements.수 / totalElCount * 100)}%\` }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* 추가된 콘텐츠: 고객이 취해야 할 개운 행동 수칙 */}
              <div className="bg-[#FAF8F5] border border-[#E2DDD5]/60 rounded-xl p-5 space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-xl">🔑</span>
                  <div>
                    <span className="text-[10px] text-[#A3845B] font-bold block">2026년 병오년 대길(大吉) 행동 지침</span>
                    <span className="font-myeongjo text-sm font-bold text-gray-800">{actionTitle}</span>
                  </div>
                </div>
                <p className="text-[10px] text-gray-500 font-light leading-relaxed border-t border-[#E2DDD5]/40 pt-2 text-justify">
                  {actionDesc}
                </p>
                <div className="space-y-2 pt-1.5 text-[9px] font-semibold text-gray-600">
                  <div className="bg-white p-2.5 rounded border border-[#E2DDD5]/40 shadow-inner">
                    {actionTip1}
                  </div>
                  <div className="bg-white p-2.5 rounded border border-[#E2DDD5]/40 shadow-inner">
                    {actionTip2}
                  </div>
                  <div className="bg-white p-2.5 rounded border border-[#E2DDD5]/40 shadow-inner">
                    {actionTip3}
                  </div>
                </div>
              </div>

              <div className="space-y-3 pt-2 text-justify border-t border-[#E2DDD5]/60 font-light text-gray-600">
                <p>
                  네 개의 기둥 중에서도 나 자신을 대변하는 <strong>일간(日干: {sajuInfo.day.stem})</strong>은 나의 정신적 자아와 핵심 가치관을 주도하는 최고 결정권자입니다. 일주(日柱)의 지지({sajuInfo.day.branch})는 내가 지향하는 내면의 안전지대이자 배우자와 정서적 교감을 나누는 주거 환경입니다.
                </p>
                <p>
                  또한 사회적 활동 영역과 직업적 성취를 보여주는 월주(月柱)는 청년기부터 사회 초년생 시절의 대외적인 명예와 성장의 속도를 지배합니다. 초년과 조상의 기틀을 의미하는 년주(Node)는 굳건한 뿌리가 되어 귀하의 든든한 보호막이 되어 줍니다.
                </p>
                <p>
                  올해 병오년의 불꽃은 이 여덟 글자의 유기적 관계와 마주하여 천간의 합과 지지의 충을 정밀하게 일으킵니다. 내 원국에 어떤 글자들이 있고, 그 글자들이 세운의 글자와 어떻게 융합하는지 명확하게 인지하고 대처할 때 나쁜 액운을 지혜롭게 비껴가고 인생의 큰 복록을 온전히 취하게 될 것입니다.
                </p>
              </div>
            </div>
          </div>,
          "의뢰인 명조 분석과 사주 원국"
        )
      }`;

try {
  replaceCase("ny_intro_saju", "ny_daewun_flow", enrichedPage3, targetOffset);
  fs.writeFileSync(filePath, content, 'utf8');
  console.log("=== Page 3 successfully enriched! ===");
} catch (error) {
  console.error("Error modifying page.js:", error.message);
  process.exit(1);
}
