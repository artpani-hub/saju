const fs = require('fs');
const path = require('path');

const filePath = path.join('d:', '인터그리비티', 'saju', 'src', 'app', 'result', 'components', 'renderNewYearPageContent.js');
let content = fs.readFileSync(filePath, 'utf8');

// 1. ny_wealth_portfolio 복구
const caseWealth = `      case "ny_wealth_portfolio": {
        const woodCount = sajuInfo?.elements?.목 || 0;
        const fireCount = sajuInfo?.elements?.화 || 0;
        const earthCount = sajuInfo?.elements?.토 || 0;
        const metalCount = sajuInfo?.elements?.금 || 0;
        const waterCount = sajuInfo?.elements?.수 || 0;

        let safeRatio = 60;
        let incomeRatio = 30;
        let growthRatio = 10;
        let portfolioAnalysis = "";

        if (waterCount <= 1) {
          safeRatio = 70; incomeRatio = 20; growthRatio = 10;
          portfolioAnalysis = name + "님의 사주에는 흘러가는 유연성과 자산 수성을 상징하는 수(水) 기운이 부족(" + waterCount + "개)합니다. 따라서 2026년에는 무리하게 투자금을 넓히기보다는 원금을 굳건히 지키는 안전성 보존 자산(예적금)을 70% 수준으로 크게 상향하는 자산 수성 전략이 최우선입니다.";
        } else if (woodCount <= 1) {
          safeRatio = 50; incomeRatio = 30; growthRatio = 20;
          portfolioAnalysis = name + "님의 사주는 기획력과 결단을 상징하는 목(木) 기운이 약한 편(" + woodCount + "개)입니다. 지나치게 보수적인 성향으로 인플레이션을 방어하지 못할 위험이 있으니, 글로벌 지수 추종 ETF나 대형 우량 가치주 비중을 20%까지 늘려 성장의 끈을 놓지 않는 것이 중요합니다.";
        } else if (fireCount >= 3) {
          safeRatio = 65; incomeRatio = 25; growthRatio = 10;
          portfolioAnalysis = name + "님의 사주에는 화(火) 기운이 과다(" + fireCount + "개)하여 일시적인 감정이나 충동에 따른 투기성 자산 배분 위험이 도사리고 있습니다. 안전자산 비중을 65%로 가져가며, 월배당 채권이나 리츠를 25% 확보해 원천적으로 현금이 묶이도록 통제하는 방어막을 구축하십시오.";
        } else {
          safeRatio = 60; incomeRatio = 30; growthRatio = 10;
          portfolioAnalysis = name + "님의 오행 밸런스를 고려한 자산 방어형 전략입니다. 2026년 병오년 세운의 열기가 사주 전체를 자극하는 시기이므로, 안전자산 60%를 기본 뼈대로 잡고 배당 채권 30%, 우량 성장 가치주 10%로 유연한 현금 흐름을 창출하는 정석 자산 배분을 추천합니다.";
        }

        return wrapLock(
          <div className="space-y-6 py-4">
            <div className="text-center space-y-2 mb-8">
              <span className="text-xs text-[#8A6F4C] font-bold block">재무 포트폴리오 (財務 指針)</span>
              <h2 className="font-myeongjo text-2xl font-bold text-[#1A1A1A]">오행 성향 맞춤형 신년 재테크 조언</h2>
              <div className="w-16 h-0.5 bg-[#A3845B]/30 mx-auto my-1" />
            </div>
            <div className="bg-white border border-[#E2DDD5] rounded-lg p-6 space-y-5 shadow-sm text-xs leading-relaxed font-light text-gray-700 font-traditional">
              <p className="text-justify font-light text-gray-600">
                {portfolioAnalysis}
              </p>

              {/* 시각화: 자산 포트폴리오 비중 */}
              <div className="bg-[#FAF7F0] border border-[#E2DDD5] rounded-xl p-4 space-y-3">
                <span className="font-bold text-xs text-[#8A6F4C] block">📊 제안 자산 구성 비율</span>
                <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden flex text-[8px] font-bold text-white text-center leading-4">
                  <div className="bg-[#8A6F4C]" style={{ width: safeRatio + "%" }}>안전자산 {safeRatio}%</div>
                  <div className="bg-[#A3845B]" style={{ width: incomeRatio + "%" }}>배당/채권 {incomeRatio}%</div>
                  <div className="bg-[#5F7A68]" style={{ width: growthRatio + "%" }}>우량가치주 {growthRatio}%</div>
                </div>
                <p className="text-[9px] text-gray-400 font-light leading-snug">
                  * 무리한 성장주 레버리지 투자는 70% 이상의 손실 확률을 가지므로 금지하며, 원금 보장형 예적금이나 미국 단기 채권 ETF에 {safeRatio}% 이상 집중하십시오.
                </p>
              </div>

              {/* 오행 맞춤형 3대 투자 원칙 카드 */}
              <div className="grid grid-cols-3 gap-3 pt-2">
                <div className="bg-[#FAF7F0] border border-[#E2DDD5]/60 p-3.5 rounded-xl text-center shadow-inner">
                  <span className="text-xl block mb-1">🌊</span>
                  <span className="font-bold text-[#8A6F4C] text-[10px] block">수(水) 기운: 수성</span>
                  <p className="text-[8px] text-gray-400 font-light mt-1 leading-snug">예적금과 금 실물에 {safeRatio}%를 배분하여 원금을 굳건히 지킴</p>
                </div>
                <div className="bg-[#FAF7F0] border border-[#E2DDD5]/60 p-3.5 rounded-xl text-center shadow-inner">
                  <span className="text-xl block mb-1">🪙</span>
                  <span className="font-bold text-[#8A6F4C] text-[10px] block">금(金) 기운: 흐름</span>
                  <p className="text-[8px] text-gray-400 font-light mt-1 leading-snug">미국 단기 채권 및 월배당 리츠 {incomeRatio}%로 안정적 이자 획득</p>
                </div>
                <div className="bg-[#FAF7F0] border border-[#E2DDD5]/60 p-3.5 rounded-xl text-center shadow-inner">
                  <span className="text-xl block mb-1">🌲</span>
                  <span className="font-bold text-[#8A6F4C] text-[10px] block">목(木) 기운: 성장</span>
                  <p className="text-[8px] text-gray-400 font-light mt-1 leading-snug">글로벌 지수 ETF 및 대형 우량 가치주 {growthRatio}%로 방어적 투자</p>
                </div>
              </div>

              {/* 포트폴리오 자산 배분 조견표 */}
              <div className="border border-[#E2DDD5] rounded-xl overflow-hidden shadow-sm pt-2">
                <table className="w-full text-[9px] text-left border-collapse">
                  <thead>
                    <tr className="bg-[#FAF7F0] text-[#8A6F4C] font-bold border-b border-[#E2DDD5]">
                      <th className="p-2">자산 분류</th>
                      <th className="p-2 text-center">추천 오행</th>
                      <th className="p-2 text-center">권장 비중</th>
                      <th className="p-2">투자 실행 가이드</th>
                    </tr>
                  </thead>
                  <tbody className="text-gray-600 font-light">
                    <tr className="border-b border-[#E2DDD5]/40">
                      <td className="p-2 font-semibold text-gray-800">🔒 안전성 보존 자산</td>
                      <td className="p-2 text-center">수(水) / 토(土)</td>
                      <td className="p-2 text-center font-bold text-[#8A6F4C]">{safeRatio}%</td>
                      <td className="p-2">고금리 정기 예적금, 금(Gold) 현물 수성</td>
                    </tr>
                    <tr className="border-b border-[#E2DDD5]/40">
                      <td className="p-2 font-semibold text-gray-800">💵 고정 배당 자산</td>
                      <td className="p-2 text-center">금(金)</td>
                      <td className="p-2 text-center font-bold text-[#8A6F4C]">{incomeRatio}%</td>
                      <td className="p-2">월배당 인컴형 리츠, 미국 하이일드/단기채 ETF</td>
                    </tr>
                    <tr>
                      <td className="p-2 font-semibold text-gray-800">📈 우량 가치 자산</td>
                      <td className="p-2 text-center">목(木)</td>
                      <td className="p-2 text-center font-bold text-[#8A6F4C]">{growthRatio}%</td>
                      <td className="p-2">글로벌 지수 추종 ETF, 초우량 빅테크 가치 분할매수</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>,
          "오행별 추천 투자 스타일 및 재무 가이드"
        );
      }`;

