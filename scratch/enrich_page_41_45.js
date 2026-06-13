const fs = require('fs');
const path = require('path');

const filePath = path.join('d:', '인터그리비티', 'saju', 'src', 'app', 'result', 'page.js');
let content = fs.readFileSync(filePath, 'utf8');

console.log("=== Enriching Pages 41 to 45 in page.js ===");

function replaceSingleCase(caseName, nextCaseName, newCode) {
  const startMarker = `case "${caseName}":`;
  const endMarker = `case "${nextCaseName}":`;
  const startIdx = content.indexOf(startMarker);
  if (startIdx === -1) throw new Error(`Start case not found: ${caseName}`);
  const endIdx = content.indexOf(endMarker, startIdx);
  if (endIdx === -1) throw new Error(`End case not found: ${nextCaseName}`);

  content = content.slice(0, startIdx) + newCode + "\n\n      " + content.slice(endIdx);
  console.log(`Successfully replaced single case: ${caseName}`);
}

function replaceDoubleCase(caseName, nextCaseName, newCode) {
  const startMarker = `case "${caseName}":`;
  const endMarker = `case "${nextCaseName}":`;
  
  // 1. 첫 번째 교체
  let startIdx1 = content.indexOf(startMarker);
  if (startIdx1 === -1) throw new Error(`First start case not found: ${caseName}`);
  let endIdx1 = content.indexOf(endMarker, startIdx1);
  if (endIdx1 === -1) throw new Error(`First end case not found: ${nextCaseName}`);

  content = content.slice(0, startIdx1) + newCode + "\n\n      " + content.slice(endIdx1);
  console.log(`Successfully replaced double case (1st): ${caseName}`);

  // 2. 두 번째 교체
  let startIdx2 = content.indexOf(startMarker, startIdx1 + newCode.length);
  if (startIdx2 === -1) {
    console.warn(`Second start case not found for: ${caseName} (normal if defined only once)`);
    return;
  }
  let endIdx2 = content.indexOf(endMarker, startIdx2);
  if (endIdx2 === -1) throw new Error(`Second end case not found: ${nextCaseName}`);

  content = content.slice(0, startIdx2) + newCode + "\n\n      " + content.slice(endIdx2);
  console.log(`Successfully replaced double case (2nd): ${caseName}`);
}

