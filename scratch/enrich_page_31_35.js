const fs = require('fs');
const path = require('path');

const filePath = path.join('d:', '인터그리비티', 'saju', 'src', 'app', 'result', 'page.js');
let content = fs.readFileSync(filePath, 'utf8');

console.log("=== Enriching Pages 31 to 35 in page.js ===");

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
// [Page 31] ny_career_fortune
// -----------------------------------------------------------------------------
const codePage31 = `case "ny_career_fortune": {
        const dayStemEl = sajuInfo?.day?.stemEl || "목";
        const woodCount = sajuInfo?.elements?.["목"] || 0;
        const fireCount = sajuInfo?.elements?.["화"] || 0;
        const earthCount = sajuInfo?.elements?.["토"] || 0;
        const metalCount = sajuInfo?.elements?.["금"] || 0;
        const waterCount = sajuInfo?.elements?.["수"] || 0;

        // 지표 계산
        const responsibilityScore = Math.min(99, 80 + (earthCount + metalCount) * 2);
        const harmonyScore = Math.min(95, 75 + (woodCount + waterCount) * 3);
        const volatilityScore = Math.min(95, 65 + fireCount * 5 + (dayStemEl === "목" || dayStemEl === "화" ? 10 : 0));

        // 일간별 텍스트 처방
        const careerAdviceText = {
          "목": "올해는 강렬한 화기가 나무의 기운을 다소 설기(泄氣)시키는 해이므로, 무리한 업무 확장보다는 내실과 안정에 주력하십시오. 주변의 이직 유혹이 있더라도 현재 위치를 굳건히 지키는 수성(守城) 전략이 커리어 성공률을 극대화합니다.",
          "화": "나의 주체적인 기운(불)이 극도로 과열되는 한 해입니다. 직장 상사나 동료와의 갈등 발생 시 섣부르게 사직서를 내거나 감정적으로 대응하면 크게 불리하니, 이성적인 판단력을 유지하고 3일 이상 고민한 뒤 중요한 결정을 내리십시오.",
          "토": "뜨거운 화기가 대지를 돕는 화생토(火生土)의 해이므로, 조직 내에서 문서상의 승인, 자격 취득, 권한의 확대 등 매우 상서로운 흐름이 예상됩니다. 중간 관리자로서 신임을 굳건히 하고 주도적으로 프로젝트를 이끄십시오.",
          "금": "용광로 속에서 단단히 제련되는 한 해입니다. 과도한 업무 책임과 임무가 주어져 일시적으로 번아웃이 오기 쉬우나, 이를 인내하고 극복하면 값진 승진과 직책 상승이라는 최고의 명예로 보상받게 될 것입니다.",
          "수": "뜨거운 불길을 조절하는 물의 역할을 수행하므로, 조직 내 핵심 해결사로 등극하여 높은 성과를 인정받습니다. 일시적으로 연봉 상승 기회가 생길 수 있으니 차분하고 이성적으로 협상 테이블에 임하십시오."
        }[dayStemEl] || "병오년의 활발한 불꽃 기류 속에서 지나친 변동을 삼가고, 내실을 다지며 신뢰를 쌓아가는 것이 신년 커리어 안정을 돕는 최고의 방책입니다.";

        return wrapLock(
          <div className="space-y-6 py-4">
            <div className="text-center space-y-2 mb-8">
              <span className="text-xs text-[#5F7A68] font-bold block">신년 직장 및 커리어 (新年 職務運)</span>
              <h2 className="font-myeongjo text-2xl font-bold text-[#1A1A1A]">조직 내 입지와 책임감의 시험대</h2>
              <div className="w-16 h-0.5 bg-[#5F7A68]/30 mx-auto my-1" />
            </div>
            <div className="bg-white border border-[#E2DDD5] rounded-lg p-6 space-y-5 shadow-sm text-xs leading-relaxed font-light text-gray-700 font-traditional">
              <p className="text-justify font-light text-gray-600">
                2026년은 명예와 조직운을 상징하는 관성(官星) 기류가 세운의 격렬한 불꽃 기운과 조우하는 해입니다. 무조건적인 확장이나 홧김에 하는 이직은 극약 처방이 될 수 있으며, 현재 조직에서 내 가치를 확실히 입증하고 기반을 닦는 뚝심이 더 크게 인정받는 해가 될 것입니다.
              </p>

              {/* 시각화: 커리어 상승 지수 */}
              <div className="bg-[#F6FAF7] border border-emerald-100 rounded-xl p-4 space-y-3">
                <span className="font-bold text-xs text-[#5F7A68] block">📊 신년 커리어 역량 기류</span>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <div className="flex justify-between text-[9px] font-semibold text-[#5F7A68]">
                      <span>업무 책임감 & 직무 전문성</span>
                      <span className="text-[#5F7A68]">{responsibilityScore}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-emerald-50 rounded-full overflow-hidden">
                      <div className="h-full bg-[#5F7A68] rounded-full" style={{ width: \`\${responsibilityScore}%\` }} />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-[9px] font-semibold text-[#5F7A68]">
                      <span>조직 내 조화 및 소통성</span>
                      <span className="text-[#5F7A68]">{harmonyScore}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-emerald-50 rounded-full overflow-hidden">
                      <div className="h-full bg-[#5F7A68] rounded-full" style={{ width: \`\${harmonyScore}%\` }} />
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 pt-1">
                  <div className="space-y-1">
                    <div className="flex justify-between text-[9px] font-semibold text-gray-500">
                      <span>상반기 성급한 이직 변동성</span>
                      <span className="text-gray-600">{volatilityScore}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-gray-400 rounded-full" style={{ width: \`\${volatilityScore}%\` }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* 커리어 전략 카드 */}
              <div className="border border-emerald-100 rounded-xl p-4 bg-[#F6FAF7]/50 text-justify space-y-3">
                <span className="font-bold text-xs text-[#5F7A68] block">💡 커리어 조율 개운 비방 ({dayStemEl}일간 맞춤)</span>
                <p className="text-[10px] text-gray-600 leading-relaxed font-light">
                  {careerAdviceText}
                </p>
                <p className="text-[9px] text-gray-400 leading-normal border-t border-emerald-100/50 pt-2 font-light">
                  * 특히 금(金) 기운의 조력이 본격화되는 <strong>하반기(음력 7월 이후)</strong>에 이직서 제출이나 부서 변동 협상을 실행해야 후회 없는 결정을 이끌어낼 수 있습니다.
                </p>
              </div>
            </div>
          </div>,
          "신년 직장 및 커리어"
        );
      }`;

