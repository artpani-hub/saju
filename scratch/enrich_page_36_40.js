const fs = require('fs');
const path = require('path');

const filePath = path.join('d:', '인터그리비티', 'saju', 'src', 'app', 'result', 'page.js');
let content = fs.readFileSync(filePath, 'utf8');

console.log("=== Enriching Pages 36 to 40 in page.js ===");

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

// -----------------------------------------------------------------------------
// [Page 36] ny_gossip_defense
// -----------------------------------------------------------------------------
const codePage36 = `case "ny_gossip_defense": {
        const dayStemEl = sajuInfo?.day?.stemEl || "목";
        const woodCount = sajuInfo?.elements?.["목"] || 0;
        const fireCount = sajuInfo?.elements?.["화"] || 0;
        const earthCount = sajuInfo?.elements?.["토"] || 0;
        const metalCount = sajuInfo?.elements?.["금"] || 0;
        const waterCount = sajuInfo?.elements?.["수"] || 0;

        // 지표 계산
        const frictionRisk = Math.min(95, 50 + fireCount * 8 + (dayStemEl === "화" ? 10 : 0));
        const selfControl = Math.min(98, 70 + (woodCount + earthCount) * 3);

        // 구설 방어 조언
        const gossipAdvice = {
          "목": "목(木) 일간은 화기가 강해질 때 급하게 말을 뱉어 실수가 잦아집니다. 회의 중이나 카톡방에서 즉각 반론을 펴기보다 '검토해 보겠습니다'라며 답변을 하루 유보하는 훈련이 최고의 개운법입니다.",
          "화": "나의 주체적인 불꽃이 폭발하는 기류이므로 자존심을 건드리는 말 한마디에 폭발할 위험이 큽니다. 시비가 걸리면 그 즉시 시선을 피하고 시원한 생수를 들이켜 감정을 내리십시오.",
          "토": "대외적인 신용은 탄탄하나, 남을 돕기 위해 무심코 던진 훈수가 오해를 불러올 수 있습니다. 타인의 영역에 불필요하게 관여하지 말고 자신의 역할에만 주력하는 것이 안전합니다.",
          "금": "관성(官星)의 억압감이 가중되는 해이므로 윗사람이나 거래처 대화 시 예민한 톤이 드러나기 쉽습니다. 목소리 톤을 한 옥타브 낮추고 단정하고 공손한 태도를 굳건히 유지하십시오.",
          "수": "시원한 물줄기가 조절자 역할을 하나, 재물적 협상이나 이권 다툼 시 너무 칼날 같은 언행으로 적을 만들기 쉽습니다. 실리는 챙기되 말투는 부드러운 중용의 화법을 구사하십시오."
        }[dayStemEl] || "병오년의 뜨거운 화 기운 속에서 한 번 더 생각하고 말하는 이성적 언행 필터가 구설 액운을 완벽하게 차단해 줍니다.";

        return wrapLock(
          <div className="space-y-6 py-4">
            <div className="text-center space-y-2 mb-8">
              <span className="text-xs text-[#8B221E] font-bold block">구설 및 시비 예방 (口舌 防禦)</span>
              <h2 className="font-myeongjo text-2xl font-bold text-[#1A1A1A]">언행의 빗장을 걸어 잠가 액운을 피하는 법</h2>
              <div className="w-16 h-0.5 bg-[#A3845B]/30 mx-auto my-1" />
            </div>
            <div className="bg-white border border-[#E2DDD5] rounded-lg p-6 space-y-5 shadow-sm text-xs leading-relaxed font-light text-gray-700 font-traditional">
              <p className="text-justify font-light text-gray-600">
                2026년은 세운의 강력한 화기가 말(言)을 제어하는 이성 필터를 녹이기 쉽습니다. 평소라면 그냥 넘어갈 가벼운 농담이나 조언이 타인의 시기와 오해를 사서 큰 송사나 마찰(구설수)로 증폭될 소지가 다분합니다. 올해는 침묵이 최고의 은혜이며 보석입니다.
              </p>

              {/* 시각화: 구설 노출도 */}
              <div className="bg-red-50/20 border border-red-100 rounded-xl p-4 space-y-3">
                <span className="font-bold text-xs text-red-900 block">📊 구설 및 마찰 노출 지표</span>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <div className="flex justify-between text-[9px] font-semibold text-red-700">
                      <span>대인관계 마찰 위험도</span>
                      <span className="text-red-700">{frictionRisk}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-red-100 rounded-full overflow-hidden">
                      <div className="h-full bg-red-500 rounded-full" style={{ width: \`\${frictionRisk}%\` }} />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-[9px] font-semibold text-gray-500">
                      <span>섭섭함 & 감정 조율도</span>
                      <span className="text-gray-600">{selfControl}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-red-400 rounded-full" style={{ width: \`\${selfControl}%\` }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* 구설 예방 강령 카드 */}
              <div className="border border-red-100 rounded-xl p-4 bg-red-50/10 text-justify space-y-3">
                <span className="font-bold text-xs text-red-950 block">🧭 혜안당 구설 예방 3대 강령 ({dayStemEl}일간 맞춤)</span>
                <ul className="space-y-2 text-[10px] text-red-900 font-light">
                  <li>• <strong>1단계 (10분 보류):</strong> {gossipAdvice}</li>
                  <li>• <strong>2단계 (소셜 미디어 차단):</strong> 홧김에 적는 SNS 글이나 메신저 하소연이 캡처되어 내 등에 칼이 되어 돌아올 수 있으니 사적인 속마음 표출은 극구 제한하십시오.</li>
                  <li>• <strong>3단계 (음력 5월 극도 경계):</strong> 자오충과 오오자형이 겹치는 한여름에는 계약이나 구두 확답 시 반드시 두 번 확인하고 서면 기록을 남겨야 안전합니다.</li>
                </ul>
              </div>
            </div>
          </div>,
          "신년 구설 및 시비수 예방 수칙"
        );
      }`;

