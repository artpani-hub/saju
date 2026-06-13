const fs = require('fs');
const path = require('path');

const filePath = path.join('d:', '인터그리비티', 'saju', 'src', 'app', 'result', 'page.js');
let content = fs.readFileSync(filePath, 'utf8');

console.log("=== Enriching Pages 46 to 52 in page.js ===");

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
// [Page 46 - 49] ny_roadmap_2031, ny_action_rules, ny_fengshui_interior, ny_lucky_items
// -----------------------------------------------------------------------------
const codePage46To49 = `case "ny_roadmap_2031": {
        const dayStemEl = sajuInfo?.day?.stemEl || "목";
        const woodCount = sajuInfo?.elements?.["목"] || 0;
        const fireCount = sajuInfo?.elements?.["화"] || 0;
        const earthCount = sajuInfo?.elements?.["토"] || 0;
        const metalCount = sajuInfo?.elements?.["금"] || 0;
        const waterCount = sajuInfo?.elements?.["수"] || 0;

        // 지표 계산
        const comfortScore = Math.min(99, 70 + (waterCount + woodCount) * 4);
        const homeStability = Math.min(95, 65 + (earthCount + waterCount) * 4);
        const creativeScore = Math.min(95, 60 + (woodCount + fireCount) * 5);
        const incomeStability = Math.min(95, 65 + (metalCount + earthCount) * 4);

        const advice2031 = {
          "목": "목(木) 일간에게 신해년은 정관과 편인이 함께 유입되는 운기입니다. 새로운 도전보다는 장기적인 연구 및 내실 다지기에 힘쓰는 것이 가장 길합니다.",
          "화": "화(火) 일간에게 신해년은 편관과 정인의 흐름입니다. 책임감이 커지는 동시에 윗사람의 전폭적인 지지를 받아 명예가 높아지는 한 해입니다.",
          "토": "토(土) 일간에게 신해년은 상관과 편재가 어우러집니다. 창의적인 아이디어를 바탕으로 예상치 못한 재물 성과를 낼 수 있으나, 건강 관리에 유념하십시오.",
          "금": "금(金) 일간에게 신해년은 식신과 비견이 만나는 상서로운 해입니다. 동료들과의 돈독한 연대로 새로운 사업 터전을 확보하기에 매우 든든합니다.",
          "수": "수(水) 일간에게 신해년은 겁재와 편인의 복잡한 기류가 작용합니다. 자산의 외부 누수를 적극 차단하고, 건강 검진을 필수적으로 챙기십시오."
        }[dayStemEl] || "내적인 쉼표와 복록 안착을 모토로 삼고, 그동안 벌려놓았던 자산을 갈무리하는 안정화 전략을 취하십시오.";

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
                      <span className="text-[#8A6F4C]">{comfortScore}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-[#A3845B] rounded-full" style={{ width: \`\${comfortScore}%\` }} />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-[9px] font-semibold text-[#8A6F4C]">
                      <span>가정 안온도 및 복록 안착</span>
                      <span className="text-[#8A6F4C]">{homeStability}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-[#A3845B] rounded-full" style={{ width: \`\${homeStability}%\` }} />
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 pt-1">
                  <div className="space-y-1">
                    <div className="flex justify-between text-[9px] font-semibold text-[#8A6F4C]">
                      <span>창의 및 직관적 안건 도출</span>
                      <span className="text-[#8A6F4C]">{creativeScore}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-[#A3845B] rounded-full" style={{ width: \`\${creativeScore}%\` }} />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-[9px] font-semibold text-[#8A6F4C]">
                      <span>고정 배당/인컴 자산 안정도</span>
                      <span className="text-[#8A6F4C]">{incomeStability}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-[#A3845B] rounded-full" style={{ width: \`\${incomeStability}%\` }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* 미래 로드맵 처방 카드 */}
              <div className="border border-[#E2DDD5] rounded-xl p-4 bg-[#FAF7F0]/40 text-justify space-y-3">
                <span className="font-bold text-xs text-[#8A6F4C] block">🧭 {dayStemEl}일간 신해년 대처 강령</span>
                <p className="text-[10px] text-gray-500 leading-relaxed font-light">
                  {advice2031}
                </p>
                <p className="text-[9px] text-[#A3845B] leading-normal border-t border-[#E2DDD5]/40 pt-2 font-light">
                  * <strong>신해년 실천 3대 카드:</strong> 내면의 정수(명상), 고정수익 편재(안정자산), 격조 있는 취미(서예/예술)를 실천하여 심신을 안정시키십시오.
                </p>
              </div>
            </div>
          </div>,
          "2031년 신해년 세운 로드맵"
        );
      }

      case "ny_action_rules": {
        const dayStemEl = sajuInfo?.day?.stemEl || "목";
        const woodCount = sajuInfo?.elements?.["목"] || 0;
        const fireCount = sajuInfo?.elements?.["화"] || 0;
        const earthCount = sajuInfo?.elements?.["토"] || 0;
        const metalCount = sajuInfo?.elements?.["금"] || 0;
        const waterCount = sajuInfo?.elements?.["수"] || 0;

        const presets = {
          "목": { color: "청록 / 초록 (Green)", number: "3, 8", direction: "동쪽 (East)", items: "나무 소재 키링, 아로마 수목 향수", colorHex: "#22c55e", bg: "bg-emerald-50", border: "border-emerald-200", text: "text-emerald-900",
            actions: [
              { title: "🌳 목(木) 기운 충전", desc: "아침 공원 산책을 통해 솟구치는 생기를 얻고, 주체적인 정신 상태를 유지하십시오." },
              { title: "🪵 천연 원목 소품", desc: "책상 위나 침대 근처에 자연 소재의 나무 소품이나 식물을 배치해 기류를 보완하십시오." },
              { title: "👗 초록/청색 의상", desc: "중요한 협상이나 만남이 있는 날에는 푸른색 또는 초록색 상의를 입어 인덕을 당기십시오." }
            ]
          },
          "화": { color: "적색 / 주황 (Red)", number: "2, 7", direction: "남쪽 (South)", items: "가죽 카드 홀더, 우디 캔들", colorHex: "#ef4444", bg: "bg-red-50", border: "border-red-200", text: "text-red-900",
            actions: [
              { title: "🌅 일출 명상", desc: "태양이 떠오르는 시간대에 가벼운 스트레칭이나 명상을 진행해 활발한 아침 성정을 충전하십시오." },
              { title: "🕯️ 붉은 계열 조명", desc: "거실이나 집무실 남쪽 공간에 붉은색 조명이나 아로마 캔들을 두어 활력과 열정을 자극하십시오." },
              { title: "🤝 능동적 소통", desc: "대인관계에서 침묵하기보다 밝고 명랑한 태도로 먼저 손을 내밀어 네트워크를 주도하십시오." }
            ]
          },
          "토": { color: "황색 / 베이지 (Yellow)", number: "5, 10", direction: "중앙 (Center)", items: "도자기 머그컵, 오렌지 립밤", colorHex: "#f59e0b", bg: "bg-amber-50", border: "border-amber-200", text: "text-amber-900",
            actions: [
              { title: "🚶 규칙적인 산책", desc: "식사 후 가벼운 흙길 산책을 습관화하여 비위장 소화 기능을 돕고 토 기운을 강화하십시오." },
              { title: "🏺 도자기 소품", desc: "거실 중앙이나 테이블 위에 흙으로 구워진 황토색 도자기 소품을 배치해 신용 기운을 모으십시오." },
              { title: "📝 기록의 정돈", desc: "하루의 업무나 일기를 노트에 손글씨로 기록하여 흐트러진 생각을 확실한 계약으로 매듭지으십시오." }
            ]
          },
          "금": { color: "백색 / 실버 (White)", number: "4, 9", direction: "서쪽 (West)", items: "메탈 스냅 시계, 실버 액세서리", colorHex: "#94a3b8", bg: "bg-slate-50", border: "border-slate-200", text: "text-slate-900",
            actions: [
              { title: "⏰ 계획의 단행", desc: "시간대별 세부 목표를 정밀하게 수립하고, 우유부단함을 버린 단호한 결단을 즉각 실행하십시오." },
              { title: "⚙️ 메탈 프레임 가구", desc: "서재나 책상 위 서쪽 공간에 스틸 프레임이나 금속제 수집품을 두어 결단력을 촉진하십시오." },
              { title: "✂️ 인맥 다이어트", desc: "불필요하게 감정을 갉아먹는 관계나 관행을 깔끔하게 정리하여 내면의 내실을 지키십시오." }
            ]
          },
          "수": { color: "흑색 / 네이비 (Black)", number: "1, 6", direction: "북쪽 (North)", items: "어두운 네이비 의상, 미네랄 워터 미스트", colorHex: "#3b82f6", bg: "bg-blue-50", border: "border-blue-200", text: "text-blue-900",
            actions: [
              { title: "🛀 저녁 족욕 수련", desc: "취침 전 따뜻한 족욕과 명상으로 머리의 화기를 내리고 하체의 차분한 수기를 채우십시오." },
              { title: "🌌 네이비 장식 소품", desc: "거주 공간 북쪽 벽면에 어두운 네이비색 프레임 액자나 장식을 배치해 지혜를 당기십시오." },
              { title: "📚 성찰과 독서", desc: "급하게 결정을 몰아치지 말고 차분한 정독과 사색을 통해 지혜로운 최상의 방안을 모색하십시오." }
            ]
          }
        }[dayStemEl] || { color: "황색", number: "5, 10", direction: "중앙", items: "소품", colorHex: "#f59e0b", bg: "bg-amber-50", border: "border-amber-200", text: "text-amber-900", actions: [] };

        // 개운 실천 예상 보정 지수
        const correctionWealth = Math.min(98, 70 + (waterCount + earthCount) * 3);
        const correctionSocial = Math.min(98, 75 + (woodCount + waterCount) * 3);
        const correctionHealth = Math.min(95, 65 + (woodCount + metalCount) * 4);
        const correctionCareer = Math.min(98, 70 + (metalCount + fireCount) * 3);

        return wrapLock(
          <div className="space-y-6 py-4">
            <div className="text-center space-y-2 mb-8">
              <span className="text-xs text-[#A3845B] font-bold block tracking-widest">開運 行動 攻略 (개운 행동 공략)</span>
              <h2 className="font-myeongjo text-2xl font-bold text-[#1A1A1A]">신년 개운 실천 3대 행동 강령</h2>
              <div className="w-16 h-0.5 bg-[#A3845B]/30 mx-auto my-1" />
              <p className="text-[10px] text-gray-500 font-light">사주의 기운 불균형을 일상의 행동 풍수로 보완하는 명리 개운법</p>
            </div>

            {/* 오행 처방 요약 카드 */}
            <div className={\`\${presets.bg} border \${presets.border} rounded-2xl p-5 shadow-sm\`}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full flex items-center justify-center shadow-sm" style={{ backgroundColor: presets.colorHex }}>
                  <span className="text-white font-bold text-sm">{dayStemEl}</span>
                </div>
                <div>
                  <span className={\`font-bold text-sm \${presets.text}\`}>{name}님의 일간 기운: <strong>{dayStemEl}(</strong>{dayStemEl === "목" ? "木" : dayStemEl === "화" ? "火" : dayStemEl === "토" ? "土" : dayStemEl === "금" ? "金" : "水"}<strong>) 기질 보완 처방</strong></span>
                  <p className="text-[9px] text-gray-500 font-light mt-0.5">일상 속에서 부족한 기운을 인위적으로 보완하는 법</p>
                </div>
              </div>

              {/* 행운 처방 4종 그리드 */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white/80 rounded-xl p-3 border border-white/60 shadow-sm">
                  <span className="text-[8px] text-gray-400 font-semibold block mb-1">🎨 수호 색상</span>
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full border border-gray-200 shadow-sm" style={{ backgroundColor: presets.colorHex }} />
                    <span className="font-bold text-[10px] text-gray-800">{presets.color}</span>
                  </div>
                </div>
                <div className="bg-white/80 rounded-xl p-3 border border-white/60 shadow-sm">
                  <span className="text-[8px] text-gray-400 font-semibold block mb-1">🔢 행운의 숫자</span>
                  <span className="font-bold text-[10px] text-gray-800">{presets.number}</span>
                </div>
                <div className="bg-white/80 rounded-xl p-3 border border-white/60 shadow-sm">
                  <span className="text-[8px] text-gray-400 font-semibold block mb-1">🧭 개운 방향</span>
                  <span className="font-bold text-[10px] text-gray-800">{presets.direction}</span>
                </div>
                <div className="bg-white/80 rounded-xl p-3 border border-white/60 shadow-sm">
                  <span className="text-[8px] text-gray-400 font-semibold block mb-1">🎁 수호 아이템</span>
                  <span className="font-bold text-[10px] text-gray-800">{presets.items}</span>
                </div>
              </div>
            </div>

            {/* 개운 실천 지수 시각화 */}
            <div className="bg-white border border-[#E2DDD5] rounded-2xl p-5 shadow-sm space-y-4">
              <h4 className="font-myeongjo text-xs font-bold text-[#A3845B] flex items-center gap-1.5">
                📊 개운 실천 시 예상 운세 보정 지수
              </h4>
              <div className="space-y-3">
                {[
                  { label: "재물 개운 가능성", value: correctionWealth, color: "bg-amber-500" },
                  { label: "대인관계 호전도", value: correctionSocial, color: "bg-emerald-500" },
                  { label: "건강 기운 보강도", value: correctionHealth, color: "bg-blue-500" },
                  { label: "직업/사업 활성도", value: correctionCareer, color: "bg-purple-500" }
                ].map((item, i) => (
                  <div key={i} className="space-y-1">
                    <div className="flex justify-between text-[9px] font-semibold text-gray-700">
                      <span>{item.label}</span>
                      <span className="text-[#A3845B]">{item.value}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className={\`h-full \${item.color} rounded-full transition-all\`} style={{ width: \`\${item.value}%\` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 3대 실천 행동 지침 카드 */}
            <div className="bg-white border border-[#E2DDD5] rounded-2xl p-5 shadow-sm space-y-3">
              <h4 className="font-myeongjo text-xs font-bold text-[#A3845B] flex items-center gap-1.5">
                ✅ 병오년 개운 실천 3대 행동 강령
              </h4>
              <div className="grid grid-cols-3 gap-3">
                {presets.actions.map((act, i) => (
                  <div key={i} className="bg-[#FAF7F0] border border-[#E2DDD5]/60 p-3 rounded-xl text-justify shadow-inner">
                    <span className="font-bold text-[#8A6F4C] text-[10px] block">✨ {act.title}</span>
                    <p className="text-[8.5px] text-gray-500 font-light mt-1 leading-snug">
                      {act.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>,
          "신년 개운 실천 3대 행동 강령"
        );
      }

      case "ny_fengshui_interior": {
        const woodCount = sajuInfo?.elements?.["목"] || 0;
        const fireCount = sajuInfo?.elements?.["화"] || 0;
        const earthCount = sajuInfo?.elements?.["토"] || 0;
        const metalCount = sajuInfo?.elements?.["금"] || 0;
        const waterCount = sajuInfo?.elements?.["수"] || 0;

        const fengshuiData = [
          { dir: "북", symbol: "N", el: "수(水)", elColor: "#3b82f6", lucky: "재물·지혜", items: "수경식물, 어항, 파란 소품", placement: "현관 입구 또는 거실 북쪽 벽면", effect: "재물 기운 흡수 및 두뇌 활성화" },
          { dir: "서", symbol: "W", el: "금(金)", elColor: "#94a3b8", lucky: "명예·결단", items: "메탈 시계, 크리스탈 소품, 실버 액자", placement: "서쪽 서재 또는 책상 위", effect: "판단력 강화 및 명예운 수호" },
          { dir: "동", symbol: "E", el: "목(木)", elColor: "#22c55e", lucky: "성장·건강", items: "관엽식물, 나무 소품, 초록 화분", placement: "침실 동쪽 창가", effect: "건강 기운 충전 및 활력 회복" },
          { dir: "남", symbol: "S", el: "화(火)", elColor: "#ef4444", lucky: "인기·명성", items: "촛불, 조명, 붉은 계열 그림", placement: "주방 또는 거실 남쪽 (소량 배치)", effect: "사회적 인기와 표현력 강화" }
        ];

        const roomPrescriptions = [
          { room: "침실", icon: "🛏️", prescription: "침대 머리를 북쪽 또는 서쪽으로 두어 수기(水氣)를 흡수하고 깊은 숙면을 도모하십시오. 남쪽으로 머리를 두면 열기가 머리로 올라 불면이 생깁니다.", caution: "빨간색 침구류 사용 금지" },
          { room: "거실·집무실", icon: "🏠", prescription: "메탈 스틸 소품, 크리스탈 유리 공예품을 공간 중앙에 배치하여 2026년 병오년의 뜨거운 화기(火氣)를 냉각하십시오.", caution: "지나치게 붉거나 오렌지빛 인테리어 억제" },
          { room: "현관", icon: "🚪", prescription: "현관 문 안쪽 북쪽 방향에 수경 식물이나 작은 어항을 두어 들어오는 재물 기운을 머물게 하는 풍수 비법을 실천하십시오.", caution: "현관에 시든 꽃이나 죽은 식물 방치 금지" },
          { room: "주방", icon: "🍳", prescription: "주방은 이미 화기(火氣)가 강한 공간이니 파란색 계열 소품이나 미니 어항을 두어 화기를 수기로 중화하십시오.", caution: "주방 창문을 자주 열어 환기 필수" }
        ];

        // 풍수 실천 전/후 운세 보정 지수
        const fengshuiScores = [
          { label: "재물 기운 안정도", before: 50 + woodCount * 3, after: 80 + woodCount * 3, color: "bg-amber-500" },
          { label: "건강 기운 보강도", before: 55 + waterCount * 3, after: 78 + waterCount * 3, color: "bg-emerald-500" },
          { label: "대인관계 조화도", before: 60 + fireCount * 3, after: 83 + fireCount * 3, color: "bg-blue-500" },
          { label: "심리적 안정도", before: 52 + earthCount * 3, after: 81 + earthCount * 3, color: "bg-purple-500" }
        ];

        return wrapLock(
          <div className="space-y-6 py-4">
            {/* 헤더 */}
            <div className="text-center space-y-2 mb-6">
              <span className="text-xs text-[#A3845B] font-bold block tracking-widest">空間 風水 地理 處方 (공간 풍수 지리 처방)</span>
              <h2 className="font-myeongjo text-2xl font-bold text-[#1A1A1A]">신년 공간 풍수 인테리어 처방</h2>
              <div className="w-16 h-0.5 bg-[#A3845B]/30 mx-auto my-1" />
              <p className="text-[10px] text-gray-500 font-light">대지와 공간의 흐름을 바로잡아 재물·건강·명예운을 동시에 끌어올리는 풍수 비법</p>
            </div>

            {/* 서론 */}
            <div className="bg-[#FAF8F5] border border-[#E2DDD5]/70 rounded-2xl p-4 text-xs text-gray-700 font-light leading-relaxed">
              동양 풍수지리학의 핵심은 <strong>공간의 기(氣) 흐름</strong>을 조율하여 거주자의 기운과 조화를 이루게 하는 데 있습니다. 2026년 병오년(丙午年)은 강렬한 화기(火氣)가 지배하는 해이므로, 집안의 각 공간에 <strong>수(水)·금(金) 기운을 보강</strong>하여 과열된 기류를 중화하고 안정적인 재물·건강·명예운을 확보해야 합니다.
            </div>

            {/* 방위별 오행 풍수 배치 가이드 */}
            <div className="bg-white border border-[#E2DDD5] rounded-2xl p-5 shadow-sm space-y-4">
              <h4 className="font-myeongjo text-xs font-bold text-[#A3845B]">🧭 방위별 오행 풍수 배치 가이드</h4>
              <div className="grid grid-cols-2 gap-3">
                {fengshuiData.map((item, i) => (
                  <div key={i} className="border border-[#E2DDD5]/60 rounded-xl p-3 space-y-2 bg-[#FAF8F5]/60">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full flex items-center justify-center font-bold text-white text-[10px] shadow-sm" style={{ backgroundColor: item.elColor }}>
                        {item.symbol}
                      </div>
                      <div>
                        <span className="font-bold text-[10px] text-gray-800">{item.dir}쪽 ({item.el})</span>
                        <p className="text-[8px] text-gray-400">{item.lucky} 기운 담당</p>
                      </div>
                    </div>
                    <div className="text-[9px] text-gray-600 font-light space-y-1">
                      <p><strong className="text-[#A3845B]">소품:</strong> {item.items}</p>
                      <p><strong className="text-[#A3845B]">배치:</strong> {item.placement}</p>
                      <p className="text-[8.5px] text-emerald-700 font-semibold bg-emerald-50 px-1.5 py-0.5 rounded">✓ {item.effect}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 공간별 풍수 처방 */}
            <div className="bg-white border border-[#E2DDD5] rounded-2xl p-5 shadow-sm space-y-3">
              <h4 className="font-myeongjo text-xs font-bold text-[#A3845B]">🏠 공간별 맞춤 풍수 처방</h4>
              <div className="space-y-2.5">
                {roomPrescriptions.map((room, i) => (
                  <div key={i} className="border border-[#E2DDD5]/50 rounded-xl p-3 bg-[#FAF8F5]/60">
                    <div className="flex items-center gap-2">
                      <span className="text-sm">{room.icon}</span>
                      <span className="font-bold text-[10px] text-[#1A1A1A]">{room.room}</span>
                    </div>
                    <p className="text-[9px] text-gray-600 font-light leading-relaxed mt-1 text-justify">{room.prescription}</p>
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className="text-[8px] bg-rose-100 text-rose-700 px-2 py-0.5 rounded-full font-semibold">⚠️ 주의: {room.caution}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 풍수 실천 전후 효과 시각화 */}
            <div className="bg-white border border-[#E2DDD5] rounded-2xl p-5 shadow-sm space-y-4">
              <h4 className="font-myeongjo text-xs font-bold text-[#A3845B]">📊 풍수 인테리어 실천 전·후 운세 보정 효과</h4>
              <div className="space-y-3">
                {fengshuiScores.map((item, i) => (
                  <div key={i} className="space-y-1">
                    <div className="flex justify-between text-[9px] font-semibold text-gray-700">
                      <span>{item.label}</span>
                      <span className="text-gray-400 text-[8px]">{item.before}% → <span className="text-[#A3845B] font-bold">{item.after}%</span></span>
                    </div>
                    <div className="relative w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="absolute h-full bg-gray-300 rounded-full" style={{ width: \`\${item.before}%\` }} />
                      <div className={\`absolute h-full \${item.color} rounded-full opacity-80\`} style={{ width: \`\${item.after}%\` }} />
                    </div>
                    <div className="flex gap-2 text-[7px] text-gray-400">
                      <span className="flex items-center gap-0.5"><span className="w-1.5 h-1 bg-gray-300 rounded-sm inline-block" /> 실천 전</span>
                      <span className="flex items-center gap-0.5"><span className={\`w-1.5 h-1 \${item.color} rounded-sm inline-block opacity-80\`} /> 실천 후</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>,
          "신년 공간 풍수 인테리어 처방"
        );
      }

      case "ny_lucky_items": {
        const dayStemEl = sajuInfo?.day?.stemEl || "목";
        const woodCount = sajuInfo?.elements?.["목"] || 0;
        const fireCount = sajuInfo?.elements?.["화"] || 0;
        const earthCount = sajuInfo?.elements?.["토"] || 0;
        const metalCount = sajuInfo?.elements?.["금"] || 0;
        const waterCount = sajuInfo?.elements?.["수"] || 0;

        let luckyColors = [];
        let itemsTable = [];
        let item1Title = "";
        let item1Desc = "";
        let item2Title = "";
        let item2Desc = "";

        if (dayStemEl === "목" || dayStemEl === "木") {
          luckyColors = [
            { name: "포레스트 그린", code: "#2F5233", energy: "목(木) 생기", desc: "주체성 회복" },
            { name: "에메랄드", code: "#00A86B", energy: "목(木) 성장", desc: "진로 확장" },
            { name: "크림 화이트", code: "#FFFDF9", energy: "금(金) 의지", desc: "결단력 보완" },
            { name: "라이트 옐로우", code: "#FFF8D6", energy: "토(土) 신뢰", desc: "재물운 안착" }
          ];
          item1Title = "🪵 원목 또는 식물 소품";
          item1Desc = "작은 테이블용 반려식물 화분이나 원목으로 가공된 소품은 목의 솟구치는 생명력을 극대화하여 활력을 공급합니다.";
          item2Title = "✍️ 만년필 및 가죽 다이어리";
          item2Desc = "목의 계획성을 기록으로 보완하고 실행에 확실한 뼈대를 세우기 위해 가죽이나 천연 소재 소품이 길합니다.";
          itemsTable = [
            { type: "👔 의상 코디", style: "내추럴 톤온톤 룩", item: "카키/베이지 리넨 셔츠", effect: "대인관계에 부드러운 신뢰와 편안함을 공급" },
            { type: "💄 메이크업", style: "내추럴 누드 톤 스킨", item: "차분한 브라운/피치 립밤", effect: "과도한 긴장을 가라앉히고 안정감을 연출" },
            { type: "💍 액세서리", style: "원목 가죽 믹스 주얼리", item: "천연 가죽 밴드 손목 시계", effect: "목의 고집을 조율하고 융통성 있는 교류 촉진" },
            { type: "💨 럭키 향수", style: "싱그러운 풀잎 향조", item: "그린 티, 편백나무 향", effect: "머리를 맑게 하고 집중력과 스트레스 저하 유도" }
          ];
        } else if (dayStemEl === "화" || dayStemEl === "火") {
          luckyColors = [
            { name: "제트 블랙", code: "#0D0D0D", energy: "수(水) 수호", desc: "감정 진정" },
            { name: "딥 블루", code: "#0F2027", energy: "수(水) 지혜", desc: "구설수 차단" },
            { name: "에메랄드 그린", code: "#1B4D3E", energy: "목(木) 상생", desc: "인덕 공급" },
            { name: "딥 퍼플", code: "#3F2B96", energy: "화(火) 조율", desc: "영감 충전" }
          ];
          item1Title = "🌊 수족관 및 미니 분수기";
          item1Desc = "작은 흐르는 물소리나 실내 가습기는 타오르는 불꽃의 열기를 이성적으로 식히고 구설수를 차단하는 효과를 줍니다.";
          item2Title = "🔮 흑요석 또는 오닉스 장식";
          item2Desc = "블랙 계열의 천연 원석은 넘쳐나는 화기를 흡수하고 안정적인 심리 방어막을 구축하여 차분함을 보완합니다.";
          itemsTable = [
            { type: "👔 의상 코디", style: "시크 미니멀 룩", item: "제트 블랙 자켓, 차콜 슬랙스", effect: "감정적 과열을 억제하고 이성적 신용 구축" },
            { type: "💄 메이크업", style: "차분한 세미매트 스킨", item: "톤다운 무드 레드 립", effect: "들뜬 기운을 가라앉히고 확실한 중심감 어필" },
            { type: "💍 액세서리", style: "실버 메탈 주얼리", item: "화이트 실버 체인 팔찌", effect: "화극금의 상성 충돌을 정화하고 판단력 확보" },
            { type: "💨 럭키 향수", style: "시원한 마린/아쿠아 향조", item: "시트러스 마린, 시원한 바다 향", effect: "뜨거운 열기를 차갑고 지혜로운 공기로 전환" }
          ];
        } else if (dayStemEl === "토" || dayStemEl === "土") {
          luckyColors = [
            { name: "라이트 베이지", code: "#FAF5EB", energy: "토(土) 신용", desc: "안정적 결실" },
            { name: "골드", code: "#D4AF37", energy: "금(金) 결실", desc: "자산 회전" },
            { name: "크림 화이트", code: "#FFFDF9", energy: "금(金) 의지", desc: "조력 귀인" },
            { name: "딥 브라운", code: "#4A3B32", energy: "토(土) 수호", desc: "근간 수비" }
          ];
          item1Title = "🏺 도자기 화병 또는 세라믹 소품";
          item1Desc = "고풍스러운 세라믹 소품은 흙의 단단한 신용을 자극하여 영업 및 중요한 계약 성공률을 비약적으로 올려줍니다.";
          item2Title = "🪙 황금색 가죽 지갑";
          item2Desc = "베이지 또는 골드빛 천연 가죽 지갑은 사주 내 토 기운을 강화하여 자산이 밖으로 새지 않는 금전 창고를 닦아줍니다.";
          itemsTable = [
            { type: "👔 의상 코디", style: "베이지/얼스 톤 매칭", item: "베이지 셔켓, 라이트 토프 슬랙스", effect: "상대방에게 굳건하고 편안한 장기적 신용 어필" },
            { type: "💄 메이크업", style: "차분하고 화사한 음영 톤", item: "오렌지/브라운 매트 립스틱", effect: "비위장과 위장을 편안히 보해 안색 안정 유도" },
            { type: "💍 액세서리", style: "골드/황동 주얼리", item: "로즈 골드 링, 황동 열쇠고리", effect: "토생금의 상생으로 자금 회전력과 기회 상승" },
            { type: "💨 럭키 향수", style: "포근하고 은은한 우디 향조", item: "샌달우드, 앰버 향", effect: "흔들리지 않는 굳건하고 진중한 신뢰감 조성" }
          ];
        } else if (dayStemEl === "금" || dayStemEl === "金") {
          luckyColors = [
            { name: "메탈 실버", code: "#EAEAEA", energy: "금(金) 결단", desc: "이성 회복" },
            { name: "크림 화이트", code: "#FFFDF9", energy: "금(金) 청량", desc: "명예 수호" },
            { name: "네이비", code: "#1A2E40", energy: "수(水) 설기", desc: "과열 냉각" },
            { name: "딥 카키", code: "#3B4D3C", energy: "목(木) 재성", desc: "재물 확보" }
          ];
          item1Title = "⌚ 메탈 바디 손목시계";
          item1Desc = "차가운 금속 톤의 스틸 시계나 메탈 소품은 금(金)의 지혜를 더하여 대인관계 내 칼 같은 분별력과 명예를 지켜줍니다.";
          item2Title = "🪞 원형 유리 거울 또는 크리스탈";
          item2Desc = "빛을 반사하고 맑게 투과하는 투명 크리스탈 소품은 폐/대장의 조금 기질을 맑게 제련하여 건강운을 보강합니다.";
          itemsTable = [
            { type: "👔 의상 코디", style: "클래식 모노톤 비즈니스 룩", item: "화이트 셔츠, 차콜 자켓", effect: "이성적인 전문성과 신뢰감 있는 판단력 전달" },
            { type: "💄 메이크업", style: "맑고 깨끗한 하이라이터 포인트", item: "실버 펄 하이라이터, 립글로스", effect: "얼굴에 맑고 시원한 금수의 기류를 활성화" },
            { type: "💍 액세서리", style: "실버/화이트 골드 주얼리", item: "실버 링, 스틸안경테", effect: "화기의 위협으로부터 나를 수호하는 방패 작동" },
            { type: "💨 럭키 향수", style: "시원하고 깨끗한 비누 향조", item: "코튼, 화이트 머스크 향", effect: "정신적인 피로를 풀고 투명하고 맑은 성정 정돈" }
          ];
        } else {
          luckyColors = [
            { name: "딥 네이비", code: "#1A2E40", energy: "수(水) 지혜", desc: "인맥 확보" },
            { name: "제트 블랙", code: "#0D0D0D", energy: "수(水) 수호", desc: "자산 보존" },
            { name: "메탈 실버", code: "#EAEAEA", energy: "금(金) 상생", desc: "에너지 충전" },
            { name: "크림 화이트", code: "#FFFDF9", energy: "금(金) 의지", desc: "계약 보증" }
          ];
          itemsTable = [
            { type: "👔 의상 코디", style: "모던 미니멀 시크 룩", item: "네이비 자켓, 블랙 슬랙스", effect: "상대에게 지혜롭고 깊이 있는 신용과 무게감 전달" },
            { type: "💄 메이크업", style: "윤기 나는 세미글로우 스킨", item: "투명 수분 립밤, 펄 에센스", effect: "가을 이슬 같은 촉촉함으로 금수쌍청 기류 극대화" },
            { type: "💍 액세서리", style: "메탈 스틸 시계", item: "스틸 손목시계, 은 귀걸이", effect: "수기를 생조하는 금의 기류로 명예운과 의지 강화" },
            { type: "💨 럭키 향수", style: "차분하고 묵직한 마린/우디 향", item: "마린, 샌달우드, 머스크 향", effect: "조급한 열기를 가라앉히고 지혜로운 여유 풍김" }
          ];
        }

        return wrapLock(
          <div className="space-y-6 py-4">
            <div className="text-center space-y-2 mb-8">
              <span className="text-xs text-[#A3845B] font-bold block">吉慶 衣裝 (길경 의장)</span>
              <h2 className="font-myeongjo text-2xl font-bold text-[#1A1A1A]">신년 추천 수호 소품 리스트</h2>
              <div className="w-16 h-0.5 bg-[#A3845B]/30 mx-auto my-1" />
            </div>

            <div className="bg-white border border-[#E2DDD5] rounded-lg p-6 space-y-6 shadow-sm text-xs leading-relaxed font-light text-gray-700 font-traditional">
              <p className="text-justify font-light text-gray-600">
                의복과 수호 소품의 매칭은 일상 속에서 가장 즉각적으로 기운의 불균형을 바로잡는 <strong>개운 행동 풍수</strong>의 핵심입니다. 2026년 병오년의 맹렬한 화(火) 기류에 반응하여 의뢰인 {name}님의 사주에 안락함을 선사할 맞춤형 아이템과 의상 코디네이션을 제안합니다.
              </p>

              {/* 시각화: 오행 럭키 컬러 칩 */}
              <div className="bg-[#FAF8F5] border border-[#E2DDD5]/60 rounded-xl p-5 space-y-4">
                <span className="font-bold text-xs text-[#8A6F4C] block text-center">🎨 {dayStemEl}일간 맞춤 럭키 컬러 팔레트</span>
                <div className="grid grid-cols-4 gap-3 max-w-md mx-auto">
                  {luckyColors.map((color, idx) => (
                    <div key={idx} className="flex flex-col items-center space-y-1.5 p-2 bg-white rounded-lg border border-[#E2DDD5]/40 shadow-sm">
                      <div className="w-10 h-10 rounded-full border border-gray-300 shadow-inner" style={{ backgroundColor: color.code }} />
                      <span className="font-semibold text-gray-800 text-[9px]">{color.name}</span>
                      <span className="text-[8px] text-gray-400 font-light">{color.energy}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 수호 아이템 2열 카드 */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#FAF7F0] border border-[#E2DDD5]/60 p-4 rounded-xl space-y-2 text-justify">
                  <span className="font-bold text-[#A3845B] text-[11px] block">{item1Title}</span>
                  <p className="text-[9px] text-gray-500 font-light leading-relaxed">{item1Desc}</p>
                </div>
                <div className="bg-[#FAF7F0] border border-[#E2DDD5]/60 p-4 rounded-xl space-y-2 text-justify">
                  <span className="font-bold text-[#A3845B] text-[11px] block">{item2Title}</span>
                  <p className="text-[9px] text-gray-500 font-light leading-relaxed">{item2Desc}</p>
                </div>
              </div>

              {/* 디테일 처방 조견표 */}
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
                    {itemsTable.map((row, idx) => (
                      <tr key={idx} className="border-b border-[#E2DDD5]/40">
                        <td className="p-2 font-semibold text-gray-800">{row.type}</td>
                        <td className="p-2 text-center font-medium">{row.style}</td>
                        <td className="p-2 text-center text-[#8A6F4C] font-semibold">{row.item}</td>
                        <td className="p-2">{row.effect}</td>
                      </tr>
                    ))}
                    <tr className="bg-rose-50/30">
                      <td className="p-2 font-semibold text-rose-800">⚠️ 피할 스타일</td>
                      <td className="p-2 text-center font-medium text-rose-950">화려한 원색 패션</td>
                      <td className="p-2 text-center text-rose-700 font-semibold">레드, 핫핑크, 네온 오렌지</td>
                      <td className="p-2 text-rose-950">뜨거운 화기를 자극해 심리적 충동과 구설 유발</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* 3열 수칙 카드 */}
              <div className="grid grid-cols-3 gap-3 pt-2">
                <div className="bg-[#FAF7F0] border border-[#E2DDD5]/60 p-3 rounded-xl text-center shadow-inner">
                  <span className="font-bold text-[#A3845B] text-[10px] block">👔 의복 수호</span>
                  <p className="text-[8px] text-gray-400 font-light mt-1 leading-snug">수호 컬러의 의상을 착용해 조후 균형 보강</p>
                </div>
                <div className="bg-[#FAF7F0] border border-[#E2DDD5]/60 p-3 rounded-xl text-center shadow-inner">
                  <span className="font-bold text-[#A3845B] text-[10px] block">💍 금속 조율</span>
                  <p className="text-[8px] text-gray-400 font-light mt-1 leading-snug">메탈 주얼리나 시계로 결단 기류 활성화</p>
                </div>
                <div className="bg-[#FAF7F0] border border-[#E2DDD5]/60 p-3 rounded-xl text-center shadow-inner">
                  <span className="font-bold text-[#A3845B] text-[10px] block">💨 행운 향기</span>
                  <p className="text-[8px] text-gray-400 font-light mt-1 leading-snug">안락을 선사하는 럭키 향수로 정서 안정 유도</p>
                </div>
              </div>
            </div>
          </div>,
          "신년 추천 수호 소품 리스트"
        );
      }
`;