// -----------------------------------------------------------------------------
// [Page 32] ny_career_detailed
// -----------------------------------------------------------------------------
const codePage32 = `case "ny_career_detailed": {
        const dayStemEl = sajuInfo?.day?.stemEl || "목";
        const woodCount = sajuInfo?.elements?.["목"] || 0;
        const fireCount = sajuInfo?.elements?.["화"] || 0;
        const earthCount = sajuInfo?.elements?.["토"] || 0;
        const metalCount = sajuInfo?.elements?.["금"] || 0;
        const waterCount = sajuInfo?.elements?.["수"] || 0;

        // 지표 계산
        const jobChangeScore = Math.min(99, 70 + (metalCount + waterCount) * 4);
        const promotionScore = Math.min(95, 70 + (earthCount + metalCount) * 4);
        const frictionScore = Math.min(95, 50 + fireCount * 8);
        const professionalScore = Math.min(99, 80 + (earthCount + metalCount) * 2);

        // 골든타임 가이드 텍스트 (일간별)
        const detailedTimeline = {
          "목": { spring: "비교적 조용히 역량 보존 및 이력서 최신화에 전념할 때입니다.", summer: "화기가 팽창해 구설수가 우려되니 마찰을 전면 방어하십시오.", autumn: "금(金) 기운이 찾아와 문서를 취득하고 이직 도장을 찍기 최고의 적기입니다." },
          "화": { spring: "직무상 사소한 불만에 흔들리지 않도록 마인드 컨트롤이 최선입니다.", summer: "동료와 심한 의견 충돌이나 충동적 사직 가능성이 크니 절대 수성하십시오.", autumn: "열기가 식으면서 협상력이 상승하니 연봉 및 부서 조율을 도모하십시오." },
          "토": { spring: "새로운 프로젝트나 문서 업무가 시작되는 바쁜 준비기입니다.", summer: "화생토의 강력한 기운이 나를 지탱하므로 자격증 취득에 매우 유리합니다.", autumn: "실질적인 권위 상승 및 승진 기류가 본격적으로 작동하는 골든타임입니다." },
          "금": { spring: "업무 스트레스가 과중되나 기반을 닦는 중요한 수련 단계입니다.", summer: "감정적 조급증으로 협상판을 깨지 않도록 마음의 정돈이 필요합니다.", autumn: "나를 제련하던 용광로가 끝나고 마침내 완성된 보석처럼 명예가 드러나는 시기입니다." },
          "수": { spring: "조용히 변화를 조율하며 향후 재무/비즈니스 계획을 세우는 시기입니다.", summer: "재물 기회가 크게 들어오니 내 업무적 성과를 적극 어필하십시오.", autumn: "계약 협상 및 상사 귀인의 조력으로 이직/승진에 가장 유리한 달입니다." }
        }[dayStemEl] || { spring: "조용히 이력서를 보강하고 기본에 충실하십시오.", summer: "자오충으로 인한 급격한 충동적 결정은 뒤로 유보하는 것이 안전합니다.", autumn: "오행의 평온이 회복되면서 계약 서명이나 이직 원서 제출에 길합니다." };

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
                      <span className="text-[#5F7A68]">{jobChangeScore}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-emerald-50 rounded-full overflow-hidden">
                      <div className="h-full bg-[#5F7A68] rounded-full" style={{ width: \`\${jobChangeScore}%\` }} />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-[9px] font-semibold text-[#5F7A68]">
                      <span>내부 승진 및 권위 획득율</span>
                      <span className="text-[#5F7A68]">{promotionScore}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-emerald-50 rounded-full overflow-hidden">
                      <div className="h-full bg-[#5F7A68] rounded-full" style={{ width: \`\${promotionScore}%\` }} />
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 pt-1">
                  <div className="space-y-1">
                    <div className="flex justify-between text-[9px] font-semibold text-gray-500">
                      <span>상반기 갈등 및 마찰 지수</span>
                      <span className="text-gray-600">{frictionScore}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-red-400 rounded-full" style={{ width: \`\${frictionScore}%\` }} />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-[9px] font-semibold text-[#5F7A68]">
                      <span>업무 책임감 & 직무 전문성</span>
                      <span className="text-[#5F7A68]">{professionalScore}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-emerald-50 rounded-full overflow-hidden">
                      <div className="h-full bg-[#5F7A68] rounded-full" style={{ width: \`\${professionalScore}%\` }} />
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
                  <p className="text-[8.5px] text-gray-600 font-light mt-1 leading-snug">
                    {detailedTimeline.spring}
                  </p>
                </div>
                <div className="bg-[#FCF6F6] border border-red-100 p-3 rounded-xl text-justify shadow-inner">
                  <span className="font-bold text-red-800 text-[10px] block">🔥 2분기: 조급 & 경계</span>
                  <span className="text-[9px] font-semibold text-red-600 block mt-0.5">음력 4월 ~ 6월</span>
                  <p className="text-[8.5px] text-red-600 font-light mt-1 leading-snug">
                    {detailedTimeline.summer}
                  </p>
                </div>
                <div className="bg-[#F6FAF7] border border-emerald-100 p-3 rounded-xl text-justify shadow-inner">
                  <span className="font-bold text-emerald-800 text-[10px] block">🍂 3-4분기: 계약 & 이동</span>
                  <span className="text-[9px] font-semibold text-emerald-600 block mt-0.5">음력 7월 ~ 12월</span>
                  <p className="text-[8.5px] text-emerald-700 font-light mt-1 leading-snug">
                    {detailedTimeline.autumn}
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
        );
      }`;