// -----------------------------------------------------------------------------
// [Page 37] ny_sinsal_active
// -----------------------------------------------------------------------------
const codePage37 = `case "ny_sinsal_active": {
        const dayStemEl = sajuInfo?.day?.stemEl || "목";
        const woodCount = sajuInfo?.elements?.["목"] || 0;
        const fireCount = sajuInfo?.elements?.["화"] || 0;
        const earthCount = sajuInfo?.elements?.["토"] || 0;
        const metalCount = sajuInfo?.elements?.["금"] || 0;
        const waterCount = sajuInfo?.elements?.["수"] || 0;

        // 지표 계산
        const dohwaScore = Math.min(95, 60 + (woodCount + fireCount) * 5);
        const yeokmaScore = Math.min(95, 55 + (waterCount + fireCount) * 5);
        const hwagaeScore = Math.min(95, 60 + (earthCount + metalCount) * 5);

        // 지배적 신살 선정 및 조언
        let dominantSinsal = "도화살 (桃花煞)";
        let sinsalTip = "신년에는 대외적인 네트워킹과 프레젠테이션, 미팅 시 나를 돋보이게 가꿀수록 인맥 신용과 재물 기회가 증폭되는 아주 상서로운 흐름입니다.";
        
        if (yeokmaScore > dohwaScore && yeokmaScore > hwagaeScore) {
          dominantSinsal = "역마살 (驛馬煞)";
          sinsalTip = "신년에는 잦은 출장, 부서 이동, 이사 등 물리적 공간 변동이 강하게 발생합니다. 조급히 머무르려 하기보다 파도에 올라타 유연하게 움직이는 것이 커리어에 유리합니다.";
        } else if (hwagaeScore > dohwaScore && hwagaeScore > yeokmaScore) {
          dominantSinsal = "화개살 (華蓋煞)";
          sinsalTip = "예술적 감각과 연구, 학문 집중 기맥이 최고조입니다. 자격증 취득이나 특허/문서 기획서 작성 등 나만의 독창적 산출물을 정리해 두면 평생의 든든한 자산이 됩니다.";
        }

        return wrapLock(
          <div className="space-y-6 py-4">
            <div className="text-center space-y-2 mb-8">
              <span className="text-xs text-[#8A6F4C] font-bold block">신년 3대 신살 (新年 神煞)</span>
              <h2 className="font-myeongjo text-2xl font-bold text-[#1A1A1A]">나의 삶을 변화시킬 핵심 신살 분석</h2>
              <div className="w-16 h-0.5 bg-[#A3845B]/30 mx-auto my-1" />
            </div>
            <div className="bg-white border border-[#E2DDD5] rounded-lg p-6 space-y-5 shadow-sm text-xs leading-relaxed font-light text-gray-700 font-traditional">
              <p className="text-justify font-light text-gray-600">
                명리학적 신살(神煞)은 나의 무의식적 행동 경향과 우주의 자기장 융합을 뜻합니다. 올해 {name}님의 사주 기틀과 병오년이 만나 활성화되는 대표적인 3대 신살의 세부 에너지 지표입니다.
              </p>

              {/* 시각화: 신살 작동도 */}
              <div className="bg-[#FAF7F0] border border-[#E2DDD5] rounded-xl p-4 space-y-3">
                <span className="font-bold text-xs text-[#8A6F4C] block">📊 3대 신살 활성화 게이지</span>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="space-y-1">
                    <span className="text-[10px] font-semibold text-gray-700">도화살 (인기·매력)</span>
                    <div className="text-xs font-bold text-[#A3845B]">{dohwaScore}%</div>
                    <div className="w-full h-1 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-[#A3845B]" style={{ width: \`\${dohwaScore}%\` }} />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] font-semibold text-gray-700">역마살 (이동·변화)</span>
                    <div className="text-xs font-bold text-[#A3845B]">{yeokmaScore}%</div>
                    <div className="w-full h-1 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-[#A3845B]" style={{ width: \`\${yeokmaScore}%\` }} />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] font-semibold text-gray-700">화개살 (예술·학문)</span>
                    <div className="text-xs font-bold text-[#A3845B]">{hwagaeScore}%</div>
                    <div className="w-full h-1 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-[#A3845B]" style={{ width: \`\${hwagaeScore}%\` }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* 신살 상세 정보 */}
              <div className="space-y-3 pt-2">
                <div className="border-b border-[#E2DDD5]/50 pb-2">
                  <span className="font-bold text-[#A3845B] text-[11px]">🎯 최강 활성 신살: {dominantSinsal}</span>
                  <p className="text-[10px] text-gray-600 mt-1 font-light leading-relaxed">
                    {sinsalTip}
                  </p>
                </div>
                <div className="pt-1">
                  <span className="font-bold text-[#8A6F4C] text-[11.5px] block mb-1">🕯️ 3대 신살 개운 가이드:</span>
                  <p className="text-[9.5px] text-gray-500 font-light leading-relaxed">
                    * 도화살 발현을 위해 미팅 시 네이비/골드 컬러 악세서리를 조합하십시오.<br/>
                    * 화개살 보완을 위해 명상 시간이나 1인 자격 취득용 스터디 루틴을 주 3회 세우시면 액막이에 탁월합니다.
                  </p>
                </div>
              </div>
            </div>
          </div>,
          "신년 3대 신살 작동 현황 분석"
        );
      }`;

