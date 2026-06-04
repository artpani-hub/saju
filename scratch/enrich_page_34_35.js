const fs = require('fs');
const path = require('path');

const filePath = path.join('d:', '인터그리비티', 'saju', 'src', 'app', 'result', 'page.js');
let content = fs.readFileSync(filePath, 'utf8');

console.log("=== Enriching Page 34 (ny_social_life) and Page 35 (ny_study_fortune) ===");

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
// 1. 35페이지 (ny_study_fortune) - 단일 매핑 (offset1 이전)
// ==========================================
const enrichedPage35 = `case "ny_study_fortune":
        return wrapLock(
          <div className="space-y-6 py-4">
            <div className="text-center space-y-2 mb-8">
              <span className="text-xs text-[#A3845B] font-bold block">신년 학업 및 시험운 (新年 學業運)</span>
              <h2 className="font-myeongjo text-2xl font-bold text-[#1A1A1A]">집중력 과부하를 이기는 차분한 독기</h2>
              <div className="w-16 h-0.5 bg-[#A3845B]/30 mx-auto my-1" />
            </div>
            <div className="bg-white border border-[#E2DDD5] rounded-lg p-6 space-y-5 shadow-sm text-xs leading-relaxed font-light text-gray-700 font-traditional">
              <p className="text-justify font-light text-gray-600">
                2026년 병오년은 세운의 강력한 화(火) 기운이 의뢰인 {name}님의 머리 쪽으로 열을 올리는 상열감(上熱感)을 자극하기 쉽습니다. 이로 인해 평소보다 가슴이 답답하고 집중력이 쉽게 흩어지며, 시험을 앞두고 불필요한 불안감이나 조급증이 유발될 수 있습니다. 엉덩이를 무겁게 하고 이성적인 루틴을 굳건히 유지하는 차분한 자기 제어가 신년 자격증 취득 및 공무원/승진 시험의 성공을 가르는 핵심 열쇠입니다. 학습 공간의 풍수 재배치와 행동 수칙을 결합하여 합격 기류를 수혈받으십시오.
              </p>

              {/* 시각화: 학업/합격 역량 지표 게이지 */}
              <div className="bg-[#FAF7F0] border border-[#E2DDD5] rounded-xl p-4 space-y-3">
                <span className="font-bold text-xs text-[#8A6F4C] block">📊 2026년 학업 & 합격 에너지 지표</span>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <div className="flex justify-between text-[9px] font-semibold text-[#8A6F4C]">
                      <span>공식 시험/자격증 합격운</span>
                      <span className="text-[#8A6F4C]">85%</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-[#A3845B] rounded-full" style={{ width: "85%" }} />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-[9px] font-semibold text-[#8A6F4C]">
                      <span>논리적 추론 및 분석 암기력</span>
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
                      <span>두뇌 집중력 유지도</span>
                      <span className="text-[#8A6F4C]">75%</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-[#A3845B] rounded-full" style={{ width: "75%" }} />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-[9px] font-semibold text-[#8A6F4C]">
                      <span>슬럼프 극복 회복탄력성</span>
                      <span className="text-[#8A6F4C]">90%</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-[#A3845B] rounded-full" style={{ width: "90%" }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* 학습 환경 처방 조견표 */}
              <span className="font-bold text-xs text-[#8A6F4C] block pt-2">🏠 합격운을 부르는 학습 환경 처방</span>
              <div className="border border-[#E2DDD5] rounded-xl overflow-hidden shadow-sm">
                <table className="w-full text-[9px] text-left border-collapse">
                  <thead>
                    <tr className="bg-[#FAF7F0] text-[#8A6F4C] font-bold border-b border-[#E2DDD5]">
                      <th className="p-2">처방 영역</th>
                      <th className="p-2 text-center">권장 조건</th>
                      <th className="p-2">공간 조율 효과 및 설명</th>
                    </tr>
                  </thead>
                  <tbody className="text-gray-600 font-light">
                    <tr className="border-b border-[#E2DDD5]/40">
                      <td className="p-2 font-semibold text-gray-800">🪑 책상 방위</td>
                      <td className="p-2 text-center text-[#8A6F4C] font-bold">북향 (北向)</td>
                      <td className="p-2">수(水) 기운을 향해 앉음으로써 상열감을 내리고 정신을 정갈하게 안정시킴</td>
                    </tr>
                    <tr className="border-b border-[#E2DDD5]/40">
                      <td className="p-2 font-semibold text-gray-800">🎨 환경 색상</td>
                      <td className="p-2 text-center text-[#8A6F4C] font-bold">블루, 네이비, 블랙</td>
                      <td className="p-2">붉은 계열의 소품을 피하고 차가운 보색 배치를 통해 조급증과 불안 유입 방지</td>
                    </tr>
                    <tr>
                      <td className="p-2 font-semibold text-gray-800">💡 조명 및 소품</td>
                      <td className="p-2 text-center text-[#8A6F4C] font-bold">메탈 조명, 가습기</td>
                      <td className="p-2">스틸 프레임의 LED 스탠드와 책상 위 미니 수경 식물 배치로 합격 기운 보완</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* 개운 행동 3대 카드 */}
              <div className="grid grid-cols-3 gap-3 pt-2">
                <div className="bg-[#FAF7F0] border border-[#E2DDD5]/60 p-3 rounded-xl text-center shadow-inner">
                  <span className="text-lg block mb-1">💧</span>
                  <span className="font-bold text-[#8A6F4C] text-[10px] block">차가운 음용수</span>
                  <p className="text-[8px] text-gray-400 font-light mt-1 leading-snug">공부 전 냉수 한 잔으로 상열감을 즉각 진정</p>
                </div>
                <div className="bg-[#FAF7F0] border border-[#E2DDD5]/60 p-3 rounded-xl text-center shadow-inner">
                  <span className="text-lg block mb-1">🧘</span>
                  <span className="font-bold text-[#8A6F4C] text-[10px] block">3분 단전호흡</span>
                  <p className="text-[8px] text-gray-400 font-light mt-1 leading-snug">불안이 고조될 때 심호흡으로 뇌파 안정</p>
                </div>
                <div className="bg-[#FAF7F0] border border-[#E2DDD5]/60 p-3 rounded-xl text-center shadow-inner">
                  <span className="text-lg block mb-1">📴</span>
                  <span className="font-bold text-[#8A6F4C] text-[10px] block">디지털 디톡스</span>
                  <p className="text-[8px] text-gray-400 font-light mt-1 leading-snug">학습 공간 내 붉은 조명 및 스마트폰 차단</p>
                </div>
              </div>
            </div>
          </div>,
          "신년 학업 및 시험운 처방"
        )`;

