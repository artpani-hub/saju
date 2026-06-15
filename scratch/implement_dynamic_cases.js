const fs = require('fs');
const path = require('path');

const filePath = path.join('d:', '인터그리비티', 'saju', 'src', 'app', 'result', 'components', 'renderNewYearPageContent.js');
let content = fs.readFileSync(filePath, 'utf8');

// 1. ny_roadmap_2030 케이스 정의 (동적 분기 완벽 지원)
const caseRoadmap2030 = `      case "ny_roadmap_2030": {
        const dayStemEl = getNormalEl(sajuInfo?.day?.stemEl);
        
        // 일간 오행별 운기 핵심 지표 점수 분기
        const scoreMap = {
          "목": { career: 88, stability: 82 },
          "화": { career: 90, stability: 85 },
          "토": { career: 95, stability: 90 },
          "금": { career: 92, stability: 94 },
          "수": { career: 85, stability: 80 }
        };
        const currentScores = scoreMap[dayStemEl] || { career: 88, stability: 85 };

        // 일간 오행별 경술년 세부 조언 분기
        const advice2030 = {
          "목": "목(木) 일간 특성을 가진 귀하에게 2030년 경술년은 굳건한 바위 경금(庚金) 편관이 찾아와 내적인 책임감과 명예적 변동이 크게 작용하는 해입니다. 무리한 개인적 독립이나 충동적 부서 이탈은 금물이니, 기존 조직 내의 탄탄한 권위를 획득하고 지위 수성을 꾀하는 안정성 중심 전략이 대길합니다.",
          "화": "화(火) 일간 특성을 가진 귀하에게 2030년 경술년은 식상생재(食傷生財)의 강력한 자금 순환력이 작용하는 고무적인 해입니다. 세운의 금(金) 기운이 내 재물 창고를 윤택하게 비추므로, 2026년부터 구상해왔던 신규 부업 창업이나 적극적인 투자 안건을 실현하여 확실한 금전 결실을 안착하기에 최적입니다.",
          "토": "토(土) 일간 특성을 가진 귀하에게 2030년 경술년은 내 식상(食傷) 능력을 천하에 널리 표출하고 평판을 올릴 수 있는 명예로운 시기입니다. 창의적인 기획안이 승인되거나, 자격증 취득 및 공적 프로젝트의 완성으로 대외 신뢰도가 최고조에 달하니 적극적으로 활로를 열어가십시오.",
          "금": "금(金) 일간 특성을 가진 귀하에게 2030년 경술년은 든든한 술토(戌土) 인성의 생조와 비겁의 결단력이 시너지를 내는 기맥을 탑니다. 내적인 결단성과 주체성이 매우 단단해져 승진, 권리 확보, 또는 팀의 리더 자리를 꿰차며 실질적인 장악력을 확립할 절호의 골든타임입니다.",
          "수": "수(水) 일간 특성을 가진 귀하에게 2030년 경술년은 단단한 관성(官星) 기류가 삶의 기틀을 확립해주는 해입니다. 정부 공인 계약 체결, 공직 임용, 장기 근속으로의 전환, 혹은 라이센스 영구 획득 등 내 신분과 지위를 만천하에 드러내고 도장 날인을 굳건히 할 수 있는 복된 흐름이 깃듭니다."
        }[dayStemEl] || "조직 내 주도권 획득과 문서 자산 통합에 매진하기에 가장 든든하고 상서로운 타이밍입니다.";

        // 일간 오행별 핵심 실천 전략 분기
        const strategy2030 = {
          "목": "서북(西北) 방향의 공적 기회에 주목하고, 직장에서 명문화된 결재 서류 위주로 성과를 입증하십시오.",
          "화": "금전적 결실을 분산하기보다 단단한 안정자산으로 매수하여 창고에 가두어두는 수성법이 유리합니다.",
          "토": "학업 및 라이센스 확보를 위해 상반기 자격 검정을 집중 겨냥하고 인장 날인을 견고히 다스리십시오.",
          "금": "아랫사람 또는 팀원들과의 소통 주파수를 부드럽게 가져가 독선적인 인상을 방어하는 개운이 필치입니다.",
          "수": "공과 사를 완벽히 가리는 계약 체결에 집중하고, 법적 리스크 소지를 사전 차단하여 문서 격조를 유지하십시오."
        }[dayStemEl] || "조직 내 비효율을 과감하게 다이어트하고 정예 인프라만 선별하십시오.";

        return wrapLock(
          <div className="space-y-6 py-4">
            <div className="text-center space-y-2 mb-8">
              <span className="text-xs text-[#A3845B] font-bold block">2030 경술년(庚戌年) 세운</span>
              <h2 className="font-myeongjo text-2xl font-bold text-[#1A1A1A]">2030년 경술년(庚戌年) 미래 기류 로드맵</h2>
              <div className="w-16 h-0.5 bg-[#A3845B]/30 mx-auto my-1" />
            </div>
            <div className="bg-white border border-[#E2DDD5] rounded-lg p-6 space-y-5 shadow-sm text-xs leading-relaxed font-light text-gray-700 font-traditional">
              <p className="text-justify font-light text-gray-600">
                2030년 경술년(庚戌年)은 강건하고 위엄 있는 바위 경금(庚金)과 땅속에 깊은 온기를 숨겨둔 술토(戌土)가 조우하여 토생금(土生金)의 단단한 매듭을 형성합니다. 2026년 병오년부터 축적해 온 실력과 자산 인프라가 든든하게 결실을 맺으며, 내 삶의 기맥을 하나로 통제하는 확실한 지위를 확립할 수 있는 대성(大成)의 해입니다.
              </p>

              {/* 시각화: 기류 지표 */}
              <div className="bg-[#FAF7F0] border border-[#E2DDD5] rounded-xl p-4 space-y-3">
                <span className="font-bold text-xs text-[#8A6F4C] block">📊 경술년 운기 핵심 지표 (일간 맞춤형)</span>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <div className="flex justify-between text-[9px] font-semibold text-[#8A6F4C]">
                      <span>사회적 명예 & 권위 획득 지수</span>
                      <span className="text-[#8A6F4C]">{currentScores.career}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-[#A3845B] rounded-full" style={{ width: currentScores.career + "%" }} />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-[9px] font-semibold text-[#8A6F4C]">
                      <span>조직 정착도 & 기맥 안정도</span>
                      <span className="text-[#8A6F4C]">{currentScores.stability}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-[#A3845B] rounded-full" style={{ width: currentScores.stability + "%" }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* 미래 로드맵 처방 카드 */}
              <div className="border border-[#E2DDD5] rounded-xl p-4 bg-[#FAF7F0]/40 text-justify space-y-3">
                <span className="font-bold text-xs text-[#8A6F4C] block">🧭 {dayStemEl}일간 맞춤형 경술년 대처 강령</span>
                <p className="text-[10px] text-gray-600 leading-relaxed font-light">
                  {advice2030}
                </p>
                <p className="text-[9px] text-[#A3845B] leading-normal border-t border-[#E2DDD5]/40 pt-2 font-light">
                  * <strong>경술년 핵심 전략:</strong> {strategy2030}
                </p>
              </div>
            </div>
          </div>,
          "2030년 경술년 세운 로드맵"
        );
      }`;