// -----------------------------------------------------------------------------
// [Page 33] ny_love_fortune
// -----------------------------------------------------------------------------
const codePage33 = `case "ny_love_fortune": {
        const dayStemEl = sajuInfo?.day?.stemEl || "목";
        const woodCount = sajuInfo?.elements?.["목"] || 0;
        const fireCount = sajuInfo?.elements?.["화"] || 0;
        const earthCount = sajuInfo?.elements?.["토"] || 0;
        const metalCount = sajuInfo?.elements?.["금"] || 0;
        const waterCount = sajuInfo?.elements?.["수"] || 0;

        // 지표 계산
        const loveStabilityScore = Math.min(98, 75 + (woodCount + earthCount) * 3);
        const communicationScore = Math.min(95, 70 + (waterCount + metalCount) * 4);

        // 연애 솔루션 일간별
        const loveAdviceList = {
          "목": [
            "수생목(水生木)의 완충 기류가 절실하므로 감정이 격앙될 때 네이비나 차콜 계열의 의상을 입어 이성적인 차분함을 표현하십시오.",
            "커플: 상대방에게 강요나 재촉을 하기보다는 10초 늦게 말하기를 통해 부드러운 중용의 미덕을 실천할 때 관계가 굳건해집니다."
          ],
          "화": [
            "나와 같은 불꽃이 불타오르는 기류이므로 감정의 대립 시 폭발하기 쉽습니다. 데이트 중 의견이 충돌하면 즉각 침묵하고 자리를 잠시 비우십시오.",
            "솔로: 갑작스럽고 자극적인 이성과의 만남보다 지인의 정중한 소개를 통한 진지한 대화가 훨씬 길한 인연을 부릅니다."
          ],
          "토": [
            "화생토의 안정성이 뒷받침되므로 가정 내 경사나 뜻밖의 기쁜 소식이 찾아오는 따뜻하고 상서로운 달입니다.",
            "커플: 연인과 함께 고풍스러운 찻집을 가거나 대지를 밟으며 산책하는 데이트를 즐길 때 가정이 평안해집니다."
          ],
          "금": [
            "화기운에 제련되는 격이니 감정이 다소 예민해질 수 있습니다. 연인이나 가족에게 스트레스를 해소하지 않도록 주의하십시오.",
            "솔로: 화려하고 돋보이는 코디보다는 단정하고 깔끔한 화이트/실버 톤의 액세서리로 대인 신뢰감을 극대화하십시오."
          ],
          "수": [
            "불꽃을 조율하는 시원한 소나기가 내리는 운세로, 대인관계 주파수가 안정되고 대화의 주도권을 쥐게 됩니다.",
            "커플: 그간 서먹했거나 오해가 쌓여있던 연인과의 대화가 물 흐르듯 순탄하게 풀려나가며 더욱 친밀해질 것입니다."
          ]
        }[dayStemEl] || [
          "세운의 강력한 화기 속에서 불필요한 고집을 꺾고 상대를 먼저 존중하는 배려의 자세가 애정을 탄탄하게 유지합니다.",
          "음력 5월과 11월에 일시적인 마찰 기류가 극에 달하니 대화를 부드럽고 차분하게 조율하는 것이 개운의 요체입니다."
        ];

        return wrapLock(
          <div className="space-y-6 py-4">
            <div className="text-center space-y-2 mb-8">
              <span className="text-xs text-[#B26E8D] font-bold block">신년 연애 및 가정운 (新年 愛情運)</span>
              <h2 className="font-myeongjo text-2xl font-bold text-[#1A1A1A]">뜨거운 열기 속에서 필요한 차분한 포용력</h2>
              <div className="w-16 h-0.5 bg-[#B26E8D]/30 mx-auto my-1" />
            </div>
            <div className="bg-white border border-[#E2DDD5] rounded-lg p-6 space-y-5 shadow-sm text-xs leading-relaxed font-light text-gray-700 font-traditional">
              <p className="text-justify font-light text-gray-600">
                병오년의 강렬한 화기는 열정적이고 급격한 인연의 끌림을 선사하기도 하지만, 과열된 감정 탓에 사소한 단어 하나가 큰 싸움으로 불타오르는 감정의 화재를 유발하기 쉽습니다. 상대방을 향한 비판보다는 차분하게 한 걸음 물러나 경청하는 여유가 가정을 지키는 최고의 방책입니다.
              </p>

              {/* 시각화: 관계 조화도 */}
              <div className="bg-[#FCF6F9] border border-pink-100 rounded-xl p-4 space-y-3">
                <span className="font-bold text-xs text-[#B26E8D] block">📊 신년 관계 및 가정 주파수</span>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <div className="flex justify-between text-[9px] font-semibold text-[#B26E8D]">
                      <span>가정 및 관계 안정도</span>
                      <span className="text-[#B26E8D]">{loveStabilityScore}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-pink-50 rounded-full overflow-hidden">
                      <div className="h-full bg-[#B26E8D] rounded-full" style={{ width: \`\${loveStabilityScore}%\` }} />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-[9px] font-semibold text-[#B26E8D]">
                      <span>소통 및 경청 원활도</span>
                      <span className="text-[#B26E8D]">{communicationScore}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-pink-50 rounded-full overflow-hidden">
                      <div className="h-full bg-[#B26E8D] rounded-full" style={{ width: \`\${communicationScore}%\` }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* 소통 가이드 */}
              <div className="border border-pink-100 rounded-xl p-4 bg-[#FCF6F9]/50 text-justify space-y-3">
                <span className="font-bold text-xs text-[#B26E8D] block">❤️ 혜안당 애정 개운 솔루션 ({dayStemEl}일간 맞춤)</span>
                <ul className="space-y-2 text-[10px] text-gray-600 font-light">
                  <li>• <strong>솔로:</strong> {loveAdviceList[0]}</li>
                  <li>• <strong>기혼/커플:</strong> {loveAdviceList[1]}</li>
                </ul>
              </div>
            </div>
          </div>,
          "신년 연애 및 가정운"
        );
      }`;