// 35페이지 ny_study_fortune 교체
replaceCase("ny_study_fortune", "ny_gossip_defense", enrichedPage35, 0);


// ==========================================
// 2. 34페이지 (ny_social_life) - 중복 매핑 (offset1, offset2)
// ==========================================
const enrichedPage34 = `case "ny_social_life":
        return wrapLock(
          <div className="space-y-6 py-4">
            <div className="text-center space-y-2 mb-8">
              <span className="text-xs text-[#5F7A68] font-bold block">대인관계 조율 (人脈 關係)</span>
              <h2 className="font-myeongjo text-2xl font-bold text-[#1A1A1A]">신년 인맥 관리 및 대인관계 조율</h2>
              <div className="w-16 h-0.5 bg-[#A3845B]/30 mx-auto my-1" />
            </div>
            <div className="bg-white border border-[#E2DDD5] rounded-lg p-6 space-y-5 shadow-sm text-xs leading-relaxed font-light text-gray-700 font-traditional">
              <p className="text-justify font-light text-gray-600">
                2026년 병오년은 세운의 강력한 불꽃 기운이 인맥 생태계를 달구어, 대인관계 상에서 불필요한 대립과 리셋 기류를 자극하기 쉽습니다. 사소한 언행 하나로 평소 친했던 지인과의 마찰이 발생할 수 있으나, 귀하의 기운을 차분히 받아주고 상생을 이룰 수 있는 띠 인연과 미리 소통선을 닦아놓는다면 위기에서 등대와 같은 조력을 얻을 수 있습니다. 아래의 대인 조화 지표와 인맥 매칭 전략을 참고하여 감정의 낭비를 예방하십시오.
              </p>

              {/* 시각화: 관계 신용 및 네트워킹 지표 게이지 */}
              <div className="bg-[#F6FAF7] border border-emerald-100 rounded-xl p-4 space-y-3">
                <span className="font-bold text-xs text-[#5F7A68] block">📊 2026년 인맥 및 소통 에너지 지표</span>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <div className="flex justify-between text-[9px] font-semibold text-[#5F7A68]">
                      <span>인맥 신용도 & 신뢰 안착률</span>
                      <span className="text-[#5F7A68]">80%</span>
                    </div>
                    <div className="w-full h-1.5 bg-emerald-50 rounded-full overflow-hidden">
                      <div className="h-full bg-[#5F7A68] rounded-full" style={{ width: "80%" }} />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-[9px] font-semibold text-[#5F7A68]">
                      <span>귀인 상생 주파수 호응도</span>
                      <span className="text-[#5F7A68]">85%</span>
                    </div>
                    <div className="w-full h-1.5 bg-emerald-50 rounded-full overflow-hidden">
                      <div className="h-full bg-[#5F7A68] rounded-full" style={{ width: "85%" }} />
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 pt-1">
                  <div className="space-y-1">
                    <div className="flex justify-between text-[9px] font-semibold text-gray-500">
                      <span>불필요한 갈등 노출도</span>
                      <span className="text-gray-600">70%</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-red-400 rounded-full" style={{ width: "70%" }} />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-[9px] font-semibold text-[#5F7A68]">
                      <span>사회적 소통 및 네트워킹 효율</span>
                      <span className="text-[#5F7A68]">75%</span>
                    </div>
                    <div className="w-full h-1.5 bg-emerald-50 rounded-full overflow-hidden">
                      <div className="h-full bg-[#5F7A68] rounded-full" style={{ width: "75%" }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* 인연 매칭 인포그래픽 (3열 카드 형태) */}
              <span className="font-bold text-xs text-[#5F7A68] block pt-2">👥 2026년 귀인 및 경계 인맥 조견표</span>
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-[#F6FAF7] border border-emerald-100 p-3 rounded-xl text-justify shadow-inner">
                  <span className="font-bold text-emerald-800 text-[10px] block">👍 올해의 상생 귀인</span>
                  <span className="text-[9px] font-semibold text-emerald-950 block mt-0.5">말띠, 양띠, 개띠</span>
                  <p className="text-[8px] text-emerald-700 font-light mt-1 leading-snug">
                    의뢰인님의 일간을 안정시키고 협력 기틀을 제공해 줄 든든한 상생 파트너입니다.
                  </p>
                </div>
                <div className="bg-[#FCF6F6] border border-red-100 p-3 rounded-xl text-justify shadow-inner">
                  <span className="font-bold text-red-800 text-[10px] block">⚠️ 경계해야 할 인연</span>
                  <span className="text-[9px] font-semibold text-red-600 block mt-0.5">쥐띠 (자오충 마찰)</span>
                  <p className="text-[8px] text-red-500 font-light mt-1 leading-snug">
                    의견 대립이 촉발되고 계약서 분쟁 위험이 크므로 돈거래나 공동 서명은 단호히 금하십시오.
                  </p>
                </div>
                <div className="bg-[#FAF7F0] border border-[#E2DDD5]/60 p-3 rounded-xl text-justify shadow-inner">
                  <span className="font-bold text-[#8A6F4C] text-[10px] block">🧭 인맥 개운 요결</span>
                  <span className="text-[9px] font-semibold text-gray-500 block mt-0.5">서북 방위 & 금색 조율</span>
                  <p className="text-[8px] text-gray-400 font-light mt-1 leading-snug">
                    서북쪽 방향에서 귀인을 만나며, 은빛 실버 톤의 액세서리로 대화의 품격을 높이면 길합니다.
                  </p>
                </div>
              </div>

              {/* 갈등 조율을 위한 행동 수칙 */}
              <div className="border border-emerald-100 rounded-xl p-4 bg-[#F6FAF7]/30 text-justify space-y-2">
                <span className="font-bold text-xs text-[#5F7A68] block">🧭 인맥 갈등 차단 3대 강령</span>
                <ul className="space-y-1.5 text-[9px] text-gray-600 font-light">
                  <li>• <strong>공과 사의 완벽한 분리:</strong> 친분 관계에 기인한 구두 계약이나 차용은 기류의 팽창 속에서 100% 분쟁으로 가니 절대 불가합니다.</li>
                  <li>• <strong>의견 대립 시 3초 묵언:</strong> 음력 5월과 11월에 의견 대립이 시작되면 논리적 반박 대신 차가운 냉수를 한 잔 들이켜며 화기를 식히십시오.</li>
                </ul>
              </div>
            </div>
          </div>,
          "신년 인맥 관리 및 대인관계 조율"
        )`;

// 첫 번째 ny_social_life 교체 (offset1 기준)
replaceCase("ny_social_life", "ny_roadmap_2030", enrichedPage34, offset1);

// 두 번째 ny_social_life 교체 (offset2 기준)
replaceCase("ny_social_life", "ny_roadmap_2030", enrichedPage34, offset2);

fs.writeFileSync(filePath, content, 'utf8');
console.log("=== Page 34 and 35 successfully enriched! ===");
