const fs = require('fs');
const path = require('path');

const targetPath = path.join(__dirname, '../src/app/result/components/renderNewYearPageContent.js');
let content = fs.readFileSync(targetPath, 'utf8');

// 1. Define the code for case "ny_season_autumn":
const autumnSeasonCode = `      case "ny_season_autumn": {
        const metalCountVal = sajuInfo.elements?.금 || 0;
        const earthCountVal = sajuInfo.elements?.토 || 0;
        const fireCountVal = sajuInfo.elements?.화 || 0;
        
        const autumnHarvest = Math.min(95, Math.max(50, 60 + metalCountVal * 10));
        const autumnDocument = Math.min(95, Math.max(50, 55 + earthCountVal * 8 + metalCountVal * 5));
        const autumnInvestment = Math.min(95, Math.max(40, 50 + earthCountVal * 10));
        const autumnControl = Math.min(95, Math.max(30, 90 - fireCountVal * 10 + metalCountVal * 5));
        
        return wrapLock(
          <div className="space-y-6 py-4">
            <div className="text-center space-y-2 mb-8">
              <span className="text-xs text-[#A3845B] font-bold block">가을철 기류 전략 (음력 7~9월)</span>
              <h2 className="font-myeongjo text-2xl font-bold text-[#1A1A1A]">결실의 수확, 팽창을 멈추고 현금화하는 황금기</h2>
              <div className="w-16 h-0.5 bg-[#A3845B]/30 mx-auto my-1" />
            </div>
            <div className="bg-white border border-[#E2DDD5] rounded-lg p-6 space-y-5 shadow-sm text-xs leading-relaxed font-light text-gray-700 font-traditional">
              <p className="text-justify font-light text-gray-600">
                가을철(음력 7월~9월)은 신유술(申酉戌) 금(金)의 기운이 지배하여 만물의 성장을 매듭짓고 단단한 결실을 영그는 수축의 시기입니다. 그동안 벌려놓았던 일들이 매끄러운 계약이나 성과로 나타나는 최고의 골든타임입니다. 새로운 투자보다는 수확한 결과를 안전자산으로 지키는 지혜가 빛을 발하게 될 것입니다.
              </p>
              
              {/* 시각화: 가을철 기류 지수 */}
              <div className="bg-[#FAF7F0] border border-[#E2DDD5] rounded-xl p-4 space-y-3">
                <span className="font-bold text-xs text-[#8A6F4C] block">📊 가을철 기류 전략 지표</span>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <div className="flex justify-between text-[9px] font-semibold text-[#8A6F4C]">
                      <span>수확 및 결실 완성도</span>
                      <span className="text-[#8A6F4C]">{autumnHarvest}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-[#A3845B] rounded-full" style={{ width: \`\${autumnHarvest}%\` }} />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-[9px] font-semibold text-[#8A6F4C]">
                      <span>문서 및 계약 성취도</span>
                      <span className="text-[#8A6F4C]">{autumnDocument}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-[#A3845B] rounded-full" style={{ width: \`\${autumnDocument}%\` }} />
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 pt-1">
                  <div className="space-y-1">
                    <div className="flex justify-between text-[9px] font-semibold text-gray-500">
                      <span>안정적 투자 지향성</span>
                      <span className="text-[#A3845B]">{autumnInvestment}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-[#8A6F4C] rounded-full" style={{ width: \`\${autumnInvestment}%\` }} />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-[9px] font-semibold text-gray-500">
                      <span>과열 기류 제어도</span>
                      <span className="text-[#A3845B]">{autumnControl}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-[#8A6F4C] rounded-full" style={{ width: \`\${autumnControl}%\` }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* 실천 가이드 */}
              <div className="border border-[#E2DDD5] rounded-xl p-4 bg-[#FAF7F0]/30 text-justify space-y-2">
                <span className="font-bold text-xs text-[#8A6F4C] block">🧭 가을철 3대 실천 가이드</span>
                <ul className="space-y-1.5 text-[10px] text-gray-600 font-light">
                  <li>• <strong>음력 7월 (임신월):</strong> 봄과 여름철 벌여온 업무나 프로젝트의 중간 성과를 철저히 검토하고, 문서상의 법적/절차적 미비점을 수정 및 보강하십시오.</li>
                  <li>• <strong>음력 8월 (계유월):</strong> 명리학적 금(金) 기운의 조력으로 귀인이 돕는 시기입니다. 이직, 연봉 협상, 중대 계약 진행 시 적극적으로 권리를 주장하십시오.</li>
                  <li>• <strong>음력 9월 (갑술월):</strong> 수확한 재물이나 성과를 성급하게 재투자하지 마십시오. 이익을 확실하게 현금화하고 겨울의 동결기를 준비하는 자산 수렴 단계입니다.</li>
                </ul>
              </div>
            </div>
          </div>,
          "가을철 계절적 세부 기운과 전략"
        );
      }

`;

