const fs = require('fs');
const path = require('path');

const filePath = path.join('d:', '인터그리비티', 'saju', 'src', 'app', 'result', 'page.js');
let content = fs.readFileSync(filePath, 'utf8');

console.log("=== Enriching Page 48 (ny_lucky_items) ===");

function replaceCase(startCase, endCase, newContent, searchOffset = 0) {
  const startIdx = content.indexOf(`case "${startCase}":`, searchOffset);
  if (startIdx === -1) throw new Error(`Start case not found: ${startCase}`);
  const endIdx = content.indexOf(`case "${endCase}":`, startIdx + 10);
  if (endIdx === -1) throw new Error(`End case not found: ${endCase}`);
  
  content = content.slice(0, startIdx) + newContent + "\n\n      " + content.slice(endIdx);
  return startIdx + newContent.length;
}

const enrichedPage48 = `case "ny_lucky_items":
        return wrapLock(
          <div className="space-y-6 py-4">
            <div className="text-center space-y-2 mb-8">
              <span className="text-xs text-[#A3845B] font-bold block">행운의 수호 소품 (吉祥 物品)</span>
              <h2 className="font-myeongjo text-2xl font-bold text-[#1A1A1A]">사주 결핍을 보완하는 3대 수호 아이템</h2>
              <div className="w-16 h-0.5 bg-[#A3845B]/30 mx-auto my-1" />
            </div>
            <div className="bg-white border border-[#E2DDD5] rounded-lg p-6 space-y-5 shadow-sm text-xs leading-relaxed font-light text-gray-700 font-traditional">
              <p className="text-justify font-light text-gray-600">
                2026년 병오년은 사주 내의 화(火) 기운이 극도에 달하여 주변의 물 기운이 쉽게 증발하고 금속 기운이 녹아내리는 성향을 보입니다. 이러한 오행의 격렬한 쏠림을 보정하고 부족한 기운을 자연스럽게 보완하기 위해 일상에서 늘 지니거나 공간에 배치해야 할 3대 수호 아이템입니다. 파동 에너지를 결합한 풍수 인테리어 소품을 가까이 두어 가택의 탁기를 털어내고 재물과 신용을 수호하십시오.
              </p>

              {/* 시각화: 소품 기류 활성화 게이지 */}
              <div className="bg-[#FAF7F0] border border-[#E2DDD5] rounded-xl p-4 space-y-3">
                <span className="font-bold text-xs text-[#8A6F4C] block">📊 수호 소품 에너지 보정 지표</span>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <div className="flex justify-between text-[9px] font-semibold text-[#8A6F4C]">
                      <span>재물운 수호 & 누수 방어율</span>
                      <span className="text-[#8A6F4C]">90%</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-[#A3845B] rounded-full" style={{ width: "90%" }} />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-[9px] font-semibold text-[#8A6F4C]">
                      <span>액난 차단 & 가택 평화도</span>
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
                      <span>심리적 안정 및 집중 보정률</span>
                      <span className="text-[#8A6F4C]">80%</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-[#A3845B] rounded-full" style={{ width: "80%" }} />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-[9px] font-semibold text-[#8A6F4C]">
                      <span>대외 평판 & 신뢰 상승률</span>
                      <span className="text-[#8A6F4C]">85%</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-[#A3845B] rounded-full" style={{ width: "85%" }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* 수호 소품 처방 조견표 */}
              <span className="font-bold text-xs text-[#8A6F4C] block pt-2">🔑 수호 소품 처방 조견표</span>
              <div className="border border-[#E2DDD5] rounded-xl overflow-hidden shadow-sm">
                <table className="w-full text-[9px] text-left border-collapse">
                  <thead>
                    <tr className="bg-[#FAF7F0] text-[#8A6F4C] font-bold border-b border-[#E2DDD5]">
                      <th className="p-2">소품 항목</th>
                      <th className="p-2 text-center">관련 오행</th>
                      <th className="p-2 text-center">배치/사용 위치</th>
                      <th className="p-2">기류 개선 효과</th>
                    </tr>
                  </thead>
                  <tbody className="text-gray-600 font-light">
                    <tr className="border-b border-[#E2DDD5]/40">
                      <td className="p-2 font-semibold text-gray-800">💼 블랙 가죽 지갑</td>
                      <td className="p-2 text-center text-[#8A6F4C] font-bold">수(水)</td>
                      <td className="p-2 text-center">가방 내부 (북쪽 보관)</td>
                      <td className="p-2">물 기운을 모아 화기로 인한 재물 누수 방어</td>
                    </tr>
                    <tr className="border-b border-[#E2DDD5]/40">
                      <td className="p-2 font-semibold text-gray-800">🔔 황동제 미니 종</td>
                      <td className="p-2 text-center text-[#8A6F4C] font-bold">금(金)</td>
                      <td className="p-2 text-center">현관문 안쪽 고리</td>
                      <td className="p-2">청명한 쇳소리 파동으로 외부 나쁜 탁기를 중화</td>
                    </tr>
                    <tr>
                      <td className="p-2 font-semibold text-gray-800">💍 실버 메탈 링/주얼리</td>
                      <td className="p-2 text-center text-[#8A6F4C] font-bold">금(金)</td>
                      <td className="p-2 text-center">왼손 검지 또는 약지</td>
                      <td className="p-2">금의 카리스마를 보해 직무 협상 및 대외 신뢰 제고</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* 3열 디테일 카드 */}
              <div className="grid grid-cols-3 gap-3 pt-2">
                <div className="bg-[#FAF7F0] border border-[#E2DDD5]/60 p-3 rounded-xl text-center shadow-inner">
                  <span className="text-xl block mb-1">🐈</span>
                  <span className="font-bold text-[#A3845B] text-[10px] block">검은 가죽 지갑</span>
                  <p className="text-[8px] text-gray-400 font-light mt-1 leading-snug">수(水)의 기류를 머금어 지출 통제와 금전 수성을 유도합니다.</p>
                </div>
                <div className="bg-[#FAF7F0] border border-[#E2DDD5]/60 p-3 rounded-xl text-center shadow-inner">
                  <span className="text-xl block mb-1">🔔</span>
                  <span className="font-bold text-[#A3845B] text-[10px] block">황동제 종</span>
                  <p className="text-[8px] text-gray-400 font-light mt-1 leading-snug">문을 여닫을 때의 종소리가 집안 내부로 번영의 울림을 전합니다.</p>
                </div>
                <div className="bg-[#FAF7F0] border border-[#E2DDD5]/60 p-3 rounded-xl text-center shadow-inner">
                  <span className="text-xl block mb-1">💍</span>
                  <span className="font-bold text-[#A3845B] text-[10px] block">실버 주얼리</span>
                  <p className="text-[8px] text-gray-400 font-light mt-1 leading-snug">강건한 결단 기운을 보하여 구설수로부터 나를 수호합니다.</p>
                </div>
              </div>
            </div>
          </div>,
          "신년 추천 수호 소품 리스트"
        )`;

replaceCase("ny_lucky_items", "ny_intro_saju", enrichedPage48, 0);

fs.writeFileSync(filePath, content, 'utf8');
console.log("=== Page 48 successfully enriched! ===");