// -----------------------------------------------------------------------------
// [Page 41] ny_personal_worry
// -----------------------------------------------------------------------------
const codePage41 = `case "ny_personal_worry": {
        const categoryLabels = {
          love: "연애 / 속마음",
          career: "직장 / 이직",
          wealth: "금전 / 투자",
          exam: "학업 / 시험",
          general: "종합 / 기타",
          business: "사업 / 경영",
          startup: "창업 / 부업",
          trade: "장사 / 유통",
          facility: "설비 / 확장"
        };
        const currentCategoryLabel = categoryLabels[worryCategory] || "종합 / 기타";

        const woodCount = sajuInfo?.elements?.["목"] || 0;
        const fireCount = sajuInfo?.elements?.["화"] || 0;
        const earthCount = sajuInfo?.elements?.["토"] || 0;
        const metalCount = sajuInfo?.elements?.["금"] || 0;
        const waterCount = sajuInfo?.elements?.["수"] || 0;

        // 지표 계산
        const solveSuccessRate = Math.min(98, 70 + (woodCount + metalCount) * 4);
        const negotiationLeeway = Math.min(95, 65 + (waterCount + earthCount) * 4);
        const emotionControl = Math.min(95, 60 + (waterCount + metalCount) * 5);
        const connectionEfficiency = Math.min(95, 70 + (woodCount + earthCount) * 4);

        const metricsData = { 
          success: solveSuccessRate, 
          negotiation: negotiationLeeway, 
          control: emotionControl, 
          synergy: connectionEfficiency 
        };

        const textSolution = worryText && worryText.trim() !== "" ? getPersonalizedSolution(name, worryText, worryCategory) : null;
        const categorySolution = worryCategory ? getPersonalizedSolution(name, "", worryCategory) : null;

        return wrapLock(
          <div className="space-y-6 py-4">
            <div className="text-center space-y-2 mb-8">
              <span className="text-xs text-[#8A6F4C] font-bold block">고민 해결 정밀 처방 (苦悶 處方)</span>
              <h2 className="font-myeongjo text-2xl font-bold text-[#1A1A1A]">의뢰인 입력 안건에 대한 혜안당 정밀 비책</h2>
              <div className="w-16 h-0.5 bg-[#A3845B]/30 mx-auto my-1" />
            </div>

            <div className="bg-white border border-[#E2DDD5] rounded-lg p-6 space-y-6 shadow-sm text-xs leading-relaxed font-light text-gray-700 font-traditional">
              {/* 고민 정보 헤더 */}
              <div className="bg-[#FAF7F0] border-l-4 border-[#A3845B] p-4 rounded-lg space-y-2">
                <div className="flex items-center justify-between border-b border-[#E2DDD5]/60 pb-1.5">
                  <span className="font-bold text-[10px] text-[#A3845B] uppercase font-sans">고민 분야: {currentCategoryLabel}</span>
                  <span className="text-[9px] bg-[#A3845B]/10 text-[#A3845B] px-1.5 py-0.5 rounded font-bold font-sans">정밀 분석 안건</span>
                </div>
                <p className="text-[11px] text-gray-600 italic font-light">
                  "{worryText ? decodeURIComponent(worryText) : "인생 전반의 총체적 갈등 해소 및 개운"}"
                </p>
              </div>

              {/* 1. 작성하신 안건 분석 대답 */}
              {textSolution && (
                <div className="border border-[#E2DDD5]/60 rounded-xl p-4 bg-[#FAF7F0]/30 space-y-4">
                  <span className="font-bold text-xs text-[#A3845B] block">✍️ 작성하신 고민 안건 정밀 처방</span>
                  
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <span className="font-bold text-[11px] text-[#8A6F4C] block">• 📍 안건의 신년 명리학적 해석</span>
                      <p className="text-justify text-gray-600 font-light pl-3 border-l border-gray-200">
                        {textSolution.analysis}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <span className="font-bold text-[11px] text-[#8A6F4C] block">• ⏰ 하늘이 돕는 개운 타이밍</span>
                      <p className="text-justify text-gray-600 font-light pl-3 border-l border-gray-200">
                        {textSolution.timing}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <span className="font-bold text-[11px] text-[#8A6F4C] block">• 🔑 혜안당 정밀 개운 비책</span>
                      <div 
                        className="bg-white p-3 rounded-md border border-[#E2DDD5]/70 whitespace-pre-line text-[11px] font-light text-gray-600 pl-3"
                        dangerouslySetInnerHTML={{ __html: textSolution.actionPlan }}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* 2. 체크하신 고민 분야 조언 */}
              {categorySolution && (
                <div className="border border-[#E2DDD5]/60 rounded-xl p-4 bg-[#FAF7F0]/30 space-y-4">
                  <span className="font-bold text-xs text-[#A3845B] block">🏷️ 선택하신 [{currentCategoryLabel}] 분야 조언</span>
                  
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <span className="font-bold text-[11px] text-[#8A6F4C] block">• 📍 분야별 신년 명리학적 해석</span>
                      <p className="text-justify text-gray-600 font-light pl-3 border-l border-gray-200">
                        {categorySolution.analysis}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <span className="font-bold text-[11px] text-[#8A6F4C] block">• ⏰ 하늘이 돕는 개운 타이밍</span>
                      <p className="text-justify text-gray-600 font-light pl-3 border-l border-gray-200">
                        {categorySolution.timing}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <span className="font-bold text-[11px] text-[#8A6F4C] block">• 🔑 혜안당 정밀 개운 비책</span>
                      <div 
                        className="bg-white p-3 rounded-md border border-[#E2DDD5]/70 whitespace-pre-line text-[11px] font-light text-gray-600 pl-3"
                        dangerouslySetInnerHTML={{ __html: categorySolution.actionPlan }}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* 시각화: 고민 해결 성공률 및 조율 지표 */}
              <div className="bg-[#FAF7F0]/60 border border-[#E2DDD5] rounded-xl p-4 space-y-3 mt-4">
                <span className="font-bold text-xs text-[#8A6F4C] block">📊 고민 해결 및 대처 능력 지수</span>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <div className="flex justify-between text-[9px] font-semibold text-[#8A6F4C]">
                      <span>안건 성취 및 해결 성공률</span>
                      <span className="text-[#8A6F4C]">{metricsData.success}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-[#A3845B] rounded-full transition-all duration-500" style={{ width: \`\${metricsData.success}%\` }} />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-[9px] font-semibold text-[#8A6F4C]">
                      <span>외부 협상 및 계약 유리도</span>
                      <span className="text-[#8A6F4C]">{metricsData.negotiation}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-[#A3845B] rounded-full transition-all duration-500" style={{ width: \`\${metricsData.negotiation}%\` }} />
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 pt-1">
                  <div className="space-y-1">
                    <div className="flex justify-between text-[9px] font-semibold text-[#8A6F4C]">
                      <span>감정 컨트롤 & 마음 안정도</span>
                      <span className="text-[#8A6F4C]">{metricsData.control}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-[#A3845B] rounded-full transition-all duration-500" style={{ width: \`\${metricsData.control}%\` }} />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-[9px] font-semibold text-[#8A6F4C]">
                      <span>귀인 및 동료 조력 효율</span>
                      <span className="text-[#8A6F4C]">{metricsData.synergy}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-[#A3845B] rounded-full transition-all duration-500" style={{ width: \`\${metricsData.synergy}%\` }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* 고민 해결 3단계 카드 */}
              <span className="font-bold text-xs text-[#8A6F4C] block pt-2">🧭 고민 해결을 위한 3단계 개운 로드맵</span>
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-[#FAF7F0] border border-[#E2DDD5]/60 p-3 rounded-xl text-justify shadow-inner">
                  <span className="font-bold text-[#8A6F4C] text-[10px] block">⏳ 1단계: 수성 & 보류</span>
                  <p className="text-[9px] text-gray-500 font-light mt-1 leading-snug">
                    상반기의 기운 과열 시기에는 홧김에 하는 결정을 피하고 내실을 다지십시오.
                  </p>
                </div>
                <div className="bg-[#FAF7F0] border border-[#E2DDD5]/60 p-3 rounded-xl text-justify shadow-inner">
                  <span className="font-bold text-[#8A6F4C] text-[10px] block">📑 2단계: 법적 조율</span>
                  <p className="text-[9px] text-gray-500 font-light mt-1 leading-snug">
                    음력 8월의 선선한 금(金) 기운을 기점으로 자금과 계약 서류의 완성도를 검증하십시오.
                  </p>
                </div>
                <div className="bg-[#FAF7F0] border border-[#E2DDD5]/60 p-3 rounded-xl text-justify shadow-inner">
                  <span className="font-bold text-[#8A6F4C] text-[10px] block">🏆 3단계: 성과 안착</span>
                  <p className="text-[9px] text-gray-500 font-light mt-1 leading-snug">
                    연말 음력 10월 이후 귀인의 조력을 득해 고민 안건을 원만히 갈무리하십시오.
                  </p>
                </div>
              </div>
            </div>
          </div>,
          "의뢰인 맞춤형 고민 정밀 비책"
        );
      }`;