// -----------------------------------------------------------------------------
// [Page 34] ny_social_life
// -----------------------------------------------------------------------------
const codePage34 = `case "ny_social_life": {
        const dayStemEl = sajuInfo?.day?.stemEl || "목";
        const woodCount = sajuInfo?.elements?.["목"] || 0;
        const fireCount = sajuInfo?.elements?.["화"] || 0;
        const earthCount = sajuInfo?.elements?.["토"] || 0;
        const metalCount = sajuInfo?.elements?.["금"] || 0;
        const waterCount = sajuInfo?.elements?.["수"] || 0;

        // 지표 계산
        const socialTrustScore = Math.min(95, 75 + earthCount * 4);
        const connectionFrequency = Math.min(95, 70 + (woodCount + waterCount) * 4);
        const relationshipFriction = Math.min(95, 40 + fireCount * 8);
        const communicationEfficiency = Math.min(95, 75 + (waterCount + metalCount) * 3);

        // 상생 귀인 및 경계 띠 (일간별 궁합 분석)
        const affinityZodiacs = {
          "목": { lucky: "돼지띠, 토끼띠, 양띠", bad: "쥐띠", desc: "나를 수생목/목해합으로 생조 및 조력하는 기운으로 계약서 검토 및 신규 인프라 획득에 최고의 파트너입니다." },
          "화": { lucky: "개띠, 양띠, 호랑이띠", bad: "쥐띠 (자오충 충돌)", desc: "강한 불기를 설기시켜 이성을 찾아주고 동업적 제안 시 실익을 배가시켜주는 띠입니다." },
          "토": { lucky: "뱀띠, 말띠, 닭띠", bad: "토끼띠", desc: "화생토의 에너지 순환과 금의 결실로 나의 문서 자산을 수호하고 신용도를 올려주는 귀인입니다." },
          "금": { lucky: "닭띠, 뱀띠, 용띠", bad: "범띠", desc: "뜨거운 제련을 견디도록 금의 뿌리를 지탱해주고 신년 문서 계약 체결 시 도장을 보증할 든든한 조력자입니다." },
          "수": { lucky: "원숭이띠, 쥐띠, 돼지띠", bad: "말띠 (수화 상쟁)", desc: "금생수로 물줄기의 근원을 살리고 자금 유통과 투자 협업 시 등대와 같은 현실 조언을 건넵니다." }
        }[dayStemEl] || { lucky: "말띠, 양띠, 개띠", bad: "쥐띠", desc: "의뢰인님의 명조 기류를 조율하고 일시적인 대인관계 갈등을 지탱해줄 최상의 궁합 띠입니다." };

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
                      <span className="text-[#5F7A68]">{socialTrustScore}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-emerald-50 rounded-full overflow-hidden">
                      <div className="h-full bg-[#5F7A68] rounded-full" style={{ width: \`\${socialTrustScore}%\` }} />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-[9px] font-semibold text-[#5F7A68]">
                      <span>귀인 상생 주파수 호응도</span>
                      <span className="text-[#5F7A68]">{connectionFrequency}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-emerald-50 rounded-full overflow-hidden">
                      <div className="h-full bg-[#5F7A68] rounded-full" style={{ width: \`\${connectionFrequency}%\` }} />
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 pt-1">
                  <div className="space-y-1">
                    <div className="flex justify-between text-[9px] font-semibold text-gray-500">
                      <span>불필요한 갈등 노출도</span>
                      <span className="text-gray-600">{relationshipFriction}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-red-400 rounded-full" style={{ width: \`\${relationshipFriction}%\` }} />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-[9px] font-semibold text-[#5F7A68]">
                      <span>사회적 소통 및 네트워킹 효율</span>
                      <span className="text-[#5F7A68]">{communicationEfficiency}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-emerald-50 rounded-full overflow-hidden">
                      <div className="h-full bg-[#5F7A68] rounded-full" style={{ width: \`\${communicationEfficiency}%\` }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* 인연 매칭 인포그래픽 (3열 카드 형태) */}
              <span className="font-bold text-xs text-[#5F7A68] block pt-2">👥 2026년 귀인 및 경계 인맥 조견표 ({dayStemEl}일간 맞춤)</span>
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-[#F6FAF7] border border-emerald-100 p-3 rounded-xl text-justify shadow-inner">
                  <span className="font-bold text-emerald-800 text-[10px] block">👍 올해의 상생 귀인</span>
                  <span className="text-[9px] font-semibold text-emerald-950 block mt-0.5">{affinityZodiacs.lucky}</span>
                  <p className="text-[8px] text-emerald-700 font-light mt-1 leading-snug">
                    {affinityZodiacs.desc}
                  </p>
                </div>
                <div className="bg-[#FCF6F6] border border-red-100 p-3 rounded-xl text-justify shadow-inner">
                  <span className="font-bold text-red-800 text-[10px] block">⚠️ 경계해야 할 인연</span>
                  <span className="text-[9px] font-semibold text-red-600 block mt-0.5">{affinityZodiacs.bad}</span>
                  <p className="text-[8px] text-red-500 font-light mt-1 leading-snug">
                    주요 계약 분쟁이 생기거나 감정적 부침을 겪기 쉬우니 한 템포 유보하는 태도가 좋습니다.
                  </p>
                </div>
                <div className="bg-[#FAF7F0] border border-[#E2DDD5]/60 p-3 rounded-xl text-justify shadow-inner">
                  <span className="font-bold text-[#8A6F4C] text-[10px] block">🧭 인맥 개운 요결</span>
                  <span className="text-[9px] font-semibold text-gray-500 block mt-0.5">서북 방위 & 금색 조율</span>
                  <p className="text-[8px] text-gray-400 font-light mt-1 leading-snug">
                    서북쪽 방향의 인프라를 활용하고, 은빛 실버 액세서리나 정돈된 복장이 대화의 신뢰를 올립니다.
                  </p>
                </div>
              </div>

              {/* 갈등 조율을 위한 행동 수칙 */}
              <div className="border border-emerald-100 rounded-xl p-4 bg-[#F6FAF7]/30 text-justify space-y-2">
                <span className="font-bold text-xs text-[#5F7A68] block">🧭 인맥 갈등 차단 3대 강령</span>
                <ul className="space-y-1.5 text-[9px] text-gray-600 font-light">
                  <li>• <strong>공과 사의 완벽한 분리:</strong> 친분 관계에 기인한 구두 계약이나 차용은 기류의 팽창 속에서 분쟁으로 가기 쉬우니 명확한 서류를 마련하십시오.</li>
                  <li>• <strong>의견 대립 시 3초 묵언:</strong> 음력 5월과 11월에 의견 대립이 시작되면 논리적 반박 대신 차가운 냉수를 한 잔 들이켜며 화기를 식히십시오.</li>
                </ul>
              </div>
            </div>
          </div>,
          "신년 인맥 관리 및 대인관계 조율"
        );
      }`;

