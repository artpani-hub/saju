const fs = require('fs');
const path = require('path');

const filePath = path.join('d:', '인터그리비티', 'saju', 'src', 'app', 'result', 'page.js');
let content = fs.readFileSync(filePath, 'utf8');

console.log("=== Enriching Page 40 to 45 (worry solution and 2027-2031 roadmaps) ===");

function replaceCase(startCase, endCase, newContent, searchOffset = 0) {
  const startIdx = content.indexOf(`case "${startCase}":`, searchOffset);
  if (startIdx === -1) throw new Error(`Start case not found: ${startCase}`);
  const endIdx = content.indexOf(`case "${endCase}":`, startIdx + 10);
  if (endIdx === -1) throw new Error(`End case not found: ${endCase}`);
  
  content = content.slice(0, startIdx) + newContent + "\n\n      " + content.slice(endIdx);
  return startIdx + newContent.length;
}

const offset1 = content.indexOf('case "ny_season_winter":');
const offset2 = content.indexOf('case "ny_season_winter":', offset1 + 10);

// ==========================================
// 1. 40페이지 (ny_worry_solution) - 단일 매핑
// ==========================================
const enrichedPage40 = `case "ny_worry_solution":
        return wrapLock(
          <div className="space-y-6 py-4">
            <div className="text-center space-y-2 mb-8">
              <span className="text-xs text-[#8A6F4C] font-bold block">고민 해결 솔루션 (苦悶 解決)</span>
              <h2 className="font-myeongjo text-2xl font-bold text-[#1A1A1A]">의뢰인의 현실적인 고민에 대한 정밀 비책</h2>
              <div className="w-16 h-0.5 bg-[#A3845B]/30 mx-auto my-1" />
            </div>
            <div className="bg-white border border-[#E2DDD5] rounded-lg p-6 space-y-5 shadow-sm text-xs leading-relaxed font-light text-gray-700 font-traditional">
              <p className="text-justify font-light text-gray-600">
                의뢰인 {name}님이 제출하신 현실적인 고민 안건에 대하여 명리 연구소의 정밀 운기 분석을 바탕으로 도출한 대안 및 행동 실천 로드맵입니다. 마음의 조급함과 불필요한 생각의 감옥(과다 인성)을 해제하고 선선한 가을철 금(金) 기운을 기점으로 자금과 계약서를 철저히 설계 및 조율해 나간다면, 리스크를 완벽하게 차단하고 원하는 결실의 대부분을 쟁취할 수 있습니다.
              </p>

              {/* 시각화: 고민 해결 성공률 및 조율 지표 */}
              <div className="bg-[#FAF7F0] border border-[#E2DDD5] rounded-xl p-4 space-y-3">
                <span className="font-bold text-xs text-[#8A6F4C] block">📊 고민 해결 및 대처 능력 지수</span>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <div className="flex justify-between text-[9px] font-semibold text-[#8A6F4C]">
                      <span>안건 성취 및 해결 성공률</span>
                      <span className="text-[#8A6F4C]">85%</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-[#A3845B] rounded-full" style={{ width: "85%" }} />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-[9px] font-semibold text-[#8A6F4C]">
                      <span>외부 협상 및 계약 유리도</span>
                      <span className="text-[#8A6F4C]">80%</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-[#A3845B] rounded-full" style={{ width: "80%" }} />
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 pt-1">
                  <div className="space-y-1">
                    <div className="flex justify-between text-[9px] font-semibold text-[#8A6F4C]">
                      <span>감정 컨트롤 & 마음 안정도</span>
                      <span className="text-[#8A6F4C]">75%</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-[#A3845B] rounded-full" style={{ width: "75%" }} />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-[9px] font-semibold text-[#8A6F4C]">
                      <span>귀인 및 동료 조력 효율</span>
                      <span className="text-[#8A6F4C]">90%</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-[#A3845B] rounded-full" style={{ width: "90%" }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* 고민 해결 3단계 카드 (3열) */}
              <span className="font-bold text-xs text-[#8A6F4C] block pt-2">🧭 고민 해결을 위한 3단계 개운 로드맵</span>
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-[#FAF7F0] border border-[#E2DDD5]/60 p-3 rounded-xl text-justify shadow-inner">
                  <span className="font-bold text-[#8A6F4C] text-[10px] block">⏳ 1단계: 수성 & 보류</span>
                  <p className="text-[8px] text-gray-400 font-light mt-1 leading-snug">
                    상반기(음력 4~6월)의 화기 과잉기에는 홧김에 하는 계약이나 변동을 일체 금하고 내실을 다지십시오.
                  </p>
                </div>
                <div className="bg-[#FAF7F0] border border-[#E2DDD5]/60 p-3 rounded-xl text-justify shadow-inner">
                  <span className="font-bold text-[#8A6F4C] text-[10px] block">📑 2단계: 법적 조율</span>
                  <p className="text-[8px] text-gray-400 font-light mt-1 leading-snug">
                    음력 8월의 선선한 금 기운을 기점으로 자금 설계 확인 및 전문 서류 계약의 법적 검토를 단행하십시오.
                  </p>
                </div>
                <div className="bg-[#FAF7F0] border border-[#E2DDD5]/60 p-3 rounded-xl text-justify shadow-inner">
                  <span className="font-bold text-[#8A6F4C] text-[10px] block">🏆 3단계: 성과 안착</span>
                  <p className="text-[8px] text-gray-400 font-light mt-1 leading-snug">
                    연말 음력 10월 이후, 상사 귀인의 조력을 득해 최종 계약서에 서명함으로써 고민을 원만히 갈무리하십시오.
                  </p>
                </div>
              </div>

              {/* 추가 개운 비책 */}
              <div className="border border-[#E2DDD5] rounded-xl p-4 bg-[#FAF7F0]/30 text-justify space-y-2">
                <span className="font-bold text-xs text-[#8A6F4C] block">🛡️ 실천 요결</span>
                <p className="text-[10px] text-gray-500 font-light leading-relaxed">
                  {worryText ? \`제출해주신 [\${worryText}] 안건은\` : ""} 성급한 출발보다 안전장치를 두 겹으로 두르고 시작할 때 85%의 성취율을 쟁취합니다. 동요하지 말고 계획된 단계에 맞추어 움직이십시오.
                </p>
              </div>
            </div>
          </div>,
          "고민 해결 맞춤형 솔루션"
        )`;