// -----------------------------------------------------------------------------
// [Page 38] ny_gwiin_harmony
// -----------------------------------------------------------------------------
const codePage38 = `case "ny_gwiin_harmony": {
        const dayStemEl = sajuInfo?.day?.stemEl || "목";

        // 귀인 조견표 매칭 (일간별)
        const gwiinData = {
          "목": { peer: "돼지띠, 토끼띠", boss: "양띠 (오미육합)", direction: "북쪽 (水)", tip: "수생목의 기류를 전하는 돼지띠 동료와 협업 시 계약 마찰이 부드럽게 완화됩니다." },
          "화": { peer: "호랑이띠, 개띠", boss: "양띠 (화기를 제어)", direction: "남서쪽 (土)", tip: "뜨거운 화기를 식혀줄 흙의 성정을 지닌 양띠 상사의 자문이 승진의 지름길입니다." },
          "토": { peer: "뱀띠, 닭띠", boss: "말띠 (화생토 지탱)", direction: "남동쪽 (金)", tip: "의뢰인님의 대지를 견고히 지탱할 뱀띠 귀인에게 문서 검토를 양도하십시오." },
          "금": { peer: "닭띠, 용띠", boss: "뱀띠 (사유축 합)", direction: "서북쪽 (土)", tip: "금의 단단한 뿌리가 될 용띠 조력자의 정보 수혈이 금전 리스크를 막아줍니다." },
          "수": { peer: "원숭이띠, 쥐띠", boss: "돼지띠 (수생목 조율)", direction: "북쪽 (水)", tip: "자금 유통이나 재무 계획 시 돼지띠 또는 원숭이띠 자산가와 긴밀히 소통하십시오." }
        }[dayStemEl] || { peer: "말띠, 개띠", boss: "양띠", direction: "북쪽", tip: "오행의 평온을 유도하고 이성적 조언을 전달할 상생 귀인과 함께 협업하십시오." };

        return wrapLock(
          <div className="space-y-6 py-4">
            <div className="text-center space-y-2 mb-8">
              <span className="text-xs text-[#5F7A68] font-bold block">인연 및 귀인 조화 (貴人 支助)</span>
              <h2 className="font-myeongjo text-2xl font-bold text-[#1A1A1A]">나의 평판과 상생을 이끌 귀인 인연</h2>
              <div className="w-16 h-0.5 bg-[#5F7A68]/30 mx-auto my-1" />
            </div>
            <div className="bg-white border border-[#E2DDD5] rounded-lg p-6 space-y-5 shadow-sm text-xs leading-relaxed font-light text-gray-700 font-traditional">
              <p className="text-justify font-light text-gray-600">
                병오년의 강렬한 화기를 다스리기 위해 나에게 등대가 되어줄 귀인의 성향과 나이대, 그리고 방향에 관한 정밀 분석 조견표입니다.
              </p>

              {/* 귀인 인포그래픽 테이블 */}
              <div className="border border-emerald-100 rounded-xl overflow-hidden shadow-sm">
                <table className="w-full text-[10px] text-left border-collapse">
                  <thead>
                    <tr className="bg-emerald-50 text-emerald-800 font-bold border-b border-emerald-100">
                      <th className="p-2.5">귀인 유형</th>
                      <th className="p-2.5">핵심 띠 & 상성</th>
                      <th className="p-2.5">도움의 성격</th>
                    </tr>
                  </thead>
                  <tbody className="text-gray-600 font-light">
                    <tr className="border-b border-emerald-100/50">
                      <td className="p-2.5 font-semibold text-emerald-950">🤝 동료/협력 귀인</td>
                      <td className="p-2.5">{gwiinData.peer}</td>
                      <td className="p-2.5">업무 분산 및 프로젝트 성과 안착 조력</td>
                    </tr>
                    <tr className="border-b border-emerald-100/50">
                      <td className="p-2.5 font-semibold text-emerald-950">👑 직장 상사 귀인</td>
                      <td className="p-2.5">{gwiinData.boss}</td>
                      <td className="p-2.5">인사 갈등 차단 및 부서 연봉 상승 추천</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-semibold text-emerald-950">🗺️ 방위 및 공간</td>
                      <td className="p-2.5">{gwiinData.direction} 방위</td>
                      <td className="p-2.5">계약서 검토 및 책상 방향 배치 권장</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="bg-emerald-50/30 p-3 rounded-lg border border-emerald-100 text-[10px] text-emerald-900 leading-relaxed font-light">
                💡 <strong>{dayStemEl}일간 맞춤 귀인 유인책:</strong> {gwiinData.tip} 의상 매칭 시 메탈 시계나 정돈된 실버 액세서리를 착용할 때 귀인의 협조 주파수가 극대화됩니다.
              </div>
            </div>
          </div>,
          "신년 인연 및 귀인 조화 분석"
        );
      }`;