// -----------------------------------------------------------------------------
// [Page 50] ny_lucky_fashion
// -----------------------------------------------------------------------------
const codePage50 = `case "ny_lucky_fashion": {
        const dayStemEl = sajuInfo?.day?.stemEl || "목";
        const woodCount = sajuInfo?.elements?.["목"] || 0;
        const fireCount = sajuInfo?.elements?.["화"] || 0;
        const earthCount = sajuInfo?.elements?.["토"] || 0;
        const metalCount = sajuInfo?.elements?.["금"] || 0;
        const waterCount = sajuInfo?.elements?.["수"] || 0;

        let luckyColors = [];
        let itemsTable = [];

        if (dayStemEl === "목" || dayStemEl === "木") {
          luckyColors = [
            { name: "포레스트 그린", code: "#2F5233", energy: "목(木) 생기", desc: "주체성 회복" },
            { name: "에메랄드", code: "#00A86B", energy: "목(木) 성장", desc: "진로 확장" },
            { name: "크림 화이트", code: "#FFFDF9", energy: "금(金) 의지", desc: "결단력 보완" },
            { name: "라이트 옐로우", code: "#FFF8D6", energy: "토(土) 신뢰", desc: "재물운 안착" }
          ];
          itemsTable = [
            { type: "👔 의상 코디", style: "내추럴 톤온톤 룩", item: "카키/베이지 리넨 셔츠", effect: "대인관계에 부드러운 신뢰와 편안함을 공급" },
            { type: "💄 메이크업", style: "내추럴 누드 톤 스킨", item: "차분한 브라운/피치 립밤", effect: "과도한 긴장을 가라앉히고 안정감을 연출" },
            { type: "💍 액세서리", style: "원목 가죽 믹스 주얼리", item: "천연 가죽 밴드 손목 시계", effect: "목의 고집을 조율하고 융통성 있는 교류 촉진" },
            { type: "💨 럭키 향수", style: "싱그러운 풀잎 향조", item: "그린 티, 편백나무 향", effect: "머리를 맑게 하고 집중력과 스트레스 저하 유도" }
          ];
        } else if (dayStemEl === "화" || dayStemEl === "火") {
          luckyColors = [
            { name: "제트 BLACK", code: "#0D0D0D", energy: "수(水) 수호", desc: "감정 진정" },
            { name: "딥 BLUE", code: "#0F2027", energy: "수(水) 지혜", desc: "구설수 차단" },
            { name: "에메랄드 그린", code: "#1B4D3E", energy: "목(木) 상생", desc: "인덕 공급" },
            { name: "딥 PURPLE", code: "#3F2B96", energy: "화(火) 조율", desc: "영감 충전" }
          ];
          itemsTable = [
            { type: "👔 의상 코디", style: "시크 미니멀 룩", item: "제트 블랙 자켓, 차콜 슬랙스", effect: "감정적 과열을 억제하고 이성적 신용 구축" },
            { type: "💄 메이크업", style: "차분한 세미매트 스킨", item: "톤다운 무드 RED 립", effect: "들뜬 기운을 가라앉히고 확실한 중심감 어필" },
            { type: "💍 액세서리", style: "실버 메탈 주얼리", item: "실버 체인 팔찌, 메탈 실버 귀걸이", effect: "화극금의 상성 충돌을 정화하고 판단력 확보" },
            { type: "💨 럭키 향수", style: "시원한 마린/아쿠아 향조", item: "시트러스 마린, 시원한 바다 향", effect: "뜨거운 열기를 차갑고 지혜로운 공기로 전환" }
          ];
        } else if (dayStemEl === "토" || dayStemEl === "土") {
          luckyColors = [
            { name: "라이트 베이지", code: "#FAF5EB", energy: "토(土) 신용", desc: "안정적 결실" },
            { name: "골드", code: "#D4AF37", energy: "금(金) 결실", desc: "자산 회전" },
            { name: "크림 화이트", code: "#FFFDF9", energy: "금(金) 의지", desc: "조력 귀인" },
            { name: "딥 브라운", code: "#4A3B32", energy: "토(土) 수호", desc: "근간 수비" }
          ];
          itemsTable = [
            { type: "👔 의상 코디", style: "베이지/얼스 톤 매칭", item: "베이지 셔켓, 라이트 토프 슬랙스", effect: "상대방에게 굳건하고 편안한 장기적 신용 어필" },
            { type: "💄 메이크업", style: "차분하고 화사한 음영 톤", item: "오렌지/브라운 매트 립스틱", effect: "비위장과 위장을 편안히 보해 안색 안정 유도" },
            { type: "💍 액세서리", style: "골드/황동 주얼리", item: "로즈 골드 링, 황동 열쇠고리", effect: "토생금의 상생으로 자금 회전력과 기회 상승" },
            { type: "💨 럭키 향수", style: "포근하고 은은한 우디 향조", item: "샌달우드, 앰버 향", effect: "흔들리지 않는 굳건하고 진중한 신뢰감 조성" }
          ];
        } else if (dayStemEl === "금" || dayStemEl === "金") {
          luckyColors = [
            { name: "메탈 실버", code: "#EAEAEA", energy: "금(金) 결단", desc: "이성 회복" },
            { name: "크림 화이트", code: "#FFFDF9", energy: "금(金) 청량", desc: "명예 수호" },
            { name: "네이비", code: "#1A2E40", energy: "수(Water) 설기", desc: "과열 냉각" },
            { name: "딥 카키", code: "#3B4D3C", energy: "목(木) 재성", desc: "재물 확보" }
          ];
          itemsTable = [
            { type: "👔 의상 코디", style: "클래식 모노톤 비즈니스 룩", item: "화이트 셔츠, 차콜 자켓", effect: "이성적인 전문성과 신뢰감 있는 판단력 전달" },
            { type: "💄 메이크업", style: "맑고 깨끗한 하이라이터 포인트", item: "실버 펄 하이라이터, 립글로스", effect: "얼굴에 맑고 시원한 금수의 기류를 활성화" },
            { type: "💍 액세서리", style: "실버/화이트 골드 주얼리", item: "실버 링, 스틸안경테", effect: "화기의 위협으로부터 나를 수호하는 방패 작동" },
            { type: "💨 럭키 향수", style: "시원하고 깨끗한 비누 향조", item: "코튼, 화이트 머스크 향", effect: "정신적인 피로를 풀고 투명하고 맑은 성정 정돈" }
          ];
        } else {
          luckyColors = [
            { name: "딥 네이비", code: "#1A2E40", energy: "수(水) 지혜", desc: "인맥 확보" },
            { name: "제트 블랙", code: "#0D0D0D", energy: "수(水) 수호", desc: "자산 보존" },
            { name: "메탈 실버", code: "#EAEAEA", energy: "금(金) 상생", desc: "에너지 충전" },
            { name: "크림 화이트", code: "#FFFDF9", energy: "금(金) 의지", desc: "계약 보증" }
          ];
          itemsTable = [
            { type: "👔 의상 코디", style: "모던 미니멀 시크 룩", item: "네이비 자켓, 블랙 슬랙스", effect: "상대에게 지혜롭고 깊이 있는 신용과 무게감 전달" },
            { type: "💄 메이크업", style: "윤기 나는 세미글로우 스킨", item: "투명 수분 립밤, 펄 에센스", effect: "가을 이슬 같은 촉촉함으로 금수쌍청 기류 극대화" },
            { type: "💍 액세서리", style: "메탈 스틸 시계", item: "스틸 손목시계, 은 귀걸이", effect: "수기를 생조하는 금의 기류로 명예운과 의지 강화" },
            { type: "💨 럭키 향수", style: "차분하고 묵직한 마린/우디 향", item: "마린, 샌달우드, 머스크 향", effect: "조급한 열기를 가라앉히고 지혜로운 여유 풍김" }
          ];
        }

        const creditScore = Math.min(95, 75 + earthCount * 4);
        const gossipDefense = Math.min(95, 70 + (waterCount + metalCount) * 4);
        const calmRate = Math.min(95, 65 + (waterCount + earthCount) * 5);
        const synergyScore = Math.min(95, 70 + (woodCount + metalCount) * 4);

        return wrapLock(
          <div className="space-y-6 py-4">
            <div className="text-center space-y-2 mb-8">
              <span className="text-xs text-[#A3845B] font-bold block">패션 스타일링 (吉慶 衣裝)</span>
              <h2 className="font-myeongjo text-2xl font-bold text-[#1A1A1A]">나의 사주 기운을 보완하는 외적 연출법</h2>
              <div className="w-16 h-0.5 bg-[#A3845B]/30 mx-auto my-1" />
            </div>

            <div className="bg-white border border-[#E2DDD5] rounded-lg p-6 space-y-6 shadow-sm text-xs leading-relaxed font-light text-gray-700 font-traditional">
              <p className="text-justify font-light text-gray-600">
                옷차림과 컬러 배치는 가장 손쉽고 즉각적으로 내 주변의 개운 에너지를 자극하는 행동 풍수 실천법입니다. 2026년 병오년의 타오르는 화(火)의 열기를 식히고 메마른 땅을 적시는 수(수) 기운과, 단단한 결단력을 제공하는 금(금) 기운을 일상의 패션과 메이크업, 향수 섭생법을 통해 적극적으로 주입하십시오.
              </p>

              {/* 시각화 1: 럭키 컬러 칩 팔레트 */}
              <div className="bg-[#FAF8F5] border border-[#E2DDD5]/60 rounded-xl p-5 space-y-4">
                <span className="font-bold text-xs text-[#8A6F4C] block text-center">🎨 병오년 수호 오행 럭키 컬러 팔레트</span>
                <div className="grid grid-cols-4 gap-3 max-w-md mx-auto">
                  {luckyColors.map((color, idx) => (
                    <div key={idx} className="flex flex-col items-center space-y-1.5 p-2 bg-white rounded-lg border border-[#E2DDD5]/40 shadow-sm">
                      <div className="w-10 h-10 rounded-full border border-gray-300 shadow-inner" style={{ backgroundColor: color.code }} />
                      <span className="font-semibold text-gray-800 text-[9px]">{color.name}</span>
                      <span className="text-[8px] text-gray-400 font-light">{color.energy}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 시각화 2: 스타일 시너지 및 보호 에너지 지표 */}
              <div className="bg-[#FAF7F0]/40 border border-[#E2DDD5] rounded-xl p-4 space-y-3 shadow-inner">
                <span className="font-bold text-xs text-[#8A6F4C] block">📊 럭키 스타일링 운세 보정 지표</span>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <div className="flex justify-between text-[9px] font-semibold text-[#8A6F4C]">
                      <span>대인관계 신용 및 평판 상승률</span>
                      <span className="text-[#8A6F4C]">{creditScore}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-[#A3845B] rounded-full" style={{ width: \`\${creditScore}%\` }} />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-[9px] font-semibold text-[#8A6F4C]">
                      <span>구설수 방어 및 악살 차단율</span>
                      <span className="text-[#8A6F4C]">{gossipDefense}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-[#A3845B] rounded-full" style={{ width: \`\${gossipDefense}%\` }} />
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 pt-1">
                  <div className="space-y-1">
                    <div className="flex justify-between text-[9px] font-semibold text-[#8A6F4C]">
                      <span>심리적 안정 & 조급함 냉각률</span>
                      <span className="text-[#8A6F4C]">{calmRate}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-[#A3845B] rounded-full" style={{ width: \`\${calmRate}%\` }} />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-[9px] font-semibold text-[#8A6F4C]">
                      <span>영업 / 계약 성사 시너지</span>
                      <span className="text-[#8A6F4C]">{synergyScore}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-[#A3845B] rounded-full" style={{ width: \`\${synergyScore}%\` }} />
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
                    {itemsTable.map((row, idx) => (
                      <tr key={idx} className="border-b border-[#E2DDD5]/40">
                        <td className="p-2 font-semibold text-gray-800">{row.type}</td>
                        <td className="p-2 text-center font-medium">{row.style}</td>
                        <td className="p-2 text-center text-[#8A6F4C] font-semibold">{row.item}</td>
                        <td className="p-2">{row.effect}</td>
                      </tr>
                    ))}
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
                  <span className="font-bold text-[#A3845B] text-[10px] block">수호 컬러 코디</span>
                  <p className="text-[8px] text-gray-400 font-light mt-1 leading-snug">수호 오행 컬러의 상의를 선택하여 밸런스 확보</p>
                </div>
                <div className="bg-[#FAF7F0] border border-[#E2DDD5]/60 p-3 rounded-xl text-center shadow-inner">
                  <span className="text-xl block mb-1">💍</span>
                  <span className="font-bold text-[#A3845B] text-[10px] block">메탈 포인트</span>
                  <p className="text-[8px] text-gray-400 font-light mt-1 leading-snug">스틸 시계나 실버 주얼리로 결단력 보완</p>
                </div>
                <div className="bg-[#FAF7F0] border border-[#E2DDD5]/60 p-3 rounded-xl text-center shadow-inner">
                  <span className="text-xl block mb-1">💄</span>
                  <span className="font-bold text-[#A3845B] text-[10px] block">광택 하이라이터</span>
                  <p className="text-[8px] text-gray-400 font-light mt-1 leading-snug">얼굴에 투명한 수분감을 더해 조급성 냉각</p>
                </div>
              </div>
            </div>
          </div>,
          "신년 패션 메이크업 스타일링 가이드"
        );
      }`;