// ==========================================
// 2. 41페이지 (ny_roadmap_2027) - 단일 매핑
// ==========================================
const enrichedPage41 = `case "ny_roadmap_2027":
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
                      <span>자산 안정도 & 굳히기</span>
                      <span className="text-[#8A6F4C]">80%</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-[#A3845B] rounded-full" style={{ width: "80%" }} />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-[9px] font-semibold text-[#8A6F4C]">
                      <span>조직 커리어 정착성</span>
                      <span className="text-[#8A6F4C]">75%</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-[#A3845B] rounded-full" style={{ width: "75%" }} />
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 pt-1">
                  <div className="space-y-1">
                    <div className="flex justify-between text-[9px] font-semibold text-[#8A6F4C]">
                      <span>대인관계 마찰 조율도</span>
                      <span className="text-[#8A6F4C]">85%</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-[#A3845B] rounded-full" style={{ width: "85%" }} />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-[9px] font-semibold text-[#8A6F4C]">
                      <span>건강 및 마인드 안정 지표</span>
                      <span className="text-[#8A6F4C]">90%</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-[#A3845B] rounded-full" style={{ width: "90%" }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* 정미년 실천 3대 카드 */}
              <span className="font-bold text-xs text-[#8A6F4C] block pt-2">🎯 정미년 성공을 위한 3대 전략</span>
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-[#FAF7F0] border border-[#E2DDD5]/60 p-3 rounded-xl text-justify shadow-inner">
                  <span className="font-bold text-[#8A6F4C] text-[10px] block">🔒 1. 자산 굳히기</span>
                  <p className="text-[8px] text-gray-400 font-light mt-1 leading-snug">고위험 투자를 정리하고 보수적 정기 예적금이나 부동산 문서 굳히기에 매진하십시오.</p>
                </div>
                <div className="bg-[#FAF7F0] border border-[#E2DDD5]/60 p-3 rounded-xl text-justify shadow-inner">
                  <span className="font-bold text-[#8A6F4C] text-[10px] block">📂 2. 문서 정비</span>
                  <p className="text-[8px] text-gray-400 font-light mt-1 leading-snug">계약서의 만기나 임대차 조건 등을 조기에 재검토하여 숨은 지출 누수를 차단하십시오.</p>
                </div>
                <div className="bg-[#FAF7F0] border border-[#E2DDD5]/60 p-3 rounded-xl text-justify shadow-inner">
                  <span className="font-bold text-[#8A6F4C] text-[10px] block">🧘 3. 마음 안착</span>
                  <p className="text-[8px] text-gray-400 font-light mt-1 leading-snug">과열되었던 경쟁 구도에서 한 걸음 물러나 가족 관계와 건강의 기틀을 정비할 때입니다.</p>
                </div>
              </div>
            </div>
          </div>,
          "2027년 정미년(丁未年) 세운 로드맵"
        )`;

