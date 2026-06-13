const fs = require('fs');
const path = require('path');

const targetPath = path.join(__dirname, '../src/app/result/components/renderNewYearPageContent.js');
let content = fs.readFileSync(targetPath, 'utf8');

// 1. Define the code for case "ny_mind_meditation":
const mindMeditationCode = `      case "ny_mind_meditation": {
        const fireCountVal = sajuInfo.elements?.화 || 0;
        const mindCalmRate = Math.min(99, Math.max(70, 95 - fireCountVal * 5));
        return wrapLock(
          <div className="space-y-6 py-4">
            <div className="text-center space-y-2 mb-8">
              <span className="text-xs text-[#A3845B] font-bold block">정신 수양 보감 (精神 修養 寶鑑)</span>
              <h2 className="font-myeongjo text-2xl font-bold text-[#1A1A1A]">조급함을 다스리는 마음가짐</h2>
              <div className="w-16 h-0.5 bg-[#A3845B]/30 mx-auto my-1" />
            </div>
            <div className="bg-white border border-[#E2DDD5] rounded-lg p-6 space-y-6 shadow-sm text-xs leading-relaxed font-light text-gray-700 font-traditional">
              <p className="text-justify font-light text-gray-600">
                2026년 병오년(丙午年)의 거대한 불꽃 기운은 우리 내면에서 깊은 조급함과 불만족, 충동적인 감정 과열을 쉽게 자극합니다. 스트레스를 방치하면 그간 이룩한 평판과 중요한 인간관계를 순식간에 불태워 버릴 수 있으므로 혜안의 감정 쿨다운 요법이 절대적으로 요구됩니다.
              </p>
              
              {/* 명상 명리 가이드 카드 */}
              <div className="bg-[#FAF7F0] p-5 rounded-xl border border-[#E2DDD5]/60 space-y-4 shadow-inner">
                <div className="flex justify-between items-center border-b border-[#E2DDD5]/40 pb-2">
                  <span className="font-bold text-[#8B221E] flex items-center gap-1.5">🧘 3분 냉각 호흡 명상법</span>
                  <span className="text-[9px] bg-red-100 text-red-700 px-2 py-0.5 rounded font-bold">감정 과열 {mindCalmRate}% 진정</span>
                </div>
                
                {/* 시각화: 3단계 프로세스 */}
                <div className="grid grid-cols-3 gap-2 text-center text-[10px] font-light">
                  <div className="bg-white p-3 rounded-lg border border-[#E2DDD5]/40 space-y-1">
                    <span className="font-bold text-[#A3845B] block">1단계: 이완</span>
                    <p className="text-[9px] text-gray-500 leading-normal">스마트폰을 끄고 편안히 척추를 세워 앉기</p>
                  </div>
                  <div className="bg-white p-3 rounded-lg border border-[#E2DDD5]/40 space-y-1">
                    <span className="font-bold text-[#A3845B] block">2단계: 수용</span>
                    <p className="text-[9px] text-gray-500 leading-normal">코로 시원한 공기를 가만히 마시기</p>
                  </div>
                  <div className="bg-white p-3 rounded-lg border border-[#E2DDD5]/40 space-y-1">
                    <span className="font-bold text-[#A3845B] block">3단계: 정화</span>
                    <p className="text-[9px] text-gray-500 leading-normal">타오르는 불꽃이 식는 호수 시각화</p>
                  </div>
                </div>
                
                <p className="text-[10px] text-gray-600 font-light text-justify pt-1 border-t border-[#E2DDD5]/30">
                  매일 분노가 머리끝까지 솟구치거나 불안감이 들 때, 의식적으로 10초간 호흡을 멈춘 뒤 차가운 물 한 모금을 마시고 이 세 가지 이완 요법을 차분히 따라 하십시오. 날뛰는 교감신경을 정돈하고 맑은 수기를 회복해 줍니다.
                </p>
              </div>
            </div>
          </div>,
          "스트레스 조율 및 정신 건강 명상 처방"
        );
      }

`;