// -----------------------------------------------------------------------------
// [Page 42] ny_roadmap_2027
// -----------------------------------------------------------------------------
const codePage42 = `case "ny_roadmap_2027": {
        const dayStemEl = sajuInfo?.day?.stemEl || "목";
        const woodCount = sajuInfo?.elements?.["목"] || 0;
        const fireCount = sajuInfo?.elements?.["화"] || 0;
        const earthCount = sajuInfo?.elements?.["토"] || 0;
        const metalCount = sajuInfo?.elements?.["금"] || 0;
        const waterCount = sajuInfo?.elements?.["수"] || 0;

        // 지표 계산
        const wealthEfficiency = Math.min(95, 70 + (earthCount === 0 ? 15 : 5) + metalCount * 3);
        const cashFlowStability = Math.min(95, 65 + (waterCount + earthCount) * 4);
        
        const advice2027 = {
          "목": "목(木) 일간에게 정미년은 재성(財星)이 뜨거운 흙으로 들어오는 흐름입니다. 급격한 부동산 매수보다 현금 수성을 제1원칙으로 하십시오.",
          "화": "화(火) 일간에게 정미년은 활발한 식상(食傷)의 활동기입니다. 내 재주와 능력을 표출해 조직 내 입지를 크게 다질 수 있습니다.",
          "토": "토(土) 일간에게 정미년은 든든한 동료 비겁(比劫)이 가중되는 해입니다. 신용과 문서 안정이 최고조에 이릅니다.",
          "금": "금(金) 일간에게 정미년은 관성과 인성의 작용으로 책임감이 커지는 시기입니다. 윗사람의 조력을 받아 승진에 유리합니다.",
          "수": "수(水) 일간에게 정미년은 재성과 관성의 균형이 맞춰지는 해로, 이성적인 판단으로 자산을 안전하게 묶어둘 때 길합니다."
        }[dayStemEl] || "안정과 정리를 모토로 삼고, 전년도에 벌려놓았던 자산을 회수하는 안정주의 전략을 취하십시오.";

        return wrapLock(
          <div className="space-y-6 py-4">
            <div className="text-center space-y-2 mb-8">
              <span className="text-xs text-[#A3845B] font-bold block">2027 정미년(丁未年) 세운</span>
              <h2 className="font-myeongjo text-2xl font-bold text-[#1A1A1A]">2027년 정미년(丁未年) 미래 기류 로드맵</h2>
              <div className="w-16 h-0.5 bg-[#A3845B]/30 mx-auto my-1" />
            </div>
            <div className="bg-white border border-[#E2DDD5] rounded-lg p-6 space-y-5 shadow-sm text-xs leading-relaxed font-light text-gray-700 font-traditional">
              <p className="text-justify font-light text-gray-600">
                2027년 정미년(丁未年)은 하늘의 전원 촛불 정화(丁火)와 땅의 뜨겁고 건조한 흙 미토(未土)가 결합하는 흐름입니다. 2026년 병오년의 맹렬한 불꽃 기운이 미토 속에 서서히 가두어지며 안정세를 찾아가는 과도기적 정리의 해입니다. 격렬한 확장이나 신규 진입보다는 그동안 벌려놓았던 사업이나 투자 자산을 굳건하게 수성하고 정리·안착시키는 보수적인 흐름이 유리하게 작용합니다.
              </p>

              {/* 시각화: 기류 지표 */}
              <div className="bg-[#FAF7F0] border border-[#E2DDD5] rounded-xl p-4 space-y-3">
                <span className="font-bold text-xs text-[#8A6F4C] block">📊 정미년 운기 핵심 지표</span>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <div className="flex justify-between text-[9px] font-semibold text-[#8A6F4C]">
                      <span>재물 관리 및 수성 효율</span>
                      <span className="text-[#8A6F4C]">{wealthEfficiency}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-[#A3845B] rounded-full" style={{ width: \`\${wealthEfficiency}%\` }} />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-[9px] font-semibold text-[#8A6F4C]">
                      <span>현금 흐름 안정성 지표</span>
                      <span className="text-[#8A6F4C]">{cashFlowStability}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-[#A3845B] rounded-full" style={{ width: \`\${cashFlowStability}%\` }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* 미래 로드맵 처방 카드 */}
              <div className="border border-[#E2DDD5] rounded-xl p-4 bg-[#FAF7F0]/40 text-justify space-y-3">
                <span className="font-bold text-xs text-[#8A6F4C] block">🧭 {dayStemEl}일간 정미년 대처 강령</span>
                <p className="text-[10px] text-gray-500 leading-relaxed font-light">
                  {advice2027}
                </p>
                <p className="text-[9px] text-[#A3845B] leading-normal border-t border-[#E2DDD5]/40 pt-2 font-light">
                  * <strong>정미년 핵심 전략:</strong> 투자 자산의 50% 이상을 현금성 자산으로 묶고, 신규 확장 안건은 음력 10월 이후로 결정을 조율하십시오.
                </p>
              </div>
            </div>
          </div>,
          "2027년 정미년 세운 로드맵"
        );
      }`;