// ==========================================
// 3. 42페이지 (ny_roadmap_2028) - 단일 매핑
// ==========================================
const enrichedPage42 = `case "ny_roadmap_2028":
        return wrapLock(
          <div className="space-y-6 py-4">
            <div className="text-center space-y-2 mb-8">
              <span className="text-xs text-[#A3845B] font-bold block">2028 무신년(戊申年) 세운</span>
              <h2 className="font-myeongjo text-2xl font-bold text-[#1A1A1A]">2028년 무신년(戊申年) 미래 기류 로드맵</h2>
              <div className="w-16 h-0.5 bg-[#A3845B]/30 mx-auto my-1" />
            </div>
            <div className="bg-white border border-[#E2DDD5] rounded-lg p-6 space-y-5 shadow-sm text-xs leading-relaxed font-light text-gray-700 font-traditional">
              <p className="text-justify font-light text-gray-600">
                2028년 무신년(戊申年)은 거대한 황토 대지 무토(戊土)와 단단한 가을 금속 신금(申金)이 상생하는 토생금(土生金)의 해입니다. 지난 2년간 수성하고 정제했던 가치가 마침내 명확한 무형의 무기와 황금으로 제련되어 나타나는 강한 재물 결실기입니다. 투자 성과가 현금화되거나 직장 내 명예 지위가 굳건히 다져지는 인생의 실질적인 번창기 기류를 탑니다.
              </p>

              {/* 시각화: 기류 지표 */}
              <div className="bg-[#FAF7F0] border border-[#E2DDD5] rounded-xl p-4 space-y-3">
                <span className="font-bold text-xs text-[#8A6F4C] block">📊 무신년 운기 핵심 지표</span>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <div className="flex justify-between text-[9px] font-semibold text-[#8A6F4C]">
                      <span>실질적 재물 결실 지수</span>
                      <span className="text-[#8A6F4C]">85%</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-[#A3845B] rounded-full" style={{ width: "85%" }} />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-[9px] font-semibold text-[#8A6F4C]">
                      <span>문서 및 계약 성취도</span>
                      <span className="text-[#8A6F4C]">90%</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-[#A3845B] rounded-full" style={{ width: "90%" }} />
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 pt-1">
                  <div className="space-y-1">
                    <div className="flex justify-between text-[9px] font-semibold text-[#8A6F4C]">
                      <span>신규 비즈니스 활성도</span>
                      <span className="text-[#8A6F4C]">75%</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-[#A3845B] rounded-full" style={{ width: "75%" }} />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-[9px] font-semibold text-[#8A6F4C]">
                      <span>대외 평판 & 지위 상승도</span>
                      <span className="text-[#8A6F4C]">80%</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-[#A3845B] rounded-full" style={{ width: "80%" }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* 무신년 실천 3대 카드 */}
              <span className="font-bold text-xs text-[#8A6F4C] block pt-2">🎯 무신년 성공을 위한 3대 전략</span>
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-[#FAF7F0] border border-[#E2DDD5]/60 p-3 rounded-xl text-justify shadow-inner">
                  <span className="font-bold text-[#8A6F4C] text-[10px] block">🪙 1. 재물 현금화</span>
                  <p className="text-[8px] text-gray-400 font-light mt-1 leading-snug">수익이 난 투자 지분이나 부동산 문서를 정갈히 매도해 실질적인 현금 성과를 축적하십시오.</p>
                </div>
                <div className="bg-[#FAF7F0] border border-[#E2DDD5]/60 p-3 rounded-xl text-justify shadow-inner">
                  <span className="font-bold text-[#8A6F4C] text-[10px] block">🤝 2. 파트너십 구축</span>
                  <p className="text-[8px] text-gray-400 font-light mt-1 leading-snug">신용이 검증된 동업자나 조력자 인연을 확보하여 장기 공동 프로젝트를 안착시키십시오.</p>
                </div>
                <div className="bg-[#FAF7F0] border border-[#E2DDD5]/60 p-3 rounded-xl text-justify shadow-inner">
                  <span className="font-bold text-[#8A6F4C] text-[10px] block">🏆 3. 입격 및 명예</span>
                  <p className="text-[8px] text-gray-400 font-light mt-1 leading-snug">조직 내 중추적인 권위를 장악하는 해이니, 책임감을 발휘해 리더십을 입증하십시오.</p>
                </div>
              </div>
            </div>
          </div>,
          "2028년 무신년(戊申年) 세운 로드맵"
        )`;