// 2. Define the code for case "ny_season_winter":
const winterSeasonCode = `      case "ny_season_winter": {
        const waterCountVal = sajuInfo.elements?.수 || 0;
        const earthCountVal = sajuInfo.elements?.토 || 0;
        const fireCountVal = sajuInfo.elements?.화 || 0;
        const metalCountVal = sajuInfo.elements?.금 || 0;
        
        const winterStability = Math.min(95, Math.max(40, 60 + waterCountVal * 8 + earthCountVal * 5));
        const winterRecharge = Math.min(95, Math.max(50, 55 + waterCountVal * 10 + metalCountVal * 5));
        const winterRisk = Math.min(90, Math.max(10, 15 + fireCountVal * 10 - waterCountVal * 5));
        const winterLanding = Math.min(95, Math.max(40, 50 + earthCountVal * 8 + waterCountVal * 6));
        
        return wrapLock(
          <div className="space-y-6 py-4">
            <div className="text-center space-y-2 mb-8">
              <span className="text-xs text-[#2A4B7C] font-bold block">겨울철 기류 전략 (음력 10~12월)</span>
              <h2 className="font-myeongjo text-2xl font-bold text-[#1A1A1A]">에너지의 수렴, 차분한 갈무리와 내일의 준비</h2>
              <div className="w-16 h-0.5 bg-[#2A4B7C]/30 mx-auto my-1" />
            </div>
            <div className="bg-white border border-[#E2DDD5] rounded-lg p-6 space-y-5 shadow-sm text-xs leading-relaxed font-light text-gray-700 font-traditional">
              <p className="text-justify font-light text-gray-600">
                겨울철(음력 10월~12월)은 해자축(亥子丑) 수(水)의 기운이 도래하여 병오년의 뜨거운 잔열을 잠재우고 내실을 다지는 수렴과 응축의 시기입니다. 외부적인 활동과 무리한 투자는 가급적 멈추고, 자산을 갈무리하며 체력과 정신을 보존해야 하는 정밀한 리밸런싱 타임입니다.
              </p>

              {/* 시각화: 겨울철 기류 지수 */}
              <div className="bg-[#FAFBFD] border border-blue-100 rounded-xl p-4 space-y-3">
                <span className="font-bold text-xs text-[#2A4B7C] block">📊 겨울철 기류 안녕 지표</span>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <div className="flex justify-between text-[9px] font-semibold text-[#2A4B7C]">
                      <span>자금 및 자산 안정도</span>
                      <span className="text-[#2A4B7C]">{winterStability}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-blue-50 rounded-full overflow-hidden">
                      <div className="h-full bg-[#2A4B7C] rounded-full" style={{ width: \`\${winterStability}%\` }} />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-[9px] font-semibold text-[#2A4B7C]">
                      <span>정신적·육체적 재충전 효율</span>
                      <span className="text-[#2A4B7C]">{winterRecharge}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-blue-50 rounded-full overflow-hidden">
                      <div className="h-full bg-[#2A4B7C] rounded-full" style={{ width: \`\${winterRecharge}%\` }} />
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 pt-1">
                  <div className="space-y-1">
                    <div className="flex justify-between text-[9px] font-semibold text-red-500">
                      <span>무리한 투자 위험 노출도</span>
                      <span className="text-red-700">{winterRisk}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-red-50 rounded-full overflow-hidden">
                      <div className="h-full bg-red-400 rounded-full" style={{ width: \`\${winterRisk}%\` }} />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-[9px] font-semibold text-gray-500">
                      <span>차기 대운 기류 안착률</span>
                      <span className="text-gray-700">{winterLanding}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-gray-500 rounded-full" style={{ width: \`\${winterLanding}%\` }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* 실천 가이드 */}
              <div className="border border-blue-100 rounded-xl p-4 bg-[#FAFBFD]/50 text-justify space-y-2">
                <span className="font-bold text-xs text-[#2A4B7C] block">🧭 겨울철 3대 생존 가이드</span>
                <ul className="space-y-1.5 text-[10px] text-gray-650 font-light">
                  <li>• <strong>음력 10월 (을해월):</strong> 자산 수성에 만전을 기할 시기입니다. 겉보기만 그럴싸한 지인의 동업 제안이나 신규 투자를 단호히 거절하십시오.</li>
                  <li>• <strong>음력 11월 (병자월):</strong> 자오충(子午沖)의 수화 마찰 기류가 강해집니다. 주거지 이전이나 급작스러운 계약은 피하고, 심장과 신장 건강을 회복하십시오.</li>
                  <li>• <strong>음력 12월 (정축월):</strong> 2026년의 전체적인 성과와 자산을 안전하게 정산하고, 2027년 정미년(丁未年)의 새로운 세운 로드맵을 기획하기 좋은 갈무리 적기입니다.</li>
                </ul>
              </div>
            </div>
          </div>,
          "겨울철 계절적 세부 기운과 전략"
        );
      }

`;

// 3. Inject case "ny_season_autumn" & "ny_season_winter" before "ny_monthly"
if (content.includes('case "ny_monthly":')) {
  if (!content.includes('case "ny_season_autumn":') && !content.includes('case "ny_season_winter":')) {
    const combinedCode = autumnSeasonCode + winterSeasonCode + '      case "ny_monthly":';
    content = content.replace('case "ny_monthly":', combinedCode);
    console.log("Successfully injected case ny_season_autumn and case ny_season_winter.");
  } else {
    console.log("ny_season_autumn or ny_season_winter is already present.");
  }
} else {
  console.log("Error: ny_monthly is missing in the file.");
}

fs.writeFileSync(targetPath, content, 'utf8');
console.log("Script execution finished successfully.");