// -----------------------------------------------------------------------------
// [Page 43] ny_roadmap_2028
// -----------------------------------------------------------------------------
const codePage43 = `case "ny_roadmap_2028": {
        const dayStemEl = sajuInfo?.day?.stemEl || "목";
        const woodCount = sajuInfo?.elements?.["목"] || 0;
        const fireCount = sajuInfo?.elements?.["화"] || 0;
        const earthCount = sajuInfo?.elements?.["토"] || 0;
        const metalCount = sajuInfo?.elements?.["금"] || 0;
        const waterCount = sajuInfo?.elements?.["수"] || 0;

        // 지표 계산
        const assetInflow = Math.min(99, 70 + metalCount * 5);
        const newInvestment = Math.min(95, 65 + (earthCount + metalCount) * 4);

        const advice2028 = {
          "목": "목(木) 일간에게 무신년은 재물과 관성이 편재/편관으로 크게 교차하는 해입니다. 큰 자산 기회가 찾아오나 욕심을 줄이고 문서 위주로 묶어야 안전합니다.",
          "화": "화(火) 일간에게 무신년은 식신과 재성이 토생금으로 생조되는 해로, 신규 사업 추진 및 연봉 협상 등 능동적 경제 활동에 최고의 골든타임입니다.",
          "토": "토(土) 일간에게 무신년은 식상과 재성이 흐르는 해입니다. 그간 기획해온 사업 계획서나 이직 안건을 가시화해 이득을 취하십시오.",
          "금": "금(金) 일간에게 무신년은 비겁과 토인성의 도움으로 내 뿌리가 굳건해지는 해입니다. 동업이나 직책 승진의 기운이 강합니다.",
          "수": "수(水) 일간에게 무신년은 관성이 단단한 쇠의 생조를 받아 나를 제어하는 해입니다. 직장에서의 책임 권한과 명예가 크게 팽창합니다."
        }[dayStemEl] || "강한 금 기운의 수확 시기를 맞아, 적극적이고 과감한 투자 리밸런싱을 시도하기에 최고의 적기입니다.";

        return wrapLock(
          <div className="space-y-6 py-4">
            <div className="text-center space-y-2 mb-8">
              <span className="text-xs text-[#A3845B] font-bold block">2028 무신년(戊申年) 세운</span>
              <h2 className="font-myeongjo text-2xl font-bold text-[#1A1A1A]">2028년 무신년(戊申年) 미래 기류 로드맵</h2>
              <div className="w-16 h-0.5 bg-[#A3845B]/30 mx-auto my-1" />
            </div>
            <div className="bg-white border border-[#E2DDD5] rounded-lg p-6 space-y-5 shadow-sm text-xs leading-relaxed font-light text-gray-700 font-traditional">
              <p className="text-justify font-light text-gray-600">
                2028년 무신년(戊申年)은 하늘의 비옥한 흙 무토(戊土)와 땅의 단단하고 냉철한 쇠 신금(申金)이 만나 토생금(土生金)의 결실을 맺는 수확의 해입니다. 지난 2년간 수성하고 정비했던 노력들이 비로소 눈에 보이는 실질적 자산이나 승진, 신분 상승이라는 결과물로 전환되는 상서로운 흐름입니다.
              </p>

              {/* 시각화: 기류 지표 */}
              <div className="bg-[#FAF7F0] border border-[#E2DDD5] rounded-xl p-4 space-y-3">
                <span className="font-bold text-xs text-[#8A6F4C] block">📊 무신년 운기 핵심 지표</span>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <div className="flex justify-between text-[9px] font-semibold text-[#8A6F4C]">
                      <span>자산 유입 성공률</span>
                      <span className="text-[#8A6F4C]">{assetInflow}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-[#A3845B] rounded-full" style={{ width: \`\${assetInflow}%\` }} />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-[9px] font-semibold text-[#8A6F4C]">
                      <span>신규 투자 및 비즈니스 적합도</span>
                      <span className="text-[#8A6F4C]">{newInvestment}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-[#A3845B] rounded-full" style={{ width: \`\${newInvestment}%\` }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* 미래 로드맵 처방 카드 */}
              <div className="border border-[#E2DDD5] rounded-xl p-4 bg-[#FAF7F0]/40 text-justify space-y-3">
                <span className="font-bold text-xs text-[#8A6F4C] block">🧭 {dayStemEl}일간 무신년 대처 강령</span>
                <p className="text-[10px] text-gray-500 leading-relaxed font-light">
                  {advice2028}
                </p>
                <p className="text-[9px] text-[#A3845B] leading-normal border-t border-[#E2DDD5]/40 pt-2 font-light">
                  * <strong>무신년 핵심 전략:</strong> 금(金)의 결실을 챙기는 음력 7~9월 사이에 과감한 포트폴리오 조율과 연봉 협상을 시도하십시오.
                </p>
              </div>
            </div>
          </div>,
          "2028년 무신년 세운 로드맵"
        );
      }`;

