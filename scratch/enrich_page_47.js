const fs = require('fs');
const path = require('path');

const filePath = path.join('d:', '인터그리비티', 'saju', 'src', 'app', 'result', 'page.js');
const backupPath = path.join('d:', '인터그리비티', 'saju', 'src', 'app', 'result', 'page.js.bak_47');

// 1. Read the original content
let content = fs.readFileSync(filePath, 'utf8');

// 2. Create backup if not exists
if (!fs.existsSync(backupPath)) {
  fs.writeFileSync(backupPath, content, 'utf8');
  console.log(`Created backup of page.js at: ${backupPath}`);
} else {
  console.log(`Backup already exists at: ${backupPath}`);
}

console.log("=== Enriching Page 47 (ny_fengshui_interior) ===");

// 정확히 trim() 한 결과가 case "ny_fengshui_interior": 인 라인의 절대 오프셋 찾기
const lines = content.split('\n');
let targetOffset = -1;
let currentLength = 0;

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  if (line.trim() === 'case "ny_fengshui_interior":') {
    targetOffset = currentLength;
    console.log(`Found actual case "ny_fengshui_interior": at line ${i + 1}, character offset ${targetOffset}`);
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

const enrichedPage47 = `case "ny_fengshui_interior":
        return wrapLock(
          <div className="space-y-6 py-4">
            <div className="text-center space-y-2 mb-8">
              <span className="text-xs text-[#5F7A68] font-bold block">공간 풍수 처방 (空間 風水)</span>
              <h2 className="font-myeongjo text-2xl font-bold text-[#1A1A1A]">기류를 조율하는 5대 공간 풍수 설계</h2>
              <div className="w-16 h-0.5 bg-[#5F7A68]/30 mx-auto my-1" />
            </div>

            <div className="bg-white border border-[#E2DDD5] rounded-lg p-6 space-y-6 shadow-sm text-xs leading-relaxed font-light text-gray-700 font-traditional">
              <p className="text-justify font-light text-gray-600">
                2026년 병오년(丙午年)은 천간과 지지가 모두 강력한 화(火) 기운으로 채워져 가택 내의 수(水) 기운을 증발시키고 금(金) 기운을 녹여 정서적 과열과 재물 누수를 유발하기 쉽습니다. 내가 머무는 주거 및 사무 공간의 오행 배치를 조율하여, 날카로운 살기를 방어하고 조화로운 번영의 기류를 이끌어내십시오.
              </p>

              {/* 시각화 1: 5방위 개운 나침반 (SVG + Interactive Layout) */}
              <div className="bg-[#F6FAF7] border border-emerald-100 rounded-xl p-6 space-y-4">
                <span className="font-bold text-xs text-[#5F7A68] block text-center">🧭 병오년 가택 오방(五方) 개운 배치도</span>
                
                <div className="flex flex-col md:flex-row items-center justify-center gap-6">
                  {/* 왼쪽: 오방 나침반 SVG */}
                  <div className="relative w-40 h-40 flex items-center justify-center bg-white rounded-full shadow-md border border-emerald-100/50">
                    <svg className="w-full h-full transform -rotate-45" viewBox="0 0 100 100">
                      {/* 외곽 원 */}
                      <circle cx="50" cy="50" r="45" fill="none" stroke="#5F7A68" strokeWidth="1" strokeDasharray="2,2" />
                      <circle cx="50" cy="50" r="40" fill="none" stroke="#E2DDD5" strokeWidth="0.5" />
                      {/* 십자 가이드선 */}
                      <line x1="50" y1="10" x2="50" y2="90" stroke="#E2DDD5" strokeWidth="0.5" />
                      <line x1="10" y1="50" x2="90" y2="50" stroke="#E2DDD5" strokeWidth="0.5" />
                      
                      {/* 각 오행 영역 색상 반원/호 */}
                      {/* 북 (수): 하단 */}
                      <circle cx="50" cy="82" r="6" fill="#1A2E40" opacity="0.85" />
                      {/* 남 (화): 상단 */}
                      <circle cx="50" cy="18" r="6" fill="#8B221E" opacity="0.85" />
                      {/* 동 (목): 좌측 */}
                      <circle cx="18" cy="50" r="6" fill="#2E5A44" opacity="0.85" />
                      {/* 서 (금): 우측 */}
                      <circle cx="82" cy="50" r="6" fill="#7F8C8D" opacity="0.85" />
                      {/* 중앙 (토): 중앙 */}
                      <circle cx="50" cy="50" r="8" fill="#D4AC0D" opacity="0.9" />

                      {/* 중앙 한자 '土' */}
                      <text x="50" y="52" fontSize="6" fontWeight="bold" fill="white" textAnchor="middle">土</text>
                      
                      {/* 방위 텍스트 */}
                      {/* 북(수) */}
                      <text x="50" y="84" transform="rotate(45, 50, 82)" fontSize="5" fontWeight="bold" fill="white" textAnchor="middle">水</text>
                      {/* 남(화) */}
                      <text x="50" y="20" transform="rotate(45, 50, 18)" fontSize="5" fontWeight="bold" fill="white" textAnchor="middle">火</text>
                      {/* 동(목) */}
                      <text x="18" y="52" transform="rotate(45, 18, 50)" fontSize="5" fontWeight="bold" fill="white" textAnchor="middle">木</text>
                      {/* 서(금) */}
                      <text x="82" y="52" transform="rotate(45, 82, 50)" fontSize="5" fontWeight="bold" fill="white" textAnchor="middle">金</text>
                    </svg>
                    {/* 나침반 바늘 장식 */}
                    <div className="absolute w-1 h-20 bg-gradient-to-b from-[#8B221E] via-[#5F7A68] to-[#1A2E40] rounded-full transform rotate-12 shadow-sm pointer-events-none" />
                    <div className="absolute w-3 h-3 bg-white border-2 border-[#5F7A68] rounded-full" />
                  </div>

                  {/* 오른쪽: 방위별 간략 설명 */}
                  <div className="flex-1 space-y-2 text-[10px] w-full">
                    <div className="flex items-center gap-2 bg-white/70 p-2 rounded-lg border border-emerald-100/30">
                      <span className="w-2 h-2 rounded-full bg-[#1A2E40]" />
                      <span className="font-semibold text-gray-800 w-12 text-[9px]">북쪽 (水)</span>
                      <span className="text-gray-500">침실 배치. 상열감 해소, 면역 및 숙면 유도</span>
                    </div>
                    <div className="flex items-center gap-2 bg-white/70 p-2 rounded-lg border border-emerald-100/30">
                      <span className="w-2 h-2 rounded-full bg-[#7F8C8D]" />
                      <span className="font-semibold text-gray-800 w-12 text-[9px]">서쪽 (金)</span>
                      <span className="text-gray-500">서재/책상. 금속 소품 매칭, 집중력 및 의지 강화</span>
                    </div>
                    <div className="flex items-center gap-2 bg-white/70 p-2 rounded-lg border border-emerald-100/30">
                      <span className="w-2 h-2 rounded-full bg-[#2E5A44]" />
                      <span className="font-semibold text-gray-800 w-12 text-[9px]">동쪽 (木)</span>
                      <span className="text-gray-500">거실 배치. 관엽식물 도입, 생기 및 기류 순환</span>
                    </div>
                    <div className="flex items-center gap-2 bg-white/70 p-2 rounded-lg border border-emerald-100/30">
                      <span className="w-2 h-2 rounded-full bg-[#8B221E]" />
                      <span className="font-semibold text-gray-800 w-12 text-[9px]">남쪽 (火)</span>
                      <span className="text-gray-500">주방/환기. 붉은 조율, 과열 방지 및 에너지 안정</span>
                    </div>
                    <div className="flex items-center gap-2 bg-white/70 p-2 rounded-lg border border-emerald-100/30">
                      <span className="w-2 h-2 rounded-full bg-[#D4AC0D]" />
                      <span className="font-semibold text-gray-800 w-12 text-[9px]">중앙 (土)</span>
                      <span className="text-gray-500">현관/중심. 노란 매트 및 청결 유지, 재물운 방어</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 시각화 2: 풍수 기류 활성화 게이지 */}
              <div className="bg-[#FAF7F0]/40 border border-[#E2DDD5] rounded-xl p-4 space-y-3 shadow-inner">
                <span className="font-bold text-xs text-[#5F7A68] block">📊 신년 가택 풍수 기류 안정 지표</span>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <div className="flex justify-between text-[9px] font-semibold text-[#5F7A68]">
                      <span>주거 환경 정서 안정도</span>
                      <span className="text-[#5F7A68]">92%</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-[#5F7A68] rounded-full" style={{ width: "92%" }} />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-[9px] font-semibold text-[#5F7A68]">
                      <span>사무 공간 집중 효율도</span>
                      <span className="text-[#5F7A68]">85%</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-[#5F7A68] rounded-full" style={{ width: "85%" }} />
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 pt-1">
                  <div className="space-y-1">
                    <div className="flex justify-between text-[9px] font-semibold text-[#5F7A68]">
                      <span>현관문 외부 탁기 차단율</span>
                      <span className="text-[#5F7A68]">88%</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-[#5F7A68] rounded-full" style={{ width: "88%" }} />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-[9px] font-semibold text-[#5F7A68]">
                      <span>가택 재물 창고 활성화</span>
                      <span className="text-[#5F7A68]">90%</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-[#5F7A68] rounded-full" style={{ width: "90%" }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* 개선된 풍수 조견표 */}
              <span className="font-bold text-xs text-[#5F7A68] block pt-2">🔑 공간별 상세 풍수 가이드</span>
              <div className="border border-emerald-100 rounded-xl overflow-hidden shadow-sm">
                <table className="w-full text-[9px] text-left border-collapse">
                  <thead>
                    <tr className="bg-emerald-50 text-emerald-800 font-bold border-b border-emerald-100">
                      <th className="p-2">대상 공간</th>
                      <th className="p-2 text-center">풍수 처방 및 배치</th>
                      <th className="p-2 text-center">권장 컬러</th>
                      <th className="p-2">풍수 조율 및 개운 효과</th>
                    </tr>
                  </thead>
                  <tbody className="text-gray-600 font-light">
                    <tr className="border-b border-[#E2DDD5]/40">
                      <td className="p-2 font-semibold text-gray-800">🛏️ 침실 (수면방)</td>
                      <td className="p-2 text-center font-medium">북쪽 베개 배치</td>
                      <td className="p-2 text-center text-[#1A2E40] font-semibold">네이비, 딥그레이</td>
                      <td className="p-2">뇌의 상열감을 내리고 깊은 숙면과 면역력을 회복함</td>
                    </tr>
                    <tr className="border-b border-[#E2DDD5]/40">
                      <td className="p-2 font-semibold text-gray-800">🖥️ 업무 책상 (서재)</td>
                      <td className="p-2 text-center font-medium">우측 메탈 펜꽂이 배치</td>
                      <td className="p-2 text-center text-[#7F8C8D] font-semibold">실버, 화이트</td>
                      <td className="p-2">금(金)의 기류를 활성화해 고도의 판단력 and 아이디어 제고</td>
                    </tr>
                    <tr className="border-b border-[#E2DDD5]/40">
                      <td className="p-2 font-semibold text-gray-800">🚪 현관 (출입구)</td>
                      <td className="p-2 text-center font-medium">맑은 종 배치, 청결 매트</td>
                      <td className="p-2 text-center text-[#D4AC0D] font-semibold">베이지, 옐로우</td>
                      <td className="p-2">외부의 탁기와 마찰 살기를 맑은 소리로 방어하고 재물 흡수</td>
                    </tr>
                    <tr className="border-b border-[#E2DDD5]/40">
                      <td className="p-2 font-semibold text-gray-800">🛋️ 거실 (생기 순환)</td>
                      <td className="p-2 text-center font-medium">동쪽 잎 넓은 관엽식물</td>
                      <td className="p-2 text-center text-[#2E5A44] font-semibold">그린, 아이보리</td>
                      <td className="p-2">목(木)의 생기를 통해 정체된 집안의 기류를 순환시키고 가화만사성 유도</td>
                    </tr>
                    <tr>
                      <td className="p-2 font-semibold text-gray-800">🍳 주방 (화기 조율)</td>
                      <td className="p-2 text-center font-medium">식칼 숨김 보관, 청결 유지</td>
                      <td className="p-2 text-center text-[#8B221E] font-semibold">브라운, 화이트</td>
                      <td className="p-2">불과 물이 대립하는 공간으로 칼을 숨겨 살기를 억제하고 재물 안정을 꾀함</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* 3열 수칙 카드 */}
              <div className="grid grid-cols-3 gap-3 pt-2">
                <div className="bg-[#FAF7F0] border border-[#E2DDD5]/60 p-3 rounded-xl text-center shadow-inner">
                  <span className="text-xl block mb-1">🚪</span>
                  <span className="font-bold text-[#5F7A68] text-[10px] block">현관 정돈</span>
                  <p className="text-[8px] text-gray-400 font-light mt-1 leading-snug">출입구에 쓰레기 및 신발 방치를 금해 운기 순환을 기름</p>
                </div>
                <div className="bg-[#FAF7F0] border border-[#E2DDD5]/60 p-3 rounded-xl text-center shadow-inner">
                  <span className="text-xl block mb-1">🛌</span>
                  <span className="font-bold text-[#5F7A68] text-[10px] block">침실 안온</span>
                  <p className="text-[8px] text-gray-400 font-light mt-1 leading-snug">창문 쪽에 식물을 두어 외부의 과도한 빛 기류를 차단함</p>
                </div>
                <div className="bg-[#FAF7F0] border border-[#E2DDD5]/60 p-3 rounded-xl text-center shadow-inner">
                  <span className="text-xl block mb-1">🖥️</span>
                  <span className="font-bold text-[#5F7A68] text-[10px] block">서재 메탈화</span>
                  <p className="text-[8px] text-gray-400 font-light mt-1 leading-snug">스틸 안경이나 조명 등 쇠의 기운을 학습 공간에 도입</p>
                </div>
              </div>
            </div>
          </div>,
          "신년 공간 풍수 인테리어 처방"
        )`;

try {
  replaceCase("ny_fengshui_interior", "ny_lucky_items", enrichedPage47, targetOffset);
  fs.writeFileSync(filePath, content, 'utf8');
  console.log("=== Page 47 successfully enriched! ===");
} catch (error) {
  console.error("Error modifying page.js:", error.message);
  process.exit(1);
}