// 2. ny_lucky_fashion 케이스 정의 (동적 분기 완벽 지원)
const caseLuckyFashion = `      case "ny_lucky_fashion": {
        const dayStemEl = getNormalEl(sajuInfo?.day?.stemEl);

        let recommendLook = "";
        let recommendLookDesc = "";
        let recommendAcc = "";
        let recommendAccDesc = "";
        let colorPalette = [];

        if (dayStemEl === "목") {
          recommendLook = "👔 내추럴 리넨 코디 / 그린 포인트 룩";
          recommendLookDesc = "지나치게 인위적이거나 붉은색 계열의 의상은 피하십시오. 편안한 카키, 베이지, 초록색 포인트를 준 리넨 소재 룩을 매치할 때, 타고난 목(木) 기운의 신선한 추진력과 생기를 주위에 전달하기에 최적입니다.";
          recommendAcc = "💍 원목 소품 및 천연 가죽 밴드";
          recommendAccDesc = "금속 시계보다는 갈색 가죽 스트랩 시계나 원목 비즈 액세서리를 활용하십시오. 내면의 목 기운을 부드럽게 활성화하여 대인관계의 매끄러운 화합을 유도하고 스트레스를 상쇄하는 든든한 방어막이 됩니다.";
          colorPalette = [
            { name: "카키 그린", hex: "#5F7A68", text: "신년 추진력 충전" },
            { name: "내추럴 베이지", hex: "#E6DFD3", text: "안정성 대지 조화" },
            { name: "포레스트 그린", hex: "#1D3B2B", text: "목(木) 생기 충만" },
            { name: "차콜 그레이", hex: "#4A4A4A", text: "금(金) 결단 보강" }
          ];
        } else if (dayStemEl === "화") {
          recommendLook = "👔 세련된 블랙 / 차콜 모노톤 코디";
          recommendLookDesc = "병오년의 타오르는 불 기운 속에 휩쓸리지 않도록 붉은색 의상은 완전 배제하십시오. 이성적인 지혜와 수렴을 상징하는 깊은 블랙, 다크 네이비 위주의 모노톤을 매칭하여 신중함과 품위를 연출하십시오.";
          recommendAcc = "💍 실버 체인 또는 심플 메탈 안경테";
          recommendAccDesc = "스틸/실버 주얼리나 깔끔한 실버 안경테를 활용하여 넘치는 화기를 차갑게 억제하는 금(金) 기운을 튜닝하십시오. 구설을 전면 차단하고 대인관계의 격을 높여줍니다.";
          colorPalette = [
            { name: "미드나잇 블랙", hex: "#1A1A1A", text: "불필요한 화기 수렴" },
            { name: "딥 네이비", hex: "#1B2F4A", text: "수(水) 이성 조율" },
            { name: "실버 그레이", hex: "#C0C0C0", text: "금(金) 구설 방어" },
            { name: "아이보리 화이트", hex: "#FDFDFD", text: "정갈한 신용 획득" }
          ];
        } else if (dayStemEl === "토") {
          recommendLook = "👔 웜톤 베이지 & 카멜 레이어드 룩";
          recommendLookDesc = "안정감과 신뢰를 풍기는 옐로우 푸드 계열의 브라운, 베이지, 크림 톤 의상을 조화롭게 코디하십시오. 귀하의 듬직한 중용과 포용의 아우라를 크게 상승시킵니다.";
          recommendAcc = "💍 천연 원석 펜던트 & 가죽 주얼리";
          recommendAccDesc = "천연 마노나 호안석 등 황토색 원석 펜던트, 혹은 브라운 가죽 소품을 장착하여 사주 대지의 튼튼함을 강화하십시오. 계약 협상이나 중요한 도장 날인 시 운의 안정감을 부여합니다.";
          colorPalette = [
            { name: "샌드 옐로우", hex: "#D6B880", text: "신용 & 포용 에너지" },
            { name: "카멜 브라운", hex: "#A3845B", text: "토(土) 중용 안착" },
            { name: "다크 올리브", hex: "#3B4A3F", text: "목(木) 생기 조율" },
            { name: "오프 화이트", hex: "#FAF8F5", text: "정갈한 문서 확보" }
          ];
        } else if (dayStemEl === "금") {
          recommendLook = "👔 모던 포멀 수트 & 화이트 코디";
          recommendLookDesc = "화이트, 실버, 밝은 그레이 톤의 정돈된 포멀 스타일을 추천합니다. 정돈되고 칼날 같은 예리한 바위의 깔끔함이 타인에게 극강의 공적 신뢰도와 카리스마를 각인시킵니다.";
          recommendAcc = "💍 스틸 메탈 시계 & 은반지";
          recommendAccDesc = "왼손 검지나 약지에 심플한 실버 링을 착용하거나 차가운 메탈 시계를 착용해 내면의 부서진 금(金) 기운을 충전하십시오. 불필요한 직장 내 시비와 액난을 차단하는 부적이 됩니다.";
          colorPalette = [
            { name: "아이시 화이트", hex: "#FFFFFF", text: "금(金) 예리한 결단" },
            { name: "스틸 실버", hex: "#E2E8F0", text: "액난 & 구설 차단" },
            { name: "어스 웜베이지", hex: "#D6C7B2", text: "토(土) 문서 후원" },
            { name: "모던 딥그레이", hex: "#64748B", text: "무게감 있는 신용" }
          ];
        } else {
          recommendLook = "👔 다크 블루 / 네이비 포멀 캐주얼";
          recommendLookDesc = "지해로움과 유연함을 풍기는 딥 네이비, 블루 계열의 의상을 믹스매치 하십시오. 화기를 제어하고 내면의 마인드 주관을 맑고 깨끗하게 지켜주는 수(水) 기맥을 흐르게 돕습니다.";
          recommendAcc = "💍 투명 크리스탈 또는 오닉스 액세서리";
          recommendAccDesc = "투명한 유리, 크리스탈 주얼리나 검은색 오닉스 팔찌를 착용하여 신장과 방광의 기류를 간접 보완하고 차분한 판단력을 최고조로 끌어올리십시오.";
          colorPalette = [
            { name: "인디고 네이비", hex: "#0F172A", text: "수(水) 깊은 지혜" },
            { name: "스카이 블루", hex: "#38BDF8", text: "유연한 대화 흐름" },
            { name: "밀크 화이트", hex: "#F8FAFC", text: "금생수 기운 충원" },
            { name: "헤이즐넛 브라운", hex: "#78350F", text: "안정형 재무 수성" }
          ];
        }

        return wrapLock(
          <div className="space-y-6 py-4">
            <div className="text-center space-y-2 mb-8">
              <span className="text-xs text-[#A3845B] font-bold block">패션 스타일링 (吉慶 衣裝)</span>
              <h2 className="font-myeongjo text-2xl font-bold text-[#1A1A1A]">나의 사주 기운을 보완하는 외적 연출법</h2>
              <div className="w-16 h-0.5 bg-[#A3845B]/30 mx-auto my-1" />
            </div>
            <div className="bg-white border border-[#E2DDD5] rounded-lg p-6 space-y-5 shadow-sm text-xs leading-relaxed font-light text-gray-700 font-traditional">
              <p className="text-justify font-light text-gray-600">
                옷차림과 컬러 배치는 가장 손쉽고 즉각적으로 내 주변의 개운 에너지를 자극하는 행동 풍수 실천법입니다. 귀하의 사주 오행 맞춤형 럭키 코디 제안입니다. 2026년 병오년의 기운을 다듬어 대인관계와 계약에서 극강의 신뢰감을 연출할 외적 패션을 연출하십시오.
              </p>

              {/* 시각화: 럭키 컬러 칩 팔레트 */}
              <div className="bg-[#FAF8F5] border border-[#E2DDD5]/60 rounded-xl p-5 space-y-4">
                <span className="font-bold text-xs text-[#8A6F4C] block text-center">🎨 {dayStemEl}일간 맞춤형 럭키 컬러 팔레트</span>
                <div className="grid grid-cols-4 gap-3 max-w-md mx-auto">
                  {colorPalette.map((col, idx) => (
                    <div key={idx} className="flex flex-col items-center space-y-1.5 p-2 bg-white rounded-lg border border-[#E2DDD5]/40 shadow-sm">
                      <div className="w-10 h-10 rounded-full border border-gray-300 shadow-inner" style={{ backgroundColor: col.hex }} />
                      <span className="font-bold text-[8.5px] text-gray-800">{col.name}</span>
                      <span className="text-[7.5px] text-gray-400 font-light text-center leading-none">{col.text}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 스타일 팁 카드 */}
              <div className="space-y-3">
                <div className="bg-[#FAF7F0] border border-[#E2DDD5]/60 p-4 rounded-xl shadow-sm text-justify">
                  <span className="font-bold text-[#5F7A68] text-[11px] block mb-1">{recommendLook}</span>
                  <p className="text-[10px] text-gray-500 font-light leading-relaxed">
                    {recommendLookDesc}
                  </p>
                </div>
                <div className="bg-[#FAF7F0] border border-[#E2DDD5]/60 p-4 rounded-xl shadow-sm text-justify">
                  <span className="font-bold text-[#A3845B] text-[11px] block mb-1">{recommendAcc}</span>
                  <p className="text-[10px] text-gray-500 font-light leading-relaxed">
                    {recommendAccDesc}
                  </p>
                </div>
              </div>
            </div>
          </div>,
          "신년 패션 메이크업 스타일링 가이드"
        );
      }`;

// 3. renderNewYearPageContent.js 의 switch(page.type) 문 첫 부분에 두 케이스 주입
const targetMarker = 'case "ny_wealth_portfolio":';
const replacement = caseRoadmap2030 + '\\n\\n' + caseLuckyFashion + '\\n\\n      case "ny_wealth_portfolio":';

if (content.includes(targetMarker)) {
  content = content.replace(targetMarker, replacement);
  console.log("Successfully injected roadmap and fashion cases!");
} else {
  console.error("Could not find case ny_wealth_portfolio target!");
  process.exit(1);
}

fs.writeFileSync(filePath, content, 'utf8');
console.log("=== Integration of dynamic cases completed! ===");