// -----------------------------------------------------------------------------
// [Page 44] ny_roadmap_2029
// -----------------------------------------------------------------------------
const codePage44 = `case "ny_roadmap_2029": {
        const dayStemEl = sajuInfo?.day?.stemEl || "목";
        const woodCount = sajuInfo?.elements?.["목"] || 0;
        const fireCount = sajuInfo?.elements?.["화"] || 0;
        const earthCount = sajuInfo?.elements?.["토"] || 0;
        const metalCount = sajuInfo?.elements?.["금"] || 0;
        const waterCount = sajuInfo?.elements?.["수"] || 0;

        // 지표 계산
        const documentSuccess = Math.min(95, 75 + (earthCount + metalCount) * 3);
        const infrastructureStability = Math.min(95, 70 + (woodCount + waterCount) * 3);

        const advice2029 = {
          "목": "목(木) 일간에게 기유년은 정재와 정관이 조화를 이루는 최고의 명예기입니다. 조직 내 승진 및 신뢰 획득 확률이 대단히 높습니다.",
          "화": "화(火) 일간에게 기유년은 재물의 결실이 유금(酉金) 귀인으로 굳건히 맺어지는 해입니다. 안정형 현금 창고를 확보할 수 있습니다.",
          "토": "토(土) 일간에게 기유년은 상관과 유금의 조합으로 내 능력이 문서상 규격으로 확실히 인정받아 자격 취득에 대길합니다.",
          "금": "금(金) 일간에게 기유년은 단단한 금 기운이 극대화되는 시기입니다. 주체성이 강해지나 독선을 삼가고 협력 인프라를 지키십시오.",
          "수": "수(水) 일간에게 기유년은 금생수의 풍부한 인성(印星) 조력으로 문서 취득, 전세금 환수, 계약 성공이 강력히 들어오는 축복의 해입니다."
        }[dayStemEl] || "문서운 and 계약의 완성이 매우 상서로우니, 우량 부동산 거래나 장기 계약 체결에 집중하기 가장 좋습니다.";

        return wrapLock(
          <div className="space-y-6 py-4">
            <div className="text-center space-y-2 mb-8">
              <span className="text-xs text-[#A3845B] font-bold block">2029 기유년(己酉年) 세운</span>
              <h2 className="font-myeongjo text-2xl font-bold text-[#1A1A1A]">2029년 기유년(己酉年) 미래 기류 로드맵</h2>
              <div className="w-16 h-0.5 bg-[#A3845B]/30 mx-auto my-1" />
            </div>
            <div className="bg-white border border-[#E2DDD5] rounded-lg p-6 space-y-5 shadow-sm text-xs leading-relaxed font-light text-gray-700 font-traditional">
              <p className="text-justify font-light text-gray-600">
                2029년 기유년(己酉年)은 전원 흙 기토(己土)와 완성된 보석 유금(酉金)이 조우하여, 잘 다듬어진 최고의 계약 문서와 탄탄한 명예를 잉태하는 안정의 해입니다. 변동성이 차분하게 진정되고, 내 삶의 기틀이 되는 인프라를 안정적으로 수호하고 명예를 공고히 다지는 시기입니다.
              </p>

              {/* 시각화: 기류 지표 */}
              <div className="bg-[#FAF7F0] border border-[#E2DDD5] rounded-xl p-4 space-y-3">
                <span className="font-bold text-xs text-[#8A6F4C] block">📊 기유년 운기 핵심 지표</span>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <div className="flex justify-between text-[9px] font-semibold text-[#8A6F4C]">
                      <span>문서 취득 및 계약 성공률</span>
                      <span className="text-[#8A6F4C]">{documentSuccess}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-[#A3845B] rounded-full" style={{ width: \`\${documentSuccess}%\` }} />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-[9px] font-semibold text-[#8A6F4C]">
                      <span>내부 인프라 & 평판 안정성</span>
                      <span className="text-[#8A6F4C]">{infrastructureStability}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-[#A3845B] rounded-full" style={{ width: \`\${infrastructureStability}%\` }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* 미래 로드맵 처방 카드 */}
              <div className="border border-[#E2DDD5] rounded-xl p-4 bg-[#FAF7F0]/40 text-justify space-y-3">
                <span className="font-bold text-xs text-[#8A6F4C] block">🧭 {dayStemEl}일간 기유년 대처 강령</span>
                <p className="text-[10px] text-gray-500 leading-relaxed font-light">
                  {advice2029}
                </p>
                <p className="text-[9px] text-[#A3845B] leading-normal border-t border-[#E2DDD5]/40 pt-2 font-light">
                  * <strong>기유년 핵심 전략:</strong> 관인상생의 기류가 깃드는 음력 8월(유금월)에 공식 자격증 등록, 법인 설립, 장기 임대차 문서에 서명하십시오.
                </p>
              </div>
            </div>
          </div>,
          "2029년 기유년 세운 로드맵"
        );
      }`;