// -----------------------------------------------------------------------------
// [Page 51 - 52] ny_diet_presc, ny_final_blessing
// -----------------------------------------------------------------------------
const codePage51To52 = `case "ny_diet_presc": {
        const dayStemEl = sajuInfo?.day?.stemEl || "목";
        const woodCount = sajuInfo?.elements?.["목"] || 0;
        const fireCount = sajuInfo?.elements?.["화"] || 0;
        const earthCount = sajuInfo?.elements?.["토"] || 0;
        const metalCount = sajuInfo?.elements?.["금"] || 0;
        const waterCount = sajuInfo?.elements?.["수"] || 0;

        let constitutionName = "오행 평형 체질";
        let constitutionDesc = "";
        let goodFoods = "";
        let badFoods = "";
        let teaName = "";
        let teaDesc = "";
        let organGraph = null;

        // 동적 지표 사전 선언으로 미선언 에러 차단
        const woodRisk = Math.min(95, 55 + fireCount * 6);
        const woodEfficiency = Math.min(95, 75 + woodCount * 3);
        const fireOverheat = Math.min(99, 70 + fireCount * 7);
        const waterDryness = Math.min(95, 60 + (4 - waterCount) * 7);
        const earthBarrier = Math.min(95, 75 + earthCount * 4);
        const woodSuppress = Math.min(95, 65 + woodCount * 3);
        const lungMucosa = Math.min(95, 50 + metalCount * 8);
        const bowelStability = Math.min(95, 60 + (metalCount + waterCount) * 4);
        const waterIndex = Math.min(95, 50 + waterCount * 8);
        const wombImmunity = Math.min(95, 60 + (waterCount + metalCount) * 4);

        if (dayStemEl === "목" || dayStemEl === "木") {
          constitutionName = "풍목(風木) 체질 (간·담 기능 편중)";
          constitutionDesc = "목 기운의 특징인 솟구치는 기운이 강하여, 스트레스를 받거나 화기가 침범할 때 눈의 피로와 어깨 결림, 두통이 쉽게 동반되는 체질입니다. 타오르는 화기로 인해 체내 목기가 건조해져 신경계 피로가 누적될 위험이 높습니다.";
          goodFoods = "브로콜리, 미나리, 시금치 등 푸른 잎 채소 및 사과, 매실 (피로 해소 유도)";
          badFoods = "지나치게 매운 마늘/고추 요리, 튀긴 고기류, 고도수의 음주 (간열 증폭)";
          teaName = "구기자차 (枸杞子茶)";
          teaDesc = "구기자는 건조해진 간 기능을 보호하고 눈의 피로를 낮추며 목기를 부드럽게 이완시킵니다.";
          organGraph = (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <div className="flex justify-between text-[9px] font-semibold text-[#8A6F4C]">
                  <span>간·담(木) 피로도</span>
                  <span className="text-[#8A6F4C]">{woodRisk}%</span>
                </div>
                <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-700 rounded-full" style={{ width: \`\${woodRisk}%\` }} />
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-[9px] font-semibold text-[#8A6F4C]">
                  <span>위·장(土) 소화 효율</span>
                  <span className="text-[#8A6F4C]">{woodEfficiency}%</span>
                </div>
                <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-yellow-600 rounded-full" style={{ width: \`\${woodEfficiency}%\` }} />
                </div>
              </div>
            </div>
          );
        } else if (dayStemEl === "화" || dayStemEl === "火") {
          constitutionName = "군화(君火) 체질 (심·소장 상열 체질)";
          constitutionDesc = "2026년 병오년의 타오르는 강력한 불꽃 세운과 만나 불기운이 극에 달할 수 있는 체질입니다. 상반신으로 열이 쉽게 솟구쳐 안면 홍조, 구내염, 수면 장애(불면증)가 생기기 쉬우며 혈압 조율에 신경 써야 합니다.";
          goodFoods = "오이, 토마토, 수박 등 수분과 찬 성질이 가득한 채소 및 메밀 (상열감 완화)";
          badFoods = "마라탕, 자극적인 향신료, 과도한 육류 섭취, 카페인 다량 섭취 (심혈관 열증 자극)";
          teaName = "보리차 또는 죽엽차 (竹葉茶)";
          teaDesc = "대나무 잎으로 우려낸 차는 심장의 불같은 열을 차분하게 가라앉히고 수분을 보충해 줍니다.";
          organGraph = (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <div className="flex justify-between text-[9px] font-semibold text-[#8A6F4C]">
                  <span>심·소장(火) 과열도</span>
                  <span className="text-[#8A6F4C]">{fireOverheat}%</span>
                </div>
                <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-red-700 rounded-full" style={{ width: \`\${fireOverheat}%\` }} />
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-[9px] font-semibold text-[#8A6F4C]">
                  <span>신·방광(Water) 건조율</span>
                  <span className="text-[#8A6F4C]">{waterDryness}%</span>
                </div>
                <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-slate-800 rounded-full" style={{ width: \`\${waterDryness}%\` }} />
                </div>
              </div>
            </div>
          );
        } else if (dayStemEl === "토" || dayStemEl === "土") {
          constitutionName = "습토(濕土) 체질 (비·위장 소화기 편중)";
          constitutionDesc = "소화기 계통의 힘을 쥐고 있으나, 세운의 열기가 강해져 위장이 쉽게 메마르고 체내 노폐물(습담)이 끈적하게 남기 쉬운 체질입니다. 비위가 약해지면 피로감과 복부 팽만감을 자주 호소할 수 있습니다.";
          goodFoods = "단호박, 양배추, 연근, 감자 등 옐로우 푸드 및 율무 (비위 소화 촉진)";
          badFoods = "차가운 빙수나 맥주, 차가운 날음식, 밀가루 가공품 (비장 소화 마비)";
          teaName = "생강나무차 또는 백출차 (白朮茶)";
          teaDesc = "백출차는 위장의 습기를 제거하고 위벽을 튼튼하게 보해 소화 흡수력을 상승시킵니다.";
          organGraph = (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <div className="flex justify-between text-[9px] font-semibold text-[#8A6F4C]">
                  <span>비·위장(土) 방어막</span>
                  <span className="text-[#8A6F4C]">{earthBarrier}%</span>
                </div>
                <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-yellow-600 rounded-full" style={{ width: \`\${earthBarrier}%\` }} />
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-[9px] font-semibold text-[#8A6F4C]">
                  <span>간·담(木) 억제 지수</span>
                  <span className="text-[#8A6F4C]">{woodSuppress}%</span>
                </div>
                <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-700 rounded-full" style={{ width: \`\${woodSuppress}%\` }} />
                </div>
              </div>
            </div>
          );
        } else if (dayStemEl === "금" || dayStemEl === "金") {
          constitutionName = "조금(燥金) 체질 (폐·대장 호흡기 편중)";
          constitutionDesc = "단단하고 냉정하지만 화기 세운의 침입으로 가장 쉽게 녹아내리는(화극금) 연약한 쇠붙이의 기질입니다. 피부 건조증, 만성 마른기침, 대장 건조로 인한 변비 등에 매우 취약한 체질입니다.";
          goodFoods = "무, 도라지, 더덕, 버섯 등 흰색 뿌리 채소 및 배즙 (호흡기/피부 점막 보습)";
          badFoods = "바비큐, 구운 고기류, 고추장 등 매운 음식, 흡연 (기관지 건조 자극)";
          teaName = "맥문동차 (麥門冬茶)";
          teaDesc = "맥문동은 폐와 목구멍에 음액(수분)을 듬뿍 넣어 건조함을 몰아내고 마른기침을 가라앉힙니다.";
          organGraph = (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <div className="flex justify-between text-[9px] font-semibold text-[#8A6F4C]">
                  <span>폐·기관지(金) 점막도</span>
                  <span className="text-[#8A6F4C]">{lungMucosa}%</span>
                </div>
                <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-zinc-400 rounded-full" style={{ width: \`\${lungMucosa}%\` }} />
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-[9px] font-semibold text-[#8A6F4C]">
                  <span>대장(金) 수분 유지력</span>
                  <span className="text-[#8A6F4C]">{bowelStability}%</span>
                </div>
                <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-zinc-500 rounded-full" style={{ width: \`\${bowelStability}%\` }} />
                </div>
              </div>
            </div>
          );
        } else {
          constitutionName = "한수(寒水) 체질 (신·방광 신진대사 편중)";
          constitutionDesc = "차분하고 유연한 물 기운을 타고났으나, 2026년 병오년의 극강의 불꽃 세운에 직격탄을 맞아 체내 수기가 통째로 증발(수화대립)하기 쉽습니다. 비뇨기, 자궁, 호르몬 대사 저하 및 체내 전해질 부족을 겪기 쉽습니다.";
          goodFoods = "미역, 다시마 등 해조류와 검은콩, 검은깨, 신선한 생선 및 굴 (신장 활성화)";
          badFoods = "짠 찌개 및 소금기 많은 스낵, 과한 알코올 섭취 (신장 탈수 가중)";
          teaName = "옥수수수염차 또는 검은콩차";
          teaDesc = "신장의 노폐물 배출력을 돕고 탈수를 막으며 신장 에너지를 깊숙이 충전합니다.";
          organGraph = (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <div className="flex justify-between text-[9px] font-semibold text-[#8A6F4C]">
                  <span>신·방광(水) 음액 지수</span>
                  <span className="text-[#8A6F4C]">{waterIndex}%</span>
                </div>
                <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-slate-900 rounded-full" style={{ width: \`\${waterIndex}%\` }} />
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-[9px] font-semibold text-[#8A6F4C]">
                  <span>자궁·생식계 면역력</span>
                  <span className="text-[#8A6F4C]">{wombImmunity}%</span>
                </div>
                <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-slate-700 rounded-full" style={{ width: \`\${wombImmunity}%\` }} />
                </div>
              </div>
            </div>
          );
        }

        return wrapLock(
          <div className="space-y-6 py-4">
            <div className="text-center space-y-2 mb-8">
              <span className="text-xs text-[#A3845B] font-bold block">오행 섭생법 (五行 攝生)</span>
              <h2 className="font-myeongjo text-2xl font-bold text-[#1A1A1A]">기운을 안정시키는 건강 체질 음식 가이드</h2>
              <div className="w-16 h-0.5 bg-[#A3845B]/30 mx-auto my-1" />
            </div>

            <div className="bg-white border border-[#E2DDD5] rounded-lg p-6 space-y-6 shadow-sm text-xs leading-relaxed font-light text-gray-700 font-traditional">
              <p className="text-justify font-light text-gray-600">
                매일 입으로 들어가는 음식의 오행 성질은 오장육부의 열과 한기를 조율하는 기초 한의학적 개운 처방입니다. 의뢰인 <strong>{name}</strong>님의 사주 일간 오행 성향을 분석한 결과, 아래와 같이 맞춤형 약선 섭생 처방이 제공됩니다.
              </p>

              {/* 시각화 1: 개인 사주 맞춤 체질 진단 */}
              <div className="bg-[#FAF8F5] border border-[#E2DDD5]/60 rounded-xl p-5 space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-xl">🌿</span>
                  <div>
                    <span className="text-[10px] text-[#A3845B] font-bold block">나의 맞춤형 오행 체질</span>
                    <span className="font-myeongjo text-sm font-bold text-gray-800">{constitutionName}</span>
                  </div>
                </div>
                <p className="text-[10px] text-gray-500 font-light leading-relaxed border-t border-[#E2DDD5]/40 pt-2 text-justify">
                  {constitutionDesc}
                </p>
              </div>

              {/* 시각화 2: 오행 장부 강약 지표 */}
              <div className="bg-[#FAF7F0]/40 border border-[#E2DDD5] rounded-xl p-4 space-y-3 shadow-inner">
                <span className="font-bold text-xs text-[#8A6F4C] block">📊 2026년 오행 장부(臟腑) 에너지 밸런스</span>
                {organGraph}
              </div>

              {/* 추천/기피 섭생 매칭 플레이트 */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-emerald-50/40 border border-emerald-100/70 p-4 rounded-xl space-y-2">
                  <span className="font-bold text-emerald-800 text-[11px] block flex items-center gap-1">
                    🟢 추천 식자재 (Good)
                  </span>
                  <p className="text-[9px] text-emerald-950 font-light leading-relaxed text-justify">
                    {goodFoods}
                  </p>
                </div>
                <div className="bg-rose-50/40 border border-rose-100/70 p-4 rounded-xl space-y-2">
                  <span className="font-bold text-rose-800 text-[11px] block flex items-center gap-1">
                    🔴 삼가야 할 음식 (Bad)
                  </span>
                  <p className="text-[9px] text-rose-950 font-light leading-relaxed text-justify">
                    {badFoods}
                  </p>
                </div>
              </div>

              {/* 수호 약선차 디테일 카드 */}
              <div className="bg-[#FAF7F0] border border-[#E2DDD5]/60 p-4 rounded-xl shadow-sm text-justify flex items-start gap-4">
                <span className="text-2xl pt-0.5">☕</span>
                <div className="space-y-1">
                  <span className="font-bold text-[#A3845B] text-[11px] block">신년 추천 개운 차: {teaName}</span>
                  <p className="text-[9px] text-gray-500 font-light leading-relaxed">
                    {teaDesc} 따뜻하게 우려내어 하루 한 잔씩 편안한 시간에 음용하며 내면의 장기 기운을 순탄하게 보완하십시오.
                  </p>
                </div>
              </div>
            </div>
          </div>,
          "체질 맞춤형 오행 섭생 음식 처방"
        );
      }

      case "ny_final_blessing": {
        const dayStemEl = sajuInfo?.day?.stemEl || "목";
        let elementBlessing = "";

        if (dayStemEl === "목" || dayStemEl === " 木") {
          elementBlessing = "푸른 거목처럼 굳건히 뿌리 내려 세운의 뜨거운 열기를 헤치고 위대한 성장을 이루어내시길 축원합니다.";
        } else if (dayStemEl === "화" || dayStemEl === "火") {
          elementBlessing = "어둠을 사르는 태양처럼 세상을 찬란하게 밝히고 내면의 열정과 성취를 아름다운 결실로 승화하시길 기원합니다.";
        } else if (dayStemEl === "토" || dayStemEl === "土") {
          elementBlessing = "만물을 품는 넓은 대지처럼 묵직한 신용과 끈기로 온갖 복록과 금전의 창고를 활짝 열어가시길 축원합니다.";
        } else if (dayStemEl === "금" || dayStemEl === "金") {
          elementBlessing = "단단하고 빛나는 보석처럼 매사에 차분하고 명료한 결단으로 일생의 귀한 대업을 굳건히 완성하시길 기원합니다.";
        } else {
          elementBlessing = "심연을 흐르는 맑은 물결처럼 무한한 지혜와 통찰력으로 삶의 모든 굴곡을 유연하고 복되게 개척해가시길 축원합니다.";
        }

        return wrapLock(
          <div className="py-8 px-4 flex flex-col justify-between min-h-[600px] bg-gradient-to-b from-[#FDFBF7] to-[#FAF6EE] border-4 border-[#A3845B]/30 rounded-2xl relative shadow-lg overflow-hidden">
            {/* 고풍스러운 모서리 문양 */}
            <div className="absolute top-3 left-3 w-8 h-8 border-t-2 border-l-2 border-[#A3845B]/40 pointer-events-none" />
            <div className="absolute top-3 right-3 w-8 h-8 border-t-2 border-r-2 border-[#A3845B]/40 pointer-events-none" />
            <div className="absolute bottom-3 left-3 w-8 h-8 border-b-2 border-l-2 border-[#A3845B]/40 pointer-events-none" />
            <div className="absolute bottom-3 right-3 w-8 h-8 border-b-2 border-r-2 border-[#A3845B]/40 pointer-events-none" />

            <div className="text-center space-y-3 mt-4">
              <span className="text-xs tracking-[0.4em] text-[#A3845B] font-bold block font-myeongjo">— 慧眼堂 寶鑑 —</span>
              <div className="w-16 h-0.5 bg-[#A3845B]/30 mx-auto" />
            </div>

            <div className="my-auto py-8 text-center space-y-8 max-w-lg mx-auto">
              <h1 className="font-myeongjo text-3xl md:text-4xl font-extrabold text-[#1A1A1A] tracking-wider leading-relaxed">
                丙午年 成功 祈願<br />
                최종 축원문 (祝願文)
              </h1>
              
              <div className="w-12 h-1 bg-[#A3845B]/40 mx-auto my-4" />

              {/* 액자식 길조 수호 조언 */}
              <div className="bg-[#FAF8F5]/80 border border-[#E2DDD5]/70 rounded-xl p-6 shadow-inner text-justify text-xs font-traditional font-light text-gray-700 leading-relaxed space-y-4">
                <p>
                  천지합화(天地合火)의 맹렬한 불꽃 기류가 의뢰인 <strong>{name}</strong>님의 인생 앞길을 밝히는 광명의 횃불이 되기를 간절히 기원합니다. 올해의 뜨거운 에너지는 귀하를 지치게 하는 액난을 모두 소멸시키고, 굳건한 금빛 성공의 토양으로 환원될 것입니다.
                </p>
                <p className="font-semibold text-[#8B221E] border-t border-[#E2DDD5]/40 pt-3 text-center">
                  ✨ {name}님을 위한 오행 수호 축원
                </p>
                <p className="italic text-center text-gray-600 font-medium">
                  "{elementBlessing}"
                </p>
              </div>
            </div>

            <div className="mt-8 mb-6 text-center space-y-3 relative z-10">
              <span className="font-myeongjo text-base font-bold text-[#1A1A1A] tracking-widest block">慧眼堂 명리연구소 소장 배상</span>
              <p className="text-[10px] text-gray-400 font-light font-sans">본 보감의 개운법을 일상에 새겨 복록을 누리소서.</p>
            </div>

            {/* 혜안당 공식 직인 (낙관) */}
            <div className="absolute right-12 bottom-12 select-none opacity-90 z-20">
              <svg viewBox="0 0 60 60" className="w-[50px] h-[50px] transform -rotate-6 filter drop-shadow-[0_2px_4px_rgba(139,34,30,0.15)]">
                <rect x="5" y="5" width="50" height="50" rx="3" fill="none" stroke="#8B221E" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="30 1 10 1" />
                <text x="30" y="24" textAnchor="middle" fontSize="12" fontWeight="900" fill="#8B221E" fontFamily="font-myeongjo" letterSpacing="0.5">
                  慧眼
                </text>
                <text x="30" y="41" textAnchor="middle" fontSize="12" fontWeight="900" fill="#8B221E" fontFamily="font-myeongjo" letterSpacing="0.5">
                  堂인
                </text>
              </svg>
            </div>
          </div>
        );
      }`;

// 실행
replaceSingleCase("ny_roadmap_2031", "ny_lucky_fashion", codePage46To49);
replaceSingleCase("ny_lucky_fashion", "ny_diet_presc", codePage50);
replaceSingleCase("ny_diet_presc", "ny_intro_saju", codePage51To52);

fs.writeFileSync(filePath, content, 'utf8');
console.log("=== All Pages 46-52 successfully enriched and saved! ===");