// ==========================================
// 4. 43페이지 (ny_roadmap_2029) - 단일 매핑
// ==========================================
const enrichedPage43 = `case "ny_roadmap_2029":
        return wrapLock(
          <div className="space-y-6 py-4">
            <div className="text-center space-y-2 mb-8">
              <span className="text-xs text-[#A3845B] font-bold block">2029 기유년(己酉年) 세운</span>
              <h2 className="font-myeongjo text-2xl font-bold text-[#1A1A1A]">2029년 기유년(己酉年) 미래 기류 로드맵</h2>
              <div className="w-16 h-0.5 bg-[#A3845B]/30 mx-auto my-1" />
            </div>
            <div className="bg-white border border-[#E2DDD5] rounded-lg p-6 space-y-5 shadow-sm text-xs leading-relaxed font-light text-gray-700 font-traditional">
              <p className="text-justify font-light text-gray-600">
                2029년 기유년(己酉年)은 하늘의 정원 흙 기토(己土)와 땅의 순수한 보석 유금(酉金)이 조우하여 금 기운이 극도에 달하는 결실의 해입니다. 지난 3년간 땀 흘려 가꾼 재력과 명예가 최고의 시너지를 내어 명확한 가치로 영그는 시기입니다. 엉켜 있던 문서 얽힘이 풀리고 장기 투자 성과와 가정의 복록이 한 번에 안착되는 풍성한 수확을 향유하게 됩니다.
              </p>

              {/* 시각화: 기류 지표 */}
              <div className="bg-[#FAF7F0] border border-[#E2DDD5] rounded-xl p-4 space-y-3">
                <span className="font-bold text-xs text-[#8A6F4C] block">📊 기유년 운기 핵심 지표</span>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <div className="flex justify-between text-[9px] font-semibold text-[#8A6F4C]">
                      <span>재물 수확 완성도</span>
                      <span className="text-[#8A6F4C]">95%</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-[#A3845B] rounded-full" style={{ width: "95%" }} />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-[9px] font-semibold text-[#8A6F4C]">
                      <span>가정 안락성 및 안착률</span>
                      <span className="text-[#8A6F4C]">90%</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-[#A3845B] rounded-full" style={{ width: "90%" }} />
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 pt-1">
                  <div className="space-y-1">
                    <div className="flex justify-between text-[9px] font-semibold text-[#8A6F4C]">
                      <span>전문성/학술적 지위</span>
                      <span className="text-[#8A6F4C]">80%</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-[#A3845B] rounded-full" style={{ width: "80%" }} />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-[9px] font-semibold text-[#8A6F4C]">
                      <span>장기 자산 안전성</span>
                      <span className="text-[#8A6F4C]">85%</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-[#A3845B] rounded-full" style={{ width: "85%" }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* 기유년 실천 3대 카드 */}
              <span className="font-bold text-xs text-[#8A6F4C] block pt-2">🎯 기유년 성공을 위한 3대 전략</span>
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-[#FAF7F0] border border-[#E2DDD5]/60 p-3 rounded-xl text-justify shadow-inner">
                  <span className="font-bold text-[#8A6F4C] text-[10px] block">🌾 1. 수확의 완성</span>
                  <p className="text-[8px] text-gray-400 font-light mt-1 leading-snug">수년간 축적된 재물 권리와 가치를 명확히 회수하고 통장에 안전하게 적립하십시오.</p>
                </div>
                <div className="bg-[#FAF7F0] border border-[#E2DDD5]/60 p-3 rounded-xl text-justify shadow-inner">
                  <span className="font-bold text-[#8A6F4C] text-[10px] block">🏡 2. 가정의 화합</span>
                  <p className="text-[8px] text-gray-400 font-light mt-1 leading-snug">부부 및 가족 관계에 따뜻한 안정이 찾아오니, 주거지를 확정하고 내실을 축원하십시오.</p>
                </div>
                <div className="bg-[#FAF7F0] border border-[#E2DDD5]/60 p-3 rounded-xl text-justify shadow-inner">
                  <span className="font-bold text-[#8A6F4C] text-[10px] block">🎓 3. 전문권 획득</span>
                  <p className="text-[8px] text-gray-400 font-light mt-1 leading-snug">자신의 이름으로 된 공식 자격, 저작권, 특허 등 강력한 지적 재산을 확보하기 길한 해입니다.</p>
                </div>
              </div>
            </div>
          </div>,
          "2029년 기유년(己酉年) 세운 로드맵"
        )`;