// -----------------------------------------------------------------------------
// [Page 45] ny_roadmap_2030
// -----------------------------------------------------------------------------
const codePage45 = `case "ny_roadmap_2030": {
        const dayStemEl = sajuInfo?.day?.stemEl || "목";
        const woodCount = sajuInfo?.elements?.["목"] || 0;
        const fireCount = sajuInfo?.elements?.["화"] || 0;
        const earthCount = sajuInfo?.elements?.["토"] || 0;
        const metalCount = sajuInfo?.elements?.["금"] || 0;
        const waterCount = sajuInfo?.elements?.["수"] || 0;

        // 지표 계산
        const careerHonor = Math.min(98, 70 + (earthCount + metalCount) * 4);
        const organStability = Math.min(95, 75 + (woodCount + waterCount) * 3);

        const advice2030 = {
          "목": "목(木) 일간에게 경술년은 편관과 편재의 조합으로 책임감과 변동 기류가 크게 교차합니다. 조직 내 안정을 추구하십시오.",
          "화": "화(火) 일간에게 경술년은 식상생재로 자금 회전력이 회복되는 해입니다. 적극적인 부업 창업 등으로 이득을 실현하십시오.",
          "토": "토(土) 일간에게 경술년은 내 식상 능력을 널리 표출하고 평판을 올릴 수 있는 예술/기획 안건의 성공 기류입니다.",
          "금": "금(金) 일간에게 경술년은 비겁과 술토 인성의 뒷받침으로 주체성이 강해져, 승진 및 권력 장악을 할 최고의 골든타임입니다.",
          "수": "수(水) 일간에게 경술년은 굳건한 관성 기류의 작동으로 법적 정돈, 장기 근속, 라이센스 확보 등 신분의 도약이 깃듭니다."
        }[dayStemEl] || "조직 내 주도권 획득과 문서 자산 통합에 매진하기에 가장 든든하고 상서로운 타이밍입니다.";

        return wrapLock(
          <div className="space-y-6 py-4">
            <div className="text-center space-y-2 mb-8">
              <span className="text-xs text-[#A3845B] font-bold block">2030 경술년(庚戌年) 세운</span>
              <h2 className="font-myeongjo text-2xl font-bold text-[#1A1A1A]">2030년 경술년(庚戌年) 미래 기류 로드맵</h2>
              <div className="w-16 h-0.5 bg-[#A3845B]/30 mx-auto my-1" />
            </div>
            <div className="bg-white border border-[#E2DDD5] rounded-lg p-6 space-y-5 shadow-sm text-xs leading-relaxed font-light text-gray-700 font-traditional">
              <p className="text-justify font-light text-gray-600">
                2030년 경술년(庚戌年)은 가공되지 않은 백금 경금(庚金)과 단단하고 건조한 영토 술토(戌土)가 만나 토생금(土生金)의 결단력과 단단함을 선사하는 해입니다. 조직 내에서 내 발언권이 막강해지며, 흩어져 있던 리소스를 한 방향으로 통합하여 최종적인 권위와 신분을 확립하는 매듭의 절기입니다.
              </p>

              {/* 시각화: 기류 지표 */}
              <div className="bg-[#FAF7F0] border border-[#E2DDD5] rounded-xl p-4 space-y-3">
                <span className="font-bold text-xs text-[#8A6F4C] block">📊 경술년 운기 핵심 지표</span>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <div className="flex justify-between text-[9px] font-semibold text-[#8A6F4C]">
                      <span>커리어 명예 및 권위 획득율</span>
                      <span className="text-[#8A6F4C]">{careerHonor}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-[#A3845B] rounded-full" style={{ width: \`\${careerHonor}%\` }} />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-[9px] font-semibold text-[#8A6F4C]">
                      <span>조직 정착도 & 기맥 안정도</span>
                      <span className="text-[#8A6F4C]">{organStability}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-[#A3845B] rounded-full" style={{ width: \`\${organStability}%\` }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* 미래 로드맵 처방 카드 */}
              <div className="border border-[#E2DDD5] rounded-xl p-4 bg-[#FAF7F0]/40 text-justify space-y-3">
                <span className="font-bold text-xs text-[#8A6F4C] block">🧭 {dayStemEl}일간 경술년 대처 강령</span>
                <p className="text-[10px] text-gray-500 leading-relaxed font-light">
                  {advice2030}
                </p>
                <p className="text-[9px] text-[#A3845B] leading-normal border-t border-[#E2DDD5]/40 pt-2 font-light">
                  * <strong>경술년 핵심 전략:</strong> 금(金)과 토(土)의 숙살 기운이 조화를 이루는 시기이므로, 조직 내 비효율을 과감하게 다이어트하고 정예 인프라만 선별하십시오.
                </p>
              </div>
            </div>
          </div>,
          "2030년 경술년 세운 로드맵"
        );
      }`;

// 실행
replaceSingleCase("ny_personal_worry", "ny_roadmap_2027", codePage41);
replaceSingleCase("ny_roadmap_2027", "ny_roadmap_2028", codePage42);
replaceSingleCase("ny_roadmap_2028", "ny_roadmap_2029", codePage43);
replaceSingleCase("ny_roadmap_2029", "ny_roadmap_2030", codePage44);

replaceDoubleCase("ny_roadmap_2030", "ny_roadmap_2031", codePage45);

fs.writeFileSync(filePath, content, 'utf8');
console.log("=== All Pages 41-45 successfully enriched and saved! ===");
