const fs = require('fs');
const path = require('path');

const filePath = path.join('d:', '인터그리비티', 'saju', 'src', 'app', 'result', 'page.js');
let content = fs.readFileSync(filePath, 'utf8');

console.log("=== Enriching Page 32 (ny_career_detailed) ===");

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

const enrichedPage32 = `case "ny_career_detailed":
        return wrapLock(
          <div className="space-y-6 py-4">
            <div className="text-center space-y-2 mb-8">
              <span className="text-xs text-[#5F7A68] font-bold block">이직 및 승진 타이밍 (職務 變動)</span>
              <h2 className="font-myeongjo text-2xl font-bold text-[#1A1A1A]">신년 직무 및 신분 변화 타이밍 가이드</h2>
              <div className="w-16 h-0.5 bg-[#5F7A68]/30 mx-auto my-1" />
            </div>
            <div className="bg-white border border-[#E2DDD5] rounded-lg p-6 space-y-5 shadow-sm text-xs leading-relaxed font-light text-gray-700 font-traditional">
              <p className="text-justify font-light text-gray-600">
                2026년 병오년은 세운의 강렬한 화(화) 기운이 의뢰인 {name}님의 관성(관성: 직장 및 조직 명예)과 인성(인성: 문서 및 계약) 기류를 격렬하게 뒤흔드는 변화의 해입니다. 상반기의 성급한 판단이나 충동적인 사직은 자칫 독이 될 수 있으나, 가을철 금(금) 기운의 조력이 본격화되는 <strong>골든타임</strong>을 조율해 움직인다면 연봉 상승과 더불어 신분을 한 단계 업그레이드할 수 있는 절호의 기회입니다. 아래의 다차원 역량 기류 및 분기별 타임라인을 고려하여 체계적인 이직/승진 로드맵을 수립하십시오.
              </p>

              {/* 시각화: 커리어 역량 지표 게이지 */}
              <div className="bg-[#F6FAF7] border border-[#E2DDD5]/60 rounded-xl p-4 space-y-3">
                <span className="font-bold text-xs text-[#5F7A68] block">📊 2026년 신년 커리어 역량 지표</span>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <div className="flex justify-between text-[9px] font-semibold text-[#5F7A68]">
                      <span>이직 & 부서 이동 성공률</span>
                      <span className="text-[#5F7A68]">85%</span>
                    </div>
                    <div className="w-full h-1.5 bg-emerald-50 rounded-full overflow-hidden">
                      <div className="h-full bg-[#5F7A68] rounded-full" style={{ width: "85%" }} />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-[9px] font-semibold text-[#5F7A68]">
                      <span>내부 승진 및 권위 획득율</span>
                      <span className="text-[#5F7A68]">80%</span>
                    </div>
                    <div className="w-full h-1.5 bg-emerald-50 rounded-full overflow-hidden">
                      <div className="h-full bg-[#5F7A68] rounded-full" style={{ width: "80%" }} />
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 pt-1">
                  <div className="space-y-1">
                    <div className="flex justify-between text-[9px] font-semibold text-gray-500">
                      <span>상반기 갈등 및 마찰 지수</span>
                      <span className="text-gray-600">75%</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-red-400 rounded-full" style={{ width: "75%" }} />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-[9px] font-semibold text-[#5F7A68]">
                      <span>업무 책임감 & 직무 전문성</span>
                      <span className="text-[#5F7A68]">90%</span>
                    </div>
                    <div className="w-full h-1.5 bg-emerald-50 rounded-full overflow-hidden">
                      <div className="h-full bg-[#5F7A68] rounded-full" style={{ width: "90%" }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* 월별 커리어 로드맵 (3열 카드 형태) */}
              <span className="font-bold text-xs text-[#5F7A68] block pt-2">📅 2026년 분기별 커리어 로드맵 (음력)</span>
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-[#FAF7F0] border border-[#E2DDD5]/60 p-3 rounded-xl text-justify shadow-inner">
                  <span className="font-bold text-[#8A6F4C] text-[10px] block">🌱 1분기: 내실 & 준비</span>
                  <span className="text-[9px] font-semibold text-gray-500 block mt-0.5">음력 1월 ~ 3월</span>
                  <p className="text-[8px] text-gray-400 font-light mt-1 leading-snug">
                    부서 내 갈등 요소를 사전에 수성하고, 전문 자격증 공부 및 이력서 보강에 적합한 공부 집중 기류가 흐르는 시기입니다.
                  </p>
                </div>
                <div className="bg-[#FCF6F6] border border-red-100 p-3 rounded-xl text-justify shadow-inner">
                  <span className="font-bold text-red-800 text-[10px] block">🔥 2분기: 조급 & 경계</span>
                  <span className="text-[9px] font-semibold text-red-600 block mt-0.5">음력 4월 ~ 6월</span>
                  <p className="text-[8px] text-red-500 font-light mt-1 leading-snug">
                    자오충의 수화 상쟁 및 오오자형 극대화로 직장 동료나 상사와의 대립 기류가 최고조입니다. 충동적인 사표 제출을 극구 주의하십시오.
                  </p>
                </div>
                <div className="bg-[#F6FAF7] border border-emerald-100 p-3 rounded-xl text-justify shadow-inner">
                  <span className="font-bold text-emerald-800 text-[10px] block">🍂 3-4분기: 계약 & 이동</span>
                  <span className="text-[9px] font-semibold text-emerald-600 block mt-0.5">음력 7월 ~ 12월</span>
                  <p className="text-[8px] text-emerald-700 font-light mt-1 leading-snug">
                    가을철 선선한 금 기운과 겨울철 수 기운이 조화롭게 불어와 계약 도장을 찍고 이직 원서를 제출하기 가장 유리한 <strong>최고의 골든타임</strong>입니다.
                  </p>
                </div>
              </div>

              {/* 커리어 안착을 위한 행동 수칙 */}
              <div className="border border-emerald-100 rounded-xl p-4 bg-[#F6FAF7]/40 text-justify space-y-3">
                <span className="font-bold text-xs text-[#5F7A68] block">🧭 커리어 성공을 위한 개운 행동 지침</span>
                <ul className="space-y-2 text-[10px] text-gray-600 font-light">
                  <li>• <strong>이직 면접 및 연봉 협상:</strong> 과열된 분위기를 진정시키고 신뢰도를 풍기기 위해 차분한 네이비, 짙은 그레이 계열의 비즈니스 룩을 필히 매칭하십시오.</li>
                  <li>• <strong>골든타임 기회 확보:</strong> 특히 <strong>음력 8월(계유월)</strong>은 금(금) 기운이 극에 달해 문서운과 상사 귀인운이 상호 조력하는 최고의 계약 시기입니다.</li>
                  <li>• <strong>소통 채널 수호:</strong> 음력 5월에는 이메일이나 사내 메신저 상의 구두 합의를 가급적 피하고 명문화된 공식 서류 위주로 결재를 득해야 낭패가 없습니다.</li>
                </ul>
              </div>
            </div>
          </div>,
          "이직 및 승진 상세 타이밍 가이드"
        )`;

// 첫 번째 ny_career_detailed 교체
replaceCase("ny_career_detailed", "ny_social_life", enrichedPage32, offset1);

// 두 번째 ny_career_detailed 교체
replaceCase("ny_career_detailed", "ny_social_life", enrichedPage32, offset2);

fs.writeFileSync(filePath, content, 'utf8');
console.log("=== Page 32 successfully enriched! ===");