// 2. Define the code for case "ny_season_spring":
const springSeasonCode = `      case "ny_season_spring": {
        const woodCountVal = sajuInfo.elements?.목 || 0;
        const earthCountVal = sajuInfo.elements?.토 || 0;
        const fireCountVal = sajuInfo.elements?.화 || 0;
        
        const springInnerScore = Math.min(95, Math.max(50, 65 + woodCountVal * 8 + earthCountVal * 4));
        const springOuterScore = Math.min(90, Math.max(30, 40 + fireCountVal * 10));
        
        return wrapLock(
          <div className="space-y-6 py-4">
            <div className="text-center space-y-2 mb-8">
              <span className="text-xs text-[#A3845B] font-bold block">봄철 기류 전략 (음력 1~3월)</span>
              <h2 className="font-myeongjo text-2xl font-bold text-[#1A1A1A]">동트기 전, 차분하게 기초 설계를 다듬는 기간</h2>
              <div className="w-16 h-0.5 bg-[#A3845B]/30 mx-auto my-1" />
            </div>
            <div className="bg-white border border-[#E2DDD5] rounded-lg p-6 space-y-5 shadow-sm text-xs leading-relaxed font-light text-gray-700 font-traditional">
              <p className="text-justify font-light text-gray-600">
                봄철(음력 1월~3월)은 나무(木)의 새싹 기운이 솟구치며 병오년의 불씨를 지피기 위해 땔감을 모으는 시기입니다. 섣불리 밖으로 에너지를 과하게 발산하여 대규모 투자를 단행하거나 성급한 이직 계약을 맺는 것은 운의 저항을 불러옵니다.
              </p>
              
              {/* 시각화: 봄철 기류 지수 */}
              <div className="bg-[#FCF9F5] border border-[#E2DDD5]/60 rounded-xl p-4 space-y-3">
                <span className="font-bold text-xs text-[#A3845B] block">📊 봄철 기류 전략 지표</span>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <div className="flex justify-between text-[9px] font-semibold text-gray-500">
                      <span>내적 내실/기획 안정도</span>
                      <span className="text-[#A3845B]">{springInnerScore}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-[#A3845B] rounded-full" style={{ width: \`\${springInnerScore}%\` }} />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-[9px] font-semibold text-gray-500">
                      <span>외적 확장/모험 지표</span>
                      <span className="text-gray-400">{springOuterScore}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-gray-400 rounded-full" style={{ width: \`\${springOuterScore}%\` }} />
                    </div>
                  </div>
                </div>
              </div>

              <div className="border border-[#E2DDD5]/70 rounded-xl p-4 bg-[#FAF8F5] text-justify space-y-2">
                <span className="font-bold text-xs text-[#1A1A1A] block">🧭 봄철 3대 핵심 실천 가이드</span>
                <ul className="space-y-1.5 text-[10px] text-gray-500 font-light">
                  <li>• <strong>1월 (경인월):</strong> 신규 비즈니스의 세부 기획 수립 및 자료 조사 매진</li>
                  <li>• <strong>2월 (신묘월):</strong> 무리한 창업 충동을 억제하고 사소한 말실수 조절 철저</li>
                  <li>• <strong>3월 (임진월):</strong> 귀인의 협력을 받아 문서 및 행정 서류 문제를 해결할 기회 활용</li>
                </ul>
              </div>
            </div>
          </div>,
          "봄철 계절적 세부 기운과 전략"
        );
      }

`;

// 3. Inject case "ny_mind_meditation" before "ny_lucky_secrets"
if (content.includes('case "ny_lucky_secrets":') && !content.includes('case "ny_mind_meditation":')) {
  content = content.replace('case "ny_lucky_secrets":', mindMeditationCode + '      case "ny_lucky_secrets":');
  console.log("Successfully injected case ny_mind_meditation.");
} else {
  console.log("ny_mind_meditation is already present or ny_lucky_secrets is missing.");
}

// 4. Inject case "ny_season_spring" before "ny_monthly"
if (content.includes('case "ny_monthly":') && !content.includes('case "ny_season_spring":')) {
  content = content.replace('case "ny_monthly":', springSeasonCode + '      case "ny_monthly":');
  console.log("Successfully injected case ny_season_spring.");
} else {
  console.log("ny_season_spring is already present or ny_monthly is missing.");
}

// 5. Fix ${name} template literal typo inside case "ny_lucky_secrets":
// In renderNewYearPageContent.js:
// "의뢰인 ${name}님의 기운을 온전히 수호하고"
const oldTypoText = '의뢰인 ${name}님의 기운을 온전히 수호하고';
const fixedText = '의뢰인 {name}님의 기운을 온전히 수호하고';
if (content.includes(oldTypoText)) {
  content = content.replace(oldTypoText, fixedText);
  console.log("Successfully fixed ${name} typo in ny_lucky_secrets.");
} else {
  console.log("Could not find the ${name} typo or already fixed.");
}

fs.writeFileSync(targetPath, content, 'utf8');
console.log("Script execution finished successfully.");
