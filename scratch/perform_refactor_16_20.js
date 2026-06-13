const fs = require('fs');
const path = require('path');

const targetPath = path.join(__dirname, '../src/app/result/components/renderNewYearPageContent.js');
let content = fs.readFileSync(targetPath, 'utf8');

// 1. Define the code for case "ny_season_summer":
const summerSeasonCode = `      case "ny_season_summer": {
        const fireCountVal = sajuInfo.elements?.화 || 0;
        const waterCountVal = sajuInfo.elements?.수 || 0;
        
        const summerImpulsiveness = Math.min(99, Math.max(50, 60 + fireCountVal * 10));
        const summerStability = Math.min(95, Math.max(20, 90 - fireCountVal * 10 + waterCountVal * 5));
        
        return wrapLock(
          <div className="space-y-6 py-4">
            <div className="text-center space-y-2 mb-8">
              <span className="text-xs text-[#8B221E] font-bold block">여름철 기류 전략 (음력 4~6월)</span>
              <h2 className="font-myeongjo text-2xl font-bold text-[#1A1A1A]">최대의 고비, 과열된 가마솥을 피해야 할 시기</h2>
              <div className="w-16 h-0.5 bg-[#A3845B]/30 mx-auto my-1" />
            </div>
            <div className="bg-white border border-[#E2DDD5] rounded-lg p-6 space-y-5 shadow-sm text-xs leading-relaxed font-light text-gray-700 font-traditional">
              <p className="text-justify font-light text-gray-600">
                여름철(음력 4월~6월)은 병오년의 불기운이 절정에 달하여 대지가 펄펄 끓는 격동의 시기입니다. 자존심 대립이 극에 달해 상사와의 마찰이 우려되거나 홧김에 직장을 이탈하려는 흉조(午午 자형)가 강해집니다. 이 시기에는 철저한 수비가 최고의 전략입니다.
              </p>
              
              {/* 시각화: 여름철 기류 지수 */}
              <div className="bg-red-50/20 border border-red-100 rounded-xl p-4 space-y-3">
                <span className="font-bold text-xs text-red-900 block">📊 여름철 기류 위험 지표</span>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <div className="flex justify-between text-[9px] font-semibold text-red-700">
                      <span>감정 기복 & 충동 위험도</span>
                      <span className="text-red-700">{summerImpulsiveness}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-red-100 rounded-full overflow-hidden">
                      <div className="h-full bg-red-500 rounded-full" style={{ width: \`\${summerImpulsiveness}%\` }} />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-[9px] font-semibold text-gray-500">
                      <span>안정적 성정 조율도</span>
                      <span className="text-gray-400">{summerStability}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-gray-400 rounded-full" style={{ width: \`\${summerStability}%\` }} />
                    </div>
                  </div>
                </div>
              </div>

              <div className="border border-red-100 rounded-xl p-4 bg-[#FFFBFB]/50 text-justify space-y-2">
                <span className="font-bold text-xs text-red-950 block">🧭 여름철 3대 생존 가이드</span>
                <ul className="space-y-1.5 text-[10px] text-red-900 font-light">
                  <li>• <strong>4월 (계사월):</strong> 탈수 방지 및 심혈관계 만성 피로와 상열감 완화 집중</li>
                  <li>• <strong>5월 (갑오월):</strong> 사직서 제출, 뇌동 투자 절대 엄금. 중대 결정을 가을로 유보</li>
                  <li>• <strong>6월 (을미월):</strong> 뜬소문에 의한 투자 금지. 통장 현금 잔고 50% 이상 보수적 잠금</li>
                </ul>
              </div>
            </div>
          </div>,
          "여름철 계절적 세부 기운과 전략"
        );
      }

`;

// 2. Inject case "ny_season_summer" before "ny_monthly"
if (content.includes('case "ny_monthly":') && !content.includes('case "ny_season_summer":')) {
  content = content.replace('case "ny_monthly":', summerSeasonCode + '      case "ny_monthly":');
  console.log("Successfully injected case ny_season_summer.");
} else {
  console.log("ny_season_summer is already present or ny_monthly is missing.");
}

fs.writeFileSync(targetPath, content, 'utf8');
console.log("Script execution finished successfully.");