// ==========================================
// 5. 44페이지 (ny_roadmap_2030) - 중복 매핑 (offset1, offset2)
// ==========================================
const enrichedPage44 = `case "ny_roadmap_2030":
        return wrapLock(
          <div className="space-y-6 py-4">
            <div className="text-center space-y-2 mb-8">
              <span className="text-xs text-[#A3845B] font-bold block">2030 경술년(庚戌年) 세운</span>
              <h2 className="font-myeongjo text-2xl font-bold text-[#1A1A1A]">2030년 경술년(庚戌年) 미래 기류 로드맵</h2>
              <div className="w-16 h-0.5 bg-[#A3845B]/30 mx-auto my-1" />
            </div>
            <div className="bg-white border border-[#E2DDD5] rounded-lg p-6 space-y-5 shadow-sm text-xs leading-relaxed font-light text-gray-700 font-traditional">
              <p className="text-justify font-light text-gray-600">
                2030년 경술년(庚戌年)은 강건하고 위엄 있는 바위 경금(庚金)과 땅속에 깊은 온기를 숨겨둔 술토(戌土)가 조우하여 강렬한 쇳소리를 연출합니다. 2026년부터 축적해 온 실력과 인맥 자산이 명예로운 승진이나 독자적인 세력 획득, 그리고 권위 있는 문서 취득으로 승화되는 강인한 흐름을 탑니다.
              </p>

              {/* 시각화: 기류 지표 */}
              <div className="bg-[#FAF7F0] border border-[#E2DDD5] rounded-xl p-4 space-y-3">
                <span className="font-bold text-xs text-[#8A6F4C] block">📊 경술년 운기 핵심 지표</span>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <div className="flex justify-between text-[9px] font-semibold text-[#8A6F4C]">
                      <span>사회적 명예 & 권위 획득</span>
                      <span className="text-[#8A6F4C]">90%</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-[#A3845B] rounded-full" style={{ width: "90%" }} />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-[9px] font-semibold text-[#8A6F4C]">
                      <span>장기 부동산 문서 취득율</span>
                      <span className="text-[#8A6F4C]">85%</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-[#A3845B] rounded-full" style={{ width: "85%" }} />
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 pt-1">
                  <div className="space-y-1">
                    <div className="flex justify-between text-[9px] font-semibold text-[#8A6F4C]">
                      <span>조직 관리 & 통솔 지수</span>
                      <span className="text-[#8A6F4C]">80%</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-[#A3845B] rounded-full" style={{ width: "80%" }} />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-[9px] font-semibold text-[#8A6F4C]">
                      <span>자금 회전 & 유동성 지표</span>
                      <span className="text-[#8A6F4C]">75%</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-[#A3845B] rounded-full" style={{ width: "75%" }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* 경술년 실천 3대 카드 */}
              <span className="font-bold text-xs text-[#8A6F4C] block pt-2">🎯 경술년 성공을 위한 3대 전략</span>
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-[#FAF7F0] border border-[#E2DDD5]/60 p-3 rounded-xl text-justify shadow-inner">
                  <span className="font-bold text-[#8A6F4C] text-[10px] block">⚔️ 1. 주도권 장악</span>
                  <p className="text-[8px] text-gray-400 font-light mt-1 leading-snug">업계나 조직 내에서 독자적인 지분을 확보하고 확실하게 목소리를 내야 할 타이밍입니다.</p>
                </div>
                <div className="bg-[#FAF7F0] border border-[#E2DDD5]/60 p-3 rounded-xl text-justify shadow-inner">
                  <span className="font-bold text-[#8A6F4C] text-[10px] block">🏢 2. 부동산 취득</span>
                  <p className="text-[8px] text-gray-400 font-light mt-1 leading-snug">유동 자금을 부동산이나 대지 등 안전하고 무거운 실물 등기 자산으로 치환해 고착화하십시오.</p>
                </div>
                <div className="bg-[#FAF7F0] border border-[#E2DDD5]/60 p-3 rounded-xl text-justify shadow-inner">
                  <span className="font-bold text-[#8A6F4C] text-[10px] block">🛡️ 3. 독자적 수성</span>
                  <p className="text-[8px] text-gray-400 font-light mt-1 leading-snug">명예는 드높으나 자금의 무리한 투기는 낭패를 부르니 내실을 굳히며 단단히 지키십시오.</p>
                </div>
              </div>
            </div>
          </div>,
          "2030년 경술년(庚戌年) 세운 로드맵"
        )`;