// -----------------------------------------------------------------------------
// [Page 35] ny_study_fortune
// -----------------------------------------------------------------------------
const codePage35 = `case "ny_study_fortune": {
        const dayStemEl = sajuInfo?.day?.stemEl || "목";
        const woodCount = sajuInfo?.elements?.["목"] || 0;
        const fireCount = sajuInfo?.elements?.["화"] || 0;
        const earthCount = sajuInfo?.elements?.["토"] || 0;
        const metalCount = sajuInfo?.elements?.["금"] || 0;
        const waterCount = sajuInfo?.elements?.["수"] || 0;

        // 지표 계산
        const examScore = Math.min(99, 70 + (metalCount + earthCount) * 4);
        const reasoningScore = Math.min(95, 70 + (metalCount + waterCount) * 4);
        const focusScore = Math.max(50, 95 - fireCount * 5);
        const resilienceScore = Math.min(98, 75 + (woodCount + earthCount) * 3);

        // 부족 오행 분석
        const elementCounts = { "목": woodCount, "화": fireCount, "토": earthCount, "금": metalCount, "수": waterCount };
        let deficientElement = "수";
        let minCount = 99;
        Object.entries(elementCounts).forEach(([el, count]) => {
          if (count < minCount) {
            minCount = count;
            deficientElement = el;
          }
        });

        // 부족 오행에 최적화된 공부방 처방 테이블
        const studyDeficiencyAdvices = {
          "수": { direction: "북향 (北向)", color: "블루, 네이비, 블랙", decor: "가습기, 미니 수경 식물", desc: "차가운 수(水) 기운을 통해 상열감을 내리고 뇌파를 정갈하게 안정시키는 수승화강 효과를 도모합니다." },
          "목": { direction: "동향 (東向)", color: "초록색, 그린 톤", decor: "나무 연필꽂이, 화분", desc: "목(木)의 성장 기류와 활기찬 시작의 기운을 수혈하여 끈기 있고 활력 있는 두뇌 회전을 돕습니다." },
          "화": { direction: "남향 (南向)", color: "붉은 포인트, 오렌지", decor: "따뜻한 스탠드, 조명", desc: "적절한 집중의 열기(火)를 인위적으로 유도하여 시험 전 막판 암기 스퍼트 및 의욕 극대화를 유발합니다." },
          "토": { direction: "중앙 및 황토색", color: "노란색, 베이지, 브라운", decor: "황토 도자기, 스톤 소품", desc: "토(土)의 굳건하고 안정된 대지의 성정을 공급하여 엉덩이를 무겁게 하고 장기 집중력을 지탱합니다." },
          "금": { direction: "서향 (西向)", color: "화이트, 골드, 실버", decor: "메탈 조명, 철제 책상", desc: "금(金)의 칼날 같은 명확성과 결단력을 자극하여 논리적 추론 및 오차 없는 오답 분석을 지원합니다." }
        }[deficientElement] || { direction: "북향 (北向)", color: "블루, 네이비, 블랙", decor: "가습기, 미니 수경 식물", desc: "부족한 보색 조율을 통해 신년 공부방 기류를 최적의 집중 환경으로 승화시킵니다." };

        return wrapLock(
          <div className="space-y-6 py-4">
            <div className="text-center space-y-2 mb-8">
              <span className="text-xs text-[#A3845B] font-bold block">신년 학업 및 시험운 (新年 學업運)</span>
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
                      <span className="text-[#8A6F4C]">{examScore}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-[#A3845B] rounded-full" style={{ width: \`\${examScore}%\` }} />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-[9px] font-semibold text-[#8A6F4C]">
                      <span>논리적 추론 및 분석 암기력</span>
                      <span className="text-[#8A6F4C]">{reasoningScore}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-[#A3845B] rounded-full" style={{ width: \`\${reasoningScore}%\` }} />
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 pt-1">
                  <div className="space-y-1">
                    <div className="flex justify-between text-[9px] font-semibold text-[#8A6F4C]">
                      <span>두뇌 집중력 유지도</span>
                      <span className="text-[#8A6F4C]">{focusScore}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-[#A3845B] rounded-full" style={{ width: \`\${focusScore}%\` }} />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-[9px] font-semibold text-[#8A6F4C]">
                      <span>슬럼프 극복 회복탄력성</span>
                      <span className="text-[#8A6F4C]">{resilienceScore}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-[#A3845B] rounded-full" style={{ width: \`\${resilienceScore}%\` }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* 학습 환경 처방 조견표 */}
              <span className="font-bold text-xs text-[#8A6F4C] block pt-2">🏠 합격운을 부르는 학습 환경 처방 (부족오행 '{deficientElement}' 기운 보완)</span>
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
                      <td className="p-2 text-center text-[#8A6F4C] font-bold">{studyDeficiencyAdvices.direction}</td>
                      <td className="p-2">{studyDeficiencyAdvices.desc}</td>
                    </tr>
                    <tr className="border-b border-[#E2DDD5]/40">
                      <td className="p-2 font-semibold text-gray-800">🎨 환경 색상</td>
                      <td className="p-2 text-center text-[#8A6F4C] font-bold">{studyDeficiencyAdvices.color}</td>
                      <td className="p-2">보색의 가구/커튼 배치로 마인드 밸런스를 유도해 조급증과 불안 차단</td>
                    </tr>
                    <tr>
                      <td className="p-2 font-semibold text-gray-800">💡 조명 및 소품</td>
                      <td className="p-2 text-center text-[#8A6F4C] font-bold">{studyDeficiencyAdvices.decor}</td>
                      <td className="p-2">해당 수호 소품 배치를 책상에 세팅하여 학습 기맥을 보강</td>
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
        );
      }`;

// 실행
replaceSingleCase("ny_career_fortune", "ny_love_fortune", codePage31);
replaceSingleCase("ny_love_fortune", "ny_study_fortune", codePage33);
replaceSingleCase("ny_study_fortune", "ny_gossip_defense", codePage35);

replaceDoubleCase("ny_career_detailed", "ny_social_life", codePage32);
replaceDoubleCase("ny_social_life", "ny_roadmap_2030", codePage34);

fs.writeFileSync(filePath, content, 'utf8');
console.log("=== All Pages 31-35 successfully enriched and saved! ===");