// -----------------------------------------------------------------------------
// [Page 39] ny_warning_period
// -----------------------------------------------------------------------------
const codePage39 = `case "ny_warning_period": {
        const dayStemEl = sajuInfo?.day?.stemEl || "목";
        const fireCount = sajuInfo?.elements?.["화"] || 0;
        const waterCount = sajuInfo?.elements?.["수"] || 0;

        // 액난 지수 계산
        const mayRisk = Math.min(99, 70 + fireCount * 6);
        const novemberRisk = Math.min(95, 60 + waterCount * 7);

        // 일간별 액막이 처방
        const wardOffAdvice = {
          "목": "목(木) 일간은 강한 불기운에 수분이 증발하는 형태입니다. 음력 5월에는 물(Water) 기운 보존을 위해 밤 10시 이후 차분한 족욕과 명상을 가지고, 불필요한 과도한 아웃도어 스포츠나 한여름 사우나를 삼가십시오.",
          "화": "화(火) 일간은 불이 불을 만나 조급증이 극에 달합니다. 음력 5월에는 이메일 상으로 홧김에 직장을 때려치우거나 동료와 감정 폭언을 절대 금지하십시오. 3초간 눈감고 물을 마시는 훈련이 살길입니다.",
          "토": "토(土) 일간은 대지가 건조해지기 쉽습니다. 음력 11월 자오충의 대립 상황에서 급작스러운 운전 사고나 기물 파손의 우려가 있으니, 자차를 정비하고 보수적인 퇴근길을 운행하십시오.",
          "금": "금(金) 일간은 용광로 속에서 성정이 닳기 쉽습니다. 음력 5월에는 윗사람과의 의견 충돌이나 서류 결재 대기 시 불만을 직접 표출하지 마시고, 서면으로 꼼꼼히 정리해 보고하십시오.",
          "수": "수(水) 일간은 불과 물의 전투로 에너지가 소모됩니다. 음력 11월에 급작스러운 주식/코인 투자 권유나 금전 거래 제안이 귀에 들리더라도 눈과 귀를 닫고 안정 예금으로 수성하십시오."
        }[dayStemEl] || "병오년의 충돌 월운 기간에는 중요한 인생 결정을 뒤로 유보하고 가벼운 스트레칭과 수분 섭취를 유지하십시오.";

        return wrapLock(
          <div className="space-y-6 py-4">
            <div className="text-center space-y-2 mb-8">
              <span className="text-xs text-[#8B221E] font-bold block">치명적 액난 경보 (厄難 警報)</span>
              <h2 className="font-myeongjo text-2xl font-bold text-[#1A1A1A]">올해 가장 주의해야 할 3대 경고 기간</h2>
              <div className="w-16 h-0.5 bg-[#A3845B]/30 mx-auto my-1" />
            </div>
            <div className="bg-white border border-[#E2DDD5] rounded-lg p-6 space-y-5 shadow-sm text-xs leading-relaxed font-light text-gray-700 font-traditional">
              <p className="text-justify font-light text-gray-600">
                세운의 화기가 극대화되거나 충돌하여 안전사고, 금전 사기, 부부 마찰이 강하게 예측되는 시기를 짚어드립니다. 이 시기에는 사소한 일도 보수적으로 처리하고 소나기는 무조건 피해 가는 지혜를 발휘해야 합니다.
              </p>

              {/* 시각화: 액난 위험도 */}
              <div className="bg-red-50/20 border border-red-100 rounded-xl p-4 space-y-3">
                <span className="font-bold text-xs text-red-950 block">📊 월별 액난 및 충돌 위험 지표</span>
                <div className="space-y-2 text-[9px] font-semibold text-red-700">
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span>🔥 음력 5월 (갑오월: 오오자형 극대화)</span>
                      <span>{mayRisk}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-red-100 rounded-full overflow-hidden">
                      <div className="h-full bg-red-500" style={{ width: \`\${mayRisk}%\` }} />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span>🌊 음력 11월 (경자월: 자오충 대립)</span>
                      <span>{novemberRisk}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-red-100 rounded-full overflow-hidden">
                      <div className="h-full bg-red-400" style={{ width: \`\${novemberRisk}%\` }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* 액난 방어 카드 */}
              <div className="border border-red-100 rounded-xl p-4 bg-red-50/10 text-justify space-y-2">
                <span className="font-bold text-xs text-red-950 block">🛡️ 액막이 및 안전 방어 비책 ({dayStemEl}일간 맞춤)</span>
                <p className="text-[10px] text-red-900 leading-relaxed font-light">
                  {wardOffAdvice}
                </p>
                <ul className="space-y-1 text-[9px] text-red-700 font-light border-t border-red-200/50 pt-2 mt-2">
                  <li>• 음력 5월에는 무조건 투자를 유예하고 사직서 제출 등 충동적 결정을 보류하십시오.</li>
                  <li>• 음력 11월에는 장거리 야간 운전을 자제하고, 계약 서명 시 세무 검토를 두 번 하십시오.</li>
                </ul>
              </div>
            </div>
          </div>,
          "치명적인 액난 경보 및 방어 비책"
        );
      }`;