// ==========================================
// 6. 45페이지 (ny_roadmap_2031) - 중복 매핑 (offset1, offset2)
// ==========================================
const enrichedPage45 = `case "ny_roadmap_2031":
        return wrapLock(
          <div className="space-y-6 py-4">
            <div className="text-center space-y-2 mb-8">
              <span className="text-xs text-[#A3845B] font-bold block">2031 신해년(辛亥年) 세운</span>
              <h2 className="font-myeongjo text-2xl font-bold text-[#1A1A1A]">2031년 신해년(辛亥年) 미래 기류 로드맵</h2>
              <div className="w-16 h-0.5 bg-[#A3845B]/30 mx-auto my-1" />
            </div>
            <div className="bg-white border border-[#E2DDD5] rounded-lg p-6 space-y-5 shadow-sm text-xs leading-relaxed font-light text-gray-700 font-traditional">
              <p className="text-justify font-light text-gray-600">
                2031년 신해년(辛亥年)은 은은하고 고귀한 보석 신금(辛金)과 끝없는 겨울 바다 해수(亥水)가 결합하여 맑고 청아한 금수상생(金水相生)을 형성합니다. 지난 5년간 치열하게 추진해왔던 도전과 확장이 마침내 온전한 내적인 쉼표, 가족의 안온함, 그리고 고요한 자기 성찰로 회귀하는 복록이 깊은 해입니다.
              </p>

              {/* 시각화: 기류 지표 */}
              <div className="bg-[#FAF7F0] border border-[#E2DDD5] rounded-xl p-4 space-y-3">
                <span className="font-bold text-xs text-[#8A6F4C] block">📊 신해년 운기 핵심 지표</span>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <div className="flex justify-between text-[9px] font-semibold text-[#8A6F4C]">
                      <span>생활 및 정신적 안락 지수</span>
                      <span className="text-[#8A6F4C]">95%</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-[#A3845B] rounded-full" style={{ width: "95%" }} />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-[9px] font-semibold text-[#8A6F4C]">
                      <span>가정 안온도 및 복록 안착</span>
                      <span className="text-[#8A6F4C]">90%</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-[#A3845B] rounded-full" style={{ width: "90%" }} />
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 pt-1">
                  <div className="space-y-1">
                    <div className="flex justify-between text-[9px] font-semibold text-[#8A6F4C]">
                      <span>창의 및 직관적 안건 도출</span>
                      <span className="text-[#8A6F4C]">85%</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-[#A3845B] rounded-full" style={{ width: "85%" }} />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-[9px] font-semibold text-[#8A6F4C]">
                      <span>고정 배당/인컴 자산 안정도</span>
                      <span className="text-[#8A6F4C]">80%</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-[#A3845B] rounded-full" style={{ width: "80%" }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* 신해년 실천 3대 카드 */}
              <span className="font-bold text-xs text-[#8A6F4C] block pt-2">🎯 신해년 성공을 위한 3대 전략</span>
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-[#FAF7F0] border border-[#E2DDD5]/60 p-3 rounded-xl text-justify shadow-inner">
                  <span className="font-bold text-[#8A6F4C] text-[10px] block">🌊 1. 내면의 정수</span>
                  <p className="text-[8px] text-gray-400 font-light mt-1 leading-snug">경쟁에서 한 걸음 비켜서서 명상과 수련을 즐기며 신진대사를 안정시켜 두뇌를 쉬게 하십시오.</p>
                </div>
                <div className="bg-[#FAF7F0] border border-[#E2DDD5]/60 p-3 rounded-xl text-justify shadow-inner">
                  <span className="font-bold text-[#8A6F4C] text-[10px] block">💸 2. 고정수익 편재</span>
                  <p className="text-[8px] text-gray-400 font-light mt-1 leading-snug">월세 흐름이나 고배당 펀드 등 고정 현금 인컴 포트폴리오를 다져 연금 기반을 닦으십시오.</p>
                </div>
                <div className="bg-[#FAF7F0] border border-[#E2DDD5]/60 p-3 rounded-xl text-justify shadow-inner">
                  <span className="font-bold text-[#8A6F4C] text-[10px] block">🎨 3. 격조 있는 취미</span>
                  <p className="text-[8px] text-gray-400 font-light mt-1 leading-snug">예술, 음악, 서예 등 정신을 다스리고 격조를 높일 수 있는 여가 활동을 충실히 향유하십시오.</p>
                </div>
              </div>
            </div>
          </div>,
          "2031년 신해년(辛亥年) 세운 로드맵"
        )`;


