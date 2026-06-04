const fs = require('fs');
const path = require('path');

const filePath = path.join('d:', '인터그리비티', 'saju', 'src', 'app', 'result', 'page.js');
const backupPath = path.join('d:', '인터그리비티', 'saju', 'src', 'app', 'result', 'page.js.bak_49');

// 1. Read the original content
let content = fs.readFileSync(filePath, 'utf8');

// 2. Create backup if not exists
if (!fs.existsSync(backupPath)) {
  fs.writeFileSync(backupPath, content, 'utf8');
  console.log(`Created backup of page.js at: ${backupPath}`);
} else {
  console.log(`Backup already exists at: ${backupPath}`);
}

console.log("=== Enriching Page 49 (ny_lucky_fashion) ===");

// 정확히 trim() 한 결과가 case "ny_lucky_fashion": 인 라인의 절대 오프셋 찾기
const lines = content.split('\n');
let targetOffset = -1;
let currentLength = 0;

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  if (line.trim() === 'case "ny_lucky_fashion":') {
    targetOffset = currentLength;
    console.log(`Found actual case "ny_lucky_fashion": at line ${i + 1}, character offset ${targetOffset}`);
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

const enrichedPage49 = `case "ny_lucky_fashion":
        return wrapLock(
          <div className="space-y-6 py-4">
            <div className="text-center space-y-2 mb-8">
              <span className="text-xs text-[#A3845B] font-bold block">패션 스타일링 (吉慶 衣裝)</span>
              <h2 className="font-myeongjo text-2xl font-bold text-[#1A1A1A]">나의 사주 기운을 보완하는 외적 연출법</h2>
              <div className="w-16 h-0.5 bg-[#A3845B]/30 mx-auto my-1" />
            </div>

            <div className="bg-white border border-[#E2DDD5] rounded-lg p-6 space-y-6 shadow-sm text-xs leading-relaxed font-light text-gray-700 font-traditional">
              <p className="text-justify font-light text-gray-600">
                옷차림과 컬러 배치는 가장 손쉽고 즉각적으로 내 주변의 개운 에너지를 자극하는 행동 풍수 실천법입니다. 2026년 병오년의 타오르는 화(火)의 열기를 식히고 메마른 땅을 적시는 수(水) 기운과, 단단한 결단력을 제공하는 금(金) 기운을 일상의 패션과 메이크업, 향수 섭생법을 통해 적극적으로 주입하십시오.
              </p>

              {/* 시각화 1: 럭키 컬러 칩 팔레트 (Glassmorphism Color Chips) */}
              <div className="bg-[#FAF8F5] border border-[#E2DDD5]/60 rounded-xl p-5 space-y-4">
                <span className="font-bold text-xs text-[#8A6F4C] block text-center">🎨 병오년 수호 오행 럭키 컬러 팔레트</span>
                
                <div className="grid grid-cols-4 gap-3 max-w-md mx-auto">
                  <div className="flex flex-col items-center space-y-1.5 p-2 bg-white rounded-lg border border-[#E2DDD5]/40 shadow-sm">
                    <div className="w-10 h-10 rounded-full bg-[#1A2E40] border border-gray-300 shadow-inner" />
                    <span className="font-semibold text-gray-800 text-[9px]">딥 네이비</span>
                    <span className="text-[8px] text-gray-400 font-light">수(水) 기류</span>
                  </div>
                  <div className="flex flex-col items-center space-y-1.5 p-2 bg-white rounded-lg border border-[#E2DDD5]/40 shadow-sm">
                    <div className="w-10 h-10 rounded-full bg-[#0D0D0D] border border-gray-300 shadow-inner" />
                    <span className="font-semibold text-gray-800 text-[9px]">제트 블랙</span>
                    <span className="text-[8px] text-gray-400 font-light">수(水) 수호</span>
                  </div>
                  <div className="flex flex-col items-center space-y-1.5 p-2 bg-white rounded-lg border border-[#E2DDD5]/40 shadow-sm">
                    <div className="w-10 h-10 rounded-full bg-[#EAEAEA] border border-gray-300 shadow-inner" />
                    <span className="font-semibold text-gray-800 text-[9px]">메탈 실버</span>
                    <span className="text-[8px] text-gray-400 font-light">금(金) 의지</span>
                  </div>
                  <div className="flex flex-col items-center space-y-1.5 p-2 bg-white rounded-lg border border-[#E2DDD5]/40 shadow-sm">
                    <div className="w-10 h-10 rounded-full bg-[#FAF5EB] border border-gray-300 shadow-inner" />
                    <span className="font-semibold text-gray-800 text-[9px]">크림 화이트</span>
                    <span className="text-[8px] text-gray-400 font-light">금(金) 신뢰</span>
                  </div>
                </div>
              </div>

              {/* 시각화 2: 스타일 시너지 및 보호 에너지 지표 */}
              <div className="bg-[#FAF7F0]/40 border border-[#E2DDD5] rounded-xl p-4 space-y-3 shadow-inner">
                <span className="font-bold text-xs text-[#8A6F4C] block">📊 럭키 스타일링 운세 보정 지표</span>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <div className="flex justify-between text-[9px] font-semibold text-[#8A6F4C]">
                      <span>대인관계 신용 및 평판 상승률</span>
                      <span className="text-[#8A6F4C]">90%</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-[#A3845B] rounded-full" style={{ width: "90%" }} />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-[9px] font-semibold text-[#8A6F4C]">
                      <span>구설수 방어 및 악살 차단율</span>
                      <span className="text-[#8A6F4C]">88%</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-[#A3845B] rounded-full" style={{ width: "88%" }} />
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 pt-1">
                  <div className="space-y-1">
                    <div className="flex justify-between text-[9px] font-semibold text-[#8A6F4C]">
                      <span>심리적 안정 & 조급함 냉각률</span>
                      <span className="text-[#8A6F4C]">85%</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-[#A3845B] rounded-full" style={{ width: "85%" }} />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-[9px] font-semibold text-[#8A6F4C]">
                      <span>영업 / 계약 성사 시너지</span>
                      <span className="text-[#8A6F4C]">92%</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-[#A3845B] rounded-full" style={{ width: "92%" }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* 스타일 처방 조견표 */}
              <span className="font-bold text-xs text-[#8A6F4C] block pt-2">🔑 부위별 디테일 코디네이션 처방</span>
              <div className="border border-[#E2DDD5] rounded-xl overflow-hidden shadow-sm">
                <table className="w-full text-[9px] text-left border-collapse">
                  <thead>
                    <tr className="bg-[#FAF7F0] text-[#8A6F4C] font-bold border-b border-[#E2DDD5]">
                      <th className="p-2">분류</th>
                      <th className="p-2 text-center">권장 스타일 및 포인트</th>
                      <th className="p-2 text-center">추천 아이템 / 컬러</th>
                      <th className="p-2">개운 메커니즘</th>
                    </tr>
                  </thead>
                  <tbody className="text-gray-600 font-light">
                    <tr className="border-b border-[#E2DDD5]/40">
                      <td className="p-2 font-semibold text-gray-800">👔 의상 코디</td>
                      <td className="p-2 text-center font-medium">단정한 미니멀 클래식 핏</td>
                      <td className="p-2 text-center text-[#1A2E40] font-semibold">네이비 자켓, 블랙 슬랙스</td>
                      <td className="p-2">화기를 통제하는 깔끔한 수(水)의 절제로 신용을 극대화함</td>
                    </tr>
                    <tr className="border-b border-[#E2DDD5]/40">
                      <td className="p-2 font-semibold text-gray-800">💄 메이크업</td>
                      <td className="p-2 text-center font-medium">윤기 나는 세미글로우 스킨</td>
                      <td className="p-2 text-center text-gray-600 font-semibold">수분 촉촉 립밤, 실버 펄 하이라이터</td>
                      <td className="p-2">가을 이슬처럼 촉촉하고 투명한 질감으로 금수쌍청 기류 활성화</td>
                    </tr>
                    <tr className="border-b border-[#E2DDD5]/40">
                      <td className="p-2 font-semibold text-gray-800">💍 액세서리</td>
                      <td className="p-2 text-center font-medium">차가운 금속 톤 안경 및 주얼리</td>
                      <td className="p-2 text-center text-gray-500 font-semibold">실버 주얼리, 메탈 스틸 시계</td>
                      <td className="p-2">금(金)의 기류를 더하여 대인관계 내 칼 같은 분별력과 명예운 수호</td>
                    </tr>
                    <tr className="border-b border-[#E2DDD5]/40">
                      <td className="p-2 font-semibold text-gray-800">💨 럭키 향수</td>
                      <td className="p-2 text-center font-medium">차분하고 묵직한 수분감 향조</td>
                      <td className="p-2 text-center text-emerald-800 font-semibold">우디, 머스크, 마린 향</td>
                      <td className="p-2">정서적 과열을 내리고 주변 인맥에게 차분하고 지혜로운 분위기 전달</td>
                    </tr>
                    <tr className="bg-rose-50/30">
                      <td className="p-2 font-semibold text-rose-800">⚠️ 피할 스타일</td>
                      <td className="p-2 text-center font-medium text-rose-950">화려한 원색 및 형광 패션</td>
                      <td className="p-2 text-center text-rose-700 font-semibold">레드, 네온 오렌지 상의</td>
                      <td className="p-2 text-rose-950">가뜩이나 뜨거운 병오년의 화기(불꽃)를 자극해 심리적 충동과 구설을 유발</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* 3열 수칙 카드 */}
              <div className="grid grid-cols-3 gap-3 pt-2">
                <div className="bg-[#FAF7F0] border border-[#E2DDD5]/60 p-3 rounded-xl text-center shadow-inner">
                  <span className="text-xl block mb-1">👔</span>
                  <span className="font-bold text-[#A3845B] text-[10px] block">네이비 톤온톤</span>
                  <p className="text-[8px] text-gray-400 font-light mt-1 leading-snug">상의를 어두운 남색 계열로 입어 침착성을 강화</p>
                </div>
                <div className="bg-[#FAF7F0] border border-[#E2DDD5]/60 p-3 rounded-xl text-center shadow-inner">
                  <span className="text-xl block mb-1">💍</span>
                  <span className="font-bold text-[#A3845B] text-[10px] block">메탈 포인트</span>
                  <p className="text-[8px] text-gray-400 font-light mt-1 leading-snug">은반지, 스틸 시계 등으로 판단 기류를 활성화</p>
                </div>
                <div className="bg-[#FAF7F0] border border-[#E2DDD5]/60 p-3 rounded-xl text-center shadow-inner">
                  <span className="text-xl block mb-1">💄</span>
                  <span className="font-bold text-[#A3845B] text-[10px] block">물광 메이크업</span>
                  <p className="text-[8px] text-gray-400 font-light mt-1 leading-snug">얼굴에 수분감을 가미해 화기 팽창을 억제</p>
                </div>
              </div>
            </div>
          </div>,
          "신년 패션 메이크업 스타일링 가이드"
        )`;

try {
  replaceCase("ny_lucky_fashion", "ny_diet_presc", enrichedPage49, targetOffset);
  fs.writeFileSync(filePath, content, 'utf8');
  console.log("=== Page 49 successfully enriched! ===");
} catch (error) {
  console.error("Error modifying page.js:", error.message);
  process.exit(1);
}