// -----------------------------------------------------------------------------
// [Page 40] ny_worry_solution
// -----------------------------------------------------------------------------
const codePage40 = `case "ny_worry_solution": {
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

        // 고민 카테고리별 3단계 해결 비방
        const categoryLabel = {
          "wealth": "금전 / 투자 / 부동산 고민",
          "career": "이직 / 승진 / 직장 대인관계 고민",
          "love": "부부 / 연애 / 가정사 갈등 고민",
          "health": "체력 저하 / 장부 건강 고민"
        }[worryCategory] || "신년 현실적인 안건 고민";

        const stepAdvices = {
          "wealth": [
            "⏳ 1단계 (수성): 상반기(음력 4~6월)의 화기 과잉기에는 홧김에 하는 계약이나 변동을 일체 금하고 대출 비중을 최소화하십시오.",
            "📑 2단계 (법적 조율): 음력 8월의 선선한 금 기운을 기점으로 세무 감사 및 계약서 전문 서류의 법적 검토를 조용히 단행하십시오.",
            "🏆 3단계 (성과 안착): 연말 음력 10월 이후, 상사 귀인의 조력을 득해 최종 계약서에 서명함으로써 금전 고민을 원만히 회수하십시오."
          ],
          "career": [
            "⏳ 1단계 (평정): 직장 내 상사/동료와의 사소한 마찰은 상반기 화기의 팽창 현상입니다. 10분 늦게 대답하며 직무 인프라를 보강해 두십시오.",
            "📑 2단계 (골든타임): 이직이나 부서 이동은 가을철 금(金) 기운이 세운의 열기를 식혀주는 음력 7~9월 사이에 실행하는 것이 연봉 협상에 길합니다.",
            "🏆 3단계 (성과 안착): 연말 10월 이후 새로운 조직에 빠르게 적응하고 실질적인 권력/결재권 획득을 쟁취할 수 있는 보상이 다가옵니다."
          ],
          "love": [
            "⏳ 1단계 (경청): 사소한 감정 대립은 병오년의 불꽃 탓입니다. 상대방이 성을 낼 때 3초간 눈을 감고 미소로 대답하는 포용력을 유지하십시오.",
            "📑 2단계 (조화): 부부/연인과 함께 고풍스러운 찻집을 가거나 차가운 블루 톤의 보색 소품을 침실에 배치하여 감정의 화재를 진정시키십시오.",
            "🏆 3단계 (안정): 음력 10월 이후 기해월의 풍부한 수기가 감정을 평온하게 만들어 관계가 물 흐르듯 순탄하게 합을 이루게 됩니다."
          ],
          "health": [
            "⏳ 1단계 (음용): 상열감으로 인한 심혈관 피로 및 비뇨기 결핍이 예상됩니다. 아침 공복 시 시원한 냉수를 마셔 체내 불길을 즉각 내리십시오.",
            "📑 2단계 (운동): 무리한 등산이나 고열 러닝보다 15분간의 소금물 족욕을 통해 머리의 열을 발끝으로 내리는 수승화강을 실천하십시오.",
            "🏆 3단계 (조율): 기력이 갈무리되는 음력 10월 이후 체력이 정상 궤도에 오르니, 겨울철 맞춤 한수/한풍 섭생 식단을 결합하여 건강을 회수하십시오."
          ]
        }[worryCategory] || [
          "⏳ 1단계 (수성): 상반기(음력 4~6월)의 화기 과잉기에는 홧김에 하는 변동을 일체 금하고 내실을 다지십시오.",
          "📑 2단계 (서류 조율): 음력 8월의 선선한 금 기운을 기점으로 자금 설계 및 문서 검토를 단행하십시오.",
          "🏆 3단계 (안착): 연말 음력 10월 이후 귀인의 조력을 득해 최종 고민 안건을 조화롭게 해결해내십시오."
        ];

        return wrapLock(
          <div className="space-y-6 py-4">
            <div className="text-center space-y-2 mb-8">
              <span className="text-xs text-[#8A6F4C] font-bold block">고민 해결 솔루션 (苦悶 解決)</span>
              <h2 className="font-myeongjo text-2xl font-bold text-[#1A1A1A]">의뢰인의 현실적인 고민에 대한 정밀 비책</h2>
              <div className="w-16 h-0.5 bg-[#A3845B]/30 mx-auto my-1" />
            </div>
            <div className="bg-white border border-[#E2DDD5] rounded-lg p-6 space-y-5 shadow-sm text-xs leading-relaxed font-light text-gray-700 font-traditional">
              <p className="text-justify font-light text-gray-600">
                의뢰인 {name}님이 제출하신 현실적인 고민 안건(<strong>분야: {categoryLabel}</strong>)에 대하여 명리 연구소의 정밀 운기 분석을 바탕으로 도출한 대안 및 행동 실천 로드맵입니다. 마음의 조급함과 불필요한 생각의 감옥(과다 인성)을 해제하고 선선한 가을철 금(金) 기운을 기점으로 자금과 계약서를 철저히 설계 및 조율해 나간다면, 리스크를 완벽하게 차단하고 원하는 결실의 대부분을 쟁취할 수 있습니다.
              </p>

              {/* 시각화: 고민 해결 성공률 및 조율 지표 */}
              <div className="bg-[#FAF7F0] border border-[#E2DDD5] rounded-xl p-4 space-y-3">
                <span className="font-bold text-xs text-[#8A6F4C] block">📊 고민 해결 및 대처 능력 지수</span>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <div className="flex justify-between text-[9px] font-semibold text-[#8A6F4C]">
                      <span>안건 성취 및 해결 성공률</span>
                      <span className="text-[#8A6F4C]">{solveSuccessRate}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-[#A3845B] rounded-full" style={{ width: \`\${solveSuccessRate}%\` }} />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-[9px] font-semibold text-[#8A6F4C]">
                      <span>외부 협상 및 계약 유리도</span>
                      <span className="text-[#8A6F4C]">{negotiationLeeway}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-[#A3845B] rounded-full" style={{ width: \`\${negotiationLeeway}%\` }} />
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 pt-1">
                  <div className="space-y-1">
                    <div className="flex justify-between text-[9px] font-semibold text-[#8A6F4C]">
                      <span>감정 컨트롤 & 마음 안정도</span>
                      <span className="text-[#8A6F4C]">{emotionControl}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-[#A3845B] rounded-full" style={{ width: \`\${emotionControl}%\` }} />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-[9px] font-semibold text-[#8A6F4C]">
                      <span>귀인 및 동료 조력 효율</span>
                      <span className="text-[#8A6F4C]">{connectionEfficiency}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-[#A3845B] rounded-full" style={{ width: \`\${connectionEfficiency}%\` }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* 고민 해결 3단계 카드 (3열) */}
              <span className="font-bold text-xs text-[#8A6F4C] block pt-2">🧭 고민 해결을 위한 3단계 개운 로드맵</span>
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-[#FAF7F0] border border-[#E2DDD5]/60 p-3 rounded-xl text-justify shadow-inner">
                  <span className="font-bold text-[#8A6F4C] text-[10px] block">{stepAdvices[0].slice(0, 11)}</span>
                  <p className="text-[8px] text-gray-400 font-light mt-1 leading-snug">
                    {stepAdvices[0].slice(13)}
                  </p>
                </div>
                <div className="bg-[#FAF7F0] border border-[#E2DDD5]/60 p-3 rounded-xl text-justify shadow-inner">
                  <span className="font-bold text-[#8A6F4C] text-[10px] block">{stepAdvices[1].slice(0, 14)}</span>
                  <p className="text-[8px] text-gray-400 font-light mt-1 leading-snug">
                    {stepAdvices[1].slice(16)}
                  </p>
                </div>
                <div className="bg-[#FAF7F0] border border-[#E2DDD5]/60 p-3 rounded-xl text-justify shadow-inner">
                  <span className="font-bold text-[#8A6F4C] text-[10px] block">{stepAdvices[2].slice(0, 14)}</span>
                  <p className="text-[8px] text-gray-400 font-light mt-1 leading-snug">
                    {stepAdvices[2].slice(16)}
                  </p>
                </div>
              </div>
            </div>
          </div>,
          "고민 해결 맞춤형 솔루션"
        );
      }`;

// 실행
replaceSingleCase("ny_gossip_defense", "ny_sinsal_active", codePage36);
replaceSingleCase("ny_sinsal_active", "ny_gwiin_harmony", codePage37);
replaceSingleCase("ny_gwiin_harmony", "ny_warning_period", codePage38);
replaceSingleCase("ny_warning_period", "ny_worry_solution", codePage39);
replaceSingleCase("ny_worry_solution", "ny_personal_worry", codePage40);

fs.writeFileSync(filePath, content, 'utf8');
console.log("=== All Pages 36-40 successfully enriched and saved! ===");