// 1. 40페이지 ny_worry_solution 교체 (단일)
replaceCase("ny_worry_solution", "ny_roadmap_2027", enrichedPage40, 0);

// 2. 41페이지 ny_roadmap_2027 교체 (단일)
replaceCase("ny_roadmap_2027", "ny_roadmap_2028", enrichedPage41, 0);

// 3. 42페이지 ny_roadmap_2028 교체 (단일)
replaceCase("ny_roadmap_2028", "ny_roadmap_2029", enrichedPage42, 0);

// 4. 43페이지 ny_roadmap_2029 교체 (단일)
replaceCase("ny_roadmap_2029", "ny_action_rules", enrichedPage43, 0);

// 5. 44페이지 ny_roadmap_2030 교체 (중복 offset1, offset2)
replaceCase("ny_roadmap_2030", "ny_roadmap_2031", enrichedPage44, offset1);
replaceCase("ny_roadmap_2030", "ny_roadmap_2031", enrichedPage44, offset2);

// 6. 45페이지 ny_roadmap_2031 교체 (중복 offset1, offset2)
replaceCase("ny_roadmap_2031", "ny_lucky_fashion", enrichedPage45, offset1);
replaceCase("ny_roadmap_2031", "ny_lucky_fashion", enrichedPage45, offset2);

fs.writeFileSync(filePath, content, 'utf8');
console.log("=== Pages 40 to 45 successfully enriched! ===");
