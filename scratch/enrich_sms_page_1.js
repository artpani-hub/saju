const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'src', 'app', 'result', 'page.js');
let content = fs.readFileSync(filePath, 'utf8');

console.log("=== Running SMS PAGE 1 Enrichment ===");

// 랜드마크로 앞뒤 오프셋 찾기
const startKeyword = '{/* PAGE 1 */}';
const endKeyword = '{/* PAGE 2 */}';

const startIdx = content.indexOf(startKeyword);
const endIdx = content.indexOf(endKeyword);

if (startIdx === -1 || endIdx === -1) {
  console.error("Failed to find PAGE 1 or PAGE 2 landmarks!");
  process.exit(1);
}

console.log(`Found PAGE 1 at ${startIdx}, PAGE 2 at ${endIdx}`);

const newPage1Content = `{/* PAGE 1 */}
        <div className="print-page-wrapper relative min-h-[1100px] flex flex-col justify-between bg-[#FDFBF7] border border-[#E2DDD5] rounded-xl p-2 shadow-md print:border-none print:shadow-none print:p-0 print:m-0 print:min-h-screen">
          <div className="border border-[#E2DDD5]/60 rounded-lg p-6 h-full flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center border-b border-[#E2DDD5]/50 pb-2 mb-6 print:mb-8">
                <span className="text-[10px] font-bold text-[#A3845B] tracking-wider font-myeongjo">慧眼堂 寶鑑 · {reportTitle} 요약</span>
                <span className="text-[9px] text-gray-400 font-light font-traditional">1. 운세 기조 및 오행 분포</span>
              </div>

              <div className="space-y-6">
                <div className="text-center py-4 space-y-2">
                  <span className="text-xs text-[#A3845B] tracking-widest font-bold block font-myeongjo">— 2026 丙午年 —</span>
                  <h2 className="font-myeongjo text-3xl font-bold text-[#1A1A1A] tracking-wide">{name} 님 신년 운세 요약 보감</h2>
                  <div className="w-20 h-0.5 bg-[#A3845B]/40 mx-auto mt-1" />
                </div>

                {/* 2026 병오년 운세 기조 */}
                <div className="bg-white border border-[#E2DDD5] rounded-xl p-5 space-y-3 shadow-sm">
                  <span className="font-bold text-[#A3845B] text-xs block font-myeongjo">■ 1. 2026년 병오년 세운 기조</span>
                  <div className="text-xs text-[#5F5F5F] font-light leading-relaxed space-y-2">
                    <p><strong>• 세운 특징:</strong> <span className="font-semibold text-[#A3845B]">천지합화(天地合火)</span> - 하늘과 대지가 거대한 불꽃으로 화합하는 역동적 한 해입니다.</p>
                    <p><strong>• 오행 구성 상태:</strong> <span className="font-semibold text-gray-700">{elStats}</span></p>
                  </div>
                </div>

                {/* 기질 융합 해석 */}
                <div className="bg-white border border-[#E2DDD5] rounded-xl p-5 space-y-3 shadow-sm">
                  <span className="font-bold text-[#A3845B] text-xs block font-myeongjo">💡 일간(日干) 기질 융합 해석</span>
                  <p className="text-xs text-[#5F5F5F] font-light leading-relaxed bg-[#FAF7F0]/60 p-3 rounded border border-[#E2DDD5]/40 text-justify">
                    {yearInteractionText}
                  </p>
                </div>

                {/* 일간 오행 처방 키워드 및 행동 지침 */}
                {(() => {
                  const dayStemEl = sajuInfo?.day?.stemEl || "목";
                  const stemKeywords = {
                    "목": { keyword: "수기(水氣) 보존 · 감정 완화", color: "text-emerald-800 bg-emerald-50/50 border-emerald-100/80", tip: "뜨거운 불꽃 기류가 나무의 진액을 말리니, 충분한 수분 보충과 조용한 충전 시간을 가지는 것이 행운을 돕습니다." },
                    "화": { keyword: "자아 절제 · 차분한 유지", color: "text-red-800 bg-red-50/50 border-red-100/80", tip: "나와 같은 불 기운이 극도로 가중되니 충동적 거래나 동업 제안을 거절하고 이성을 사수하는 것이 급선무입니다." },
                    "토": { keyword: "문서 획득 · 학업 및 결실", color: "text-amber-800 bg-amber-50/50 border-amber-100/80", tip: "맹렬한 화기가 단단한 대지를 도우니 시험, 승진, 자격증 획득 등 문서상의 안정이 아주 높게 작용하는 황금기입니다." },
                    "금": { keyword: "규율 준수 · 스트레스 관리", color: "text-gray-800 bg-gray-50/50 border-gray-100/80", tip: "뜨거운 용광로의 제련 과정과 같습니다. 직장 및 대외 스트레스가 우려되나 이를 인내하면 값진 명예로 치환됩니다." },
                    "수": { keyword: "재물 포착 · 이성적 재무", color: "text-blue-800 bg-blue-50/50 border-blue-100/80", tip: "뜨거운 불을 조절하는 비가 내리는 격입니다. 일시적인 금전 기회가 크게 찾아오니 들뜨지 않고 침착하게 수확해야 합니다." }
                  }[dayStemEl] || { keyword: "오행 조화 · 중용 유지", color: "text-gray-800 bg-gray-50/50 border-gray-100/80", tip: "병오년의 활발한 불꽃 기류를 맞아 지나친 확장을 삼가고 내실을 굳건히 하는 자세가 최상의 방책입니다." };

                  return (
                    <div className={\`border rounded-xl p-5 space-y-2.5 \${stemKeywords.color} shadow-sm\`}>
                      <span className="font-bold text-xs block font-myeongjo">🎯 2026년 일간 맞춤 처방 키워드</span>
                      <div className="space-y-1.5 text-xs">
                        <p><strong>• 핵심 키워드:</strong> <span className="underline decoration-2 underline-offset-2 font-bold">{stemKeywords.keyword}</span></p>
                        <p className="leading-relaxed opacity-90"><strong>• 신년 지침:</strong> {stemKeywords.tip}</p>
                      </div>
                    </div>
                  );
                })()}

                {/* 오행 에너지 시각화 요약 */}
                <div className="bg-white border border-[#E2DDD5] rounded-xl p-5 space-y-4 shadow-sm">
                  <span className="font-bold text-[#A3845B] text-xs block font-myeongjo">📊 타고난 오행 밸런스 수치 & 하모니 휠</span>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                    {/* 오행 막대 그래프 */}
                    <div className="space-y-2">
                      {Object.entries(sajuInfo.elements).map(([el, count]) => (
                        <div key={el} className="bg-[#FAF8F5] p-2 rounded border border-[#E2DDD5]/40 flex items-center justify-between text-[10px]">
                          <span className="font-bold text-gray-700 w-12">{el} ({count}개)</span>
                          <div className="flex-1 bg-gray-200 h-1.5 rounded-full overflow-hidden mx-2">
                            <div className="h-full bg-[#A3845B] rounded-full" style={{ width: \`\${(count / 8) * 100}%\` }} />
                          </div>
                          <span className="text-gray-400 text-[9px] w-6 text-right">{Math.round((count / 8) * 100)}%</span>
                        </div>
                      ))}
                    </div>

                    {/* 오행 하모니 휠 SVG */}
                    <div className="flex justify-center items-center py-2 bg-[#FAF8F5]/50 border border-[#E2DDD5]/40 rounded-xl">
                      <svg viewBox="0 0 200 200" className="w-[140px] h-[140px]">
                        <defs>
                          <radialGradient id="auraGrad" cx="50%" cy="50%" r="50%">
                            <stop offset="0%" stopColor="#FFFDF9" />
                            <stop offset="70%" stopColor="#FAF6EE" />
                            <stop offset="100%" stopColor="#E2DDD5" />
                          </radialGradient>
                        </defs>
                        <circle cx="100" cy="100" r="80" fill="url(#auraGrad)" stroke="#E2DDD5" strokeWidth="1" />
                        <circle cx="100" cy="100" r="55" fill="none" stroke="#E2DDD5" strokeWidth="0.5" strokeDasharray="3,3" />
                        <polygon points="100,30 162,75 138,148 62,148 38,75" fill="none" stroke="#A3845B" strokeWidth="0.5" strokeOpacity="0.3" />
                        {(() => {
                          const angles = { "목": -90, "화": -18, "토": 54, "금": 126, "수": 198 };
                          const colors = {
                            "목": { fill: "#10B981", stroke: "#047857" },
                            "화": { fill: "#EF4444", stroke: "#B91C1C" },
                            "토": { fill: "#F59E0B", stroke: "#B45309" },
                            "금": { fill: "#9CA3AF", stroke: "#4B5563" },
                            "수": { fill: "#3B82F6", stroke: "#1D4ED8" }
                          };
                          
                          return Object.entries(sajuInfo.elements).map(([el, count]) => {
                            const angle = angles[el] || 0;
                            const rad = (angle * Math.PI) / 180;
                            const dist = 25 + (count / 8) * 45;
                            const cx = 100 + dist * Math.cos(rad);
                            const cy = 100 + dist * Math.sin(rad);
                            const labelDist = dist + 14;
                            const lx = 100 + labelDist * Math.cos(rad);
                            const ly = 100 + labelDist * Math.sin(rad);
                            
                            return (
                              <g key={el}>
                                <line x1="100" y1="100" x2={cx} y2={cy} stroke={colors[el]?.fill} strokeWidth="1" strokeDasharray="1,1" />
                                <circle cx={cx} cy={cy} r="5" fill={colors[el]?.fill} stroke={colors[el]?.stroke} strokeWidth="1" />
                                <circle cx={cx} cy={cy} r="2" fill="#FFFFFF" />
                                <text x={lx} y={ly + 3} textAnchor="middle" fontSize="8" fontWeight="bold" fill="#4B5563" className="font-sans">
                                  {el}
                                </text>
                              </g>
                            );
                          });
                        })()}
                        <circle cx="100" cy="100" r="7" fill="#A3845B" stroke="#FFFFFF" strokeWidth="1.5" />
                        <text x="100" y="102.5" textAnchor="middle" fontSize="7" fontWeight="bold" fill="#FFFFFF">命</text>
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 하단 푸터 및 공식 검증인 낙관 */}
            <div className="relative pt-6 border-t border-[#E2DDD5]/50 flex justify-between items-center text-[9px] text-[#5F5F5F] mt-6">
              <div className="space-y-0.5">
                <span className="font-myeongjo font-light block">慧眼堂 寶鑑 · 병오년 {typeParam === "tojeong" ? "토정비결" : "신수비결"} 요약</span>
                <span className="font-sans text-gray-400">Copyright © 慧眼堂 명리연구소 All Rights Reserved.</span>
              </div>
              <span className="font-myeongjo font-bold pr-12">1 / 2</span>
              
              {/* 혜안당 공식 낙관 */}
              <div className="absolute right-0 bottom-2 select-none">
                <svg viewBox="0 0 60 60" className="w-[36px] h-[36px] transform -rotate-12">
                  <rect x="5" y="5" width="50" height="50" rx="3" fill="none" stroke="#8B221E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="30 1 10 1" />
                  <text x="30" y="24" textAnchor="middle" fontSize="12" fontWeight="900" fill="#8B221E" fontFamily="font-myeongjo" letterSpacing="0.5">
                    慧眼
                  </text>
                  <text x="30" y="41" textAnchor="middle" fontSize="12" fontWeight="900" fill="#8B221E" fontFamily="font-myeongjo" letterSpacing="0.5">
                    堂印
                  </text>
                </svg>
              </div>
            </div>
          </div>
        </div>
      
      `;

const beforeContent = content.substring(0, startIdx);
const afterContent = content.substring(endIdx);

const updatedContent = beforeContent + newPage1Content + afterContent;

fs.writeFileSync(filePath, updatedContent, 'utf8');
console.log("=== SMS PAGE 1 Enrichment Finished Successfully! ===");