// 2. ny_career_detailed 복구
const caseCareer = `      case "ny_career_detailed": {
        const dayStemEl = sajuInfo?.day?.stemEl || "목";
        const woodCount = sajuInfo?.elements?.["목"] || 0;
        const fireCount = sajuInfo?.elements?.["화"] || 0;
        const earthCount = sajuInfo?.elements?.["토"] || 0;
        const metalCount = sajuInfo?.elements?.["금"] || 0;
        const waterCount = sajuInfo?.elements?.["수"] || 0;

        const jobChangeScore = Math.min(99, 70 + (metalCount + waterCount) * 4);
        const promotionScore = Math.min(95, 70 + (earthCount + metalCount) * 4);
        const frictionScore = Math.min(95, 50 + fireCount * 8);
        const professionalScore = Math.min(99, 80 + (earthCount + metalCount) * 2);

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
                2026년 병오년은 세운의 강렬한 화(화) 기운이 {name}님의 관성(관성: 직장 및 조직 명예)과 인성(인성: 문서 및 계약) 기류를 격렬하게 뒤흔드는 변화의 해입니다. 상반기의 성급한 판단이나 충동적인 사직은 자칫 독이 될 수 있으나, 가을철 금(금) 기운의 조력이 본격화되는 <strong>골든타임</strong>을 조율해 움직인다면 연봉 상승과 더불어 신분을 한 단계 업그레이드할 수 있는 절호의 기회입니다. 아래의 다차원 역량 기류 및 분기별 타임라인을 고려하여 체계적인 이직/승진 로드맵을 수립하십시오.
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
                      <div className="h-full bg-[#5F7A68] rounded-full" style={{ width: jobChangeScore + "%" }} />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-[9px] font-semibold text-[#5F7A68]">
                      <span>내부 승진 및 권위 획득율</span>
                      <span className="text-[#5F7A68]">{promotionScore}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-emerald-50 rounded-full overflow-hidden">
                      <div className="h-full bg-[#5F7A68] rounded-full" style={{ width: promotionScore + "%" }} />
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
                      <div className="h-full bg-red-400 rounded-full" style={{ width: frictionScore + "%" }} />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-[9px] font-semibold text-[#5F7A68]">
                      <span>업무 책임감 & 직무 전문성</span>
                      <span className="text-[#5F7A68]">{professionalScore}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-emerald-50 rounded-full overflow-hidden">
                      <div className="h-full bg-[#5F7A68] rounded-full" style={{ width: professionalScore + "%" }} />
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

// 3. ny_social_life 복구
const caseSocial = `      case "ny_social_life": {
        const dayStemEl = sajuInfo?.day?.stemEl || "목";
        const woodCount = sajuInfo?.elements?.["목"] || 0;
        const fireCount = sajuInfo?.elements?.["화"] || 0;
        const earthCount = sajuInfo?.elements?.["토"] || 0;
        const metalCount = sajuInfo?.elements?.["금"] || 0;
        const waterCount = sajuInfo?.elements?.["수"] || 0;

        const socialTrustScore = Math.min(95, 75 + earthCount * 4);
        const connectionFrequency = Math.min(95, 70 + (woodCount + waterCount) * 4);
        const relationshipFriction = Math.min(95, 40 + fireCount * 8);
        const communicationEfficiency = Math.min(95, 75 + (waterCount + metalCount) * 3);

        const affinityZodiacs = {
          "목": { lucky: "돼지띠, 토끼띠, 양띠", bad: "쥐띠", desc: "나를 수생목/목해합으로 생조 및 조력하는 기운으로 계약서 검토 및 신규 인프라 획득에 최고의 파트너입니다." },
          "화": { lucky: "개띠, 양띠, 호랑이띠", bad: "쥐띠 (자오충 충돌)", desc: "강한 불기를 설기시켜 이성을 찾아주고 동업적 제안 시 실익을 배가시켜주는 띠입니다." },
          "토": { lucky: "뱀띠, 말띠, 닭띠", bad: "토끼띠", desc: "화생토의 에너지 순환과 금의 결실로 나의 문서 자산을 수호하고 신용도를 올려주는 귀인입니다." },
          "금": { lucky: "닭띠, 뱀띠, 용띠", bad: "범띠", desc: "뜨거운 제련을 견디도록 금의 뿌리를 지탱해주고 신년 문서 계약 체결 시 도장을 보증할 든든한 조력자입니다." },
          "수": { lucky: "원숭이띠, 쥐띠, 돼지띠", bad: "말띠 (수화 상쟁)", desc: "금생수로 물줄기의 근원을 살리고 자금 유통과 투자 협업 시 등대와 같은 현실 조언을 건넵니다." }
        }[dayStemEl] || { lucky: "말띠, 양띠, 개띠", bad: "쥐띠", desc: "귀하의 명조 기류를 조율하고 일시적인 대인관계 갈등을 지탱해줄 최상의 궁합 띠입니다." };

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
                      <div className="h-full bg-[#5F7A68] rounded-full" style={{ width: socialTrustScore + "%" }} />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-[9px] font-semibold text-[#5F7A68]">
                      <span>귀인 상생 주파수 호응도</span>
                      <span className="text-[#5F7A68]">{connectionFrequency}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-emerald-50 rounded-full overflow-hidden">
                      <div className="h-full bg-[#5F7A68] rounded-full" style={{ width: connectionFrequency + "%" }} />
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
                      <div className="h-full bg-red-400 rounded-full" style={{ width: relationshipFriction + "%" }} />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-[9px] font-semibold text-[#5F7A68]">
                      <span>사회적 소통 및 네트워킹 효율</span>
                      <span className="text-[#5F7A68]">{communicationEfficiency}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-emerald-50 rounded-full overflow-hidden">
                      <div className="h-full bg-[#5F7A68] rounded-full" style={{ width: communicationEfficiency + "%" }} />
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
                  <li>• <strong>의견 대립 시 3초 묵언:</strong> 음력 5월 and 11월에 의견 대립이 시작되면 논리적 반박 대신 차가운 냉수를 한 잔 들이켜며 화기를 식히십시오.</li>
                </ul>
              </div>
            </div>
          </div>,
          "신년 인맥 관리 및 대인관계 조율"
        );
      }`;

// 4. ny_roadmap_2031 복구
const caseRoadmap = `      case "ny_roadmap_2031":
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
        );`;

// 5. ny_action_rules 복구
const caseActionRules = `      case "ny_action_rules": {
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
              { title: "🪵 천연 원목 소품", desc: "책상 위나 침대 근처에 자연 소재의 나무 소품이나식물을 배치해 기류를 보완하십시오." },
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
            <div className={presets.bg + " border " + presets.border + " rounded-2xl p-5 shadow-sm"}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full flex items-center justify-center shadow-sm" style={{ backgroundColor: presets.colorHex }}>
                  <span className="text-white font-bold text-sm">{dayStemEl}</span>
                </div>
                <div>
                  <span className={"font-bold text-sm " + presets.text}>{name}님의 일간 기운: <strong>{dayStemEl}(</strong>{dayStemEl === "목" ? "木" : dayStemEl === "화" ? "火" : dayStemEl === "토" ? "土" : dayStemEl === "금" ? "金" : "水"}<strong>) 기질 보완 처방</strong></span>
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
                      <div className={"h-full " + item.color + " rounded-full transition-all"} style={{ width: item.value + "%" }} />
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
      }`;

// 6. ny_diet_presc 복구
const caseDiet = `      case "ny_diet_presc": {
        const dayStemEl = sajuInfo.day.stemEl;
        let constitutionName = "오행 평형 체질";
        let constitutionDesc = "";
        let goodFoods = "";
        let badFoods = "";
        let teaName = "";
        let teaDesc = "";
        let organGraph = null;

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
                  <span className="text-[#8A6F4C]">80%</span>
                </div>
                <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-700 rounded-full" style={{ width: "80%" }} />
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-[9px] font-semibold text-[#8A6F4C]">
                  <span>위·장(土) 소화 효율</span>
                  <span className="text-[#8A6F4C]">75%</span>
                </div>
                <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-yellow-600 rounded-full" style={{ width: "75%" }} />
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
                  <span className="text-[#8A6F4C]">95%</span>
                </div>
                <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-red-700 rounded-full" style={{ width: "95%" }} />
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-[9px] font-semibold text-[#8A6F4C]">
                  <span>신·방광(水) 건조율</span>
                  <span className="text-[#8A6F4C]">90%</span>
                </div>
                <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-slate-800 rounded-full" style={{ width: "90%" }} />
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
                  <span className="text-[#8A6F4C]">85%</span>
                </div>
                <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-yellow-600 rounded-full" style={{ width: "85%" }} />
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-[9px] font-semibold text-[#8A6F4C]">
                  <span>간·담(木) 억제 지수</span>
                  <span className="text-[#8A6F4C]">70%</span>
                </div>
                <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-700 rounded-full" style={{ width: "70%" }} />
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
                  <span className="text-[#8A6F4C]">65%</span>
                </div>
                <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-zinc-400 rounded-full" style={{ width: "65%" }} />
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-[9px] font-semibold text-[#8A6F4C]">
                  <span>대장(金) 수분 유지력</span>
                  <span className="text-[#8A6F4C]">70%</span>
                </div>
                <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-zinc-500 rounded-full" style={{ width: "70%" }} />
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
                  <span className="text-[#8A6F4C]">60%</span>
                </div>
                <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-slate-900 rounded-full" style={{ width: "60%" }} />
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-[9px] font-semibold text-[#8A6F4C]">
                  <span>자궁·생식계 면역력</span>
                  <span className="text-[#8A6F4C]">68%</span>
                </div>
                <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-slate-700 rounded-full" style={{ width: "68%" }} />
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
                매일 입으로 들어가는 음식의 오행 성질은 오장육부의 열과 한기를 조율하는 기초 한의학적 개운 처방입니다. 귀하의 사주 일간 오행 성향을 분석한 결과, 아래와 같이 맞춤형 약선 섭생 처방이 제공됩니다.
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

              {/* 시각화 2: 오행 장부 강약 지표 (동적 구성) */}
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
      }`;

// 7. ny_final_blessing 복구
const caseBlessing = `      case "ny_final_blessing": {
        const dayStemEl = sajuInfo?.day?.stemEl || "목";
        let elementBlessing = "";

        if (dayStemEl === "목" || dayStemEl === "木") {
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
                  천지합화(天地合火)의 맹렬한 불꽃 기류가 {name}님의 인생 앞길을 밝히는 광명의 횃불이 되기를 간절히 기원합니다. 올해의 뜨거운 에너지는 귀하를 지치게 하는 액난을 모두 소멸시키고, 굳건한 금빛 성공의 토양으로 환원될 것입니다.
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

// 인입 및 결합
const markerIndex = content.indexOf('      case "ny_elements_balance":');
if (markerIndex === -1) {
  console.error("Marker case 'ny_elements_balance' not found.");
  process.exit(1);
}

const beforeContent = content.substring(0, markerIndex);
const afterContent = content.substring(markerIndex);

// replace marker for ny_final_blessing
const finalBlessingMarker = '            case "ny_final_blessing":';
const finalBlessingMarkerIdx = afterContent.indexOf(finalBlessingMarker);
if (finalBlessingMarkerIdx === -1) {
  console.error("Marker case 'ny_final_blessing' not found in afterContent.");
  process.exit(1);
}

const afterContentCleaned = afterContent.substring(0, finalBlessingMarkerIdx);

// 병합 생성
const updatedContent = beforeContent + 
                       caseWealth + "\n\n" + 
                       caseCareer + "\n\n" + 
                       caseSocial + "\n\n" + 
                       caseRoadmap + "\n\n" + 
                       afterContentCleaned + 
                       caseActionRules + "\n\n" + 
                       caseDiet + "\n\n" + 
                       caseBlessing + "\n\n" + 
                       "      default:\n        return null;\n    }\n  };\n";

fs.writeFileSync(filePath, updatedContent, 'utf8');
console.log("=== Successfully restored all 7 missing cases in renderNewYearPageContent.js ===");
