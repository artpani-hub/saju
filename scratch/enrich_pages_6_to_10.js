const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'src', 'app', 'result', 'page.js');
let content = fs.readFileSync(filePath, 'utf-8');

// 1. Locate case "ny_stem_harmony" and replace up to case "ny_lucky_secrets"
const startMarker = '      case "ny_stem_harmony":';
const endMarker = '      case "ny_lucky_secrets":';

const startIndex = content.indexOf(startMarker);
const endIndex = content.indexOf(endMarker);

if (startIndex === -1 || endIndex === -1) {
  console.error("6~10 page markers not found in result/page.js!");
  process.exit(1);
}

const enriched6To10 = `      case "ny_stem_harmony":
        let stemHarmonyDesc = "";
        let relationGraph = null;
        const dayStemEl = sajuInfo.day.stemEl;
        const dayStem = sajuInfo.day.stem;
        
        if (dayStemEl === "목") {
          stemHarmonyDesc = \`의뢰인 \${name}님은 청량한 나무(木)의 일간(\${dayStem}) 기질을 품고 계십니다. 나무가 병오년의 불꽃(화)을 만나면 자신의 잎과 꽃을 흐드러지게 피워내는 '식상(食傷)'의 작용이 일어납니다. 올해는 창의적인 아이디어가 번뜩이고 표현 능력이 극대화되어 나의 매력과 실력을 세상에 널리 알릴 최고의 기회입니다. 새로운 프로젝트의 기획이나 예술적 창작, 그리고 대외적인 마케팅 활동에서 누구보다 눈부신 두각을 나타내게 될 것입니다. 다만, 불이 맹렬해질수록 내 본연의 수분이 빠르게 고갈되므로 감정적 번아웃과 불만족(욱하는 감정)을 슬기롭게 다스려야 합니다. 특히 대인 관계에서 자존심을 앞세우기보다 한 템포 물러서서 상대의 의견을 경청하는 유연성이 올 한 해의 성패를 가를 것입니다.\`;
          relationGraph = (
            <div className="flex items-center justify-center gap-4 py-4 my-2 bg-[#FAF7F0] rounded-lg border border-[#E2DDD5]/50">
              <div className="px-3 py-1 bg-[#5F7A68] text-white rounded font-bold text-xs shadow-sm">나 ({dayStem}木)</div>
              <span className="text-[#A3845B] font-bold text-sm">➔</span>
              <div className="px-2 py-0.5 bg-amber-100 text-amber-900 border border-amber-300 rounded text-[9px] font-semibold">목생화 (식상·발산)</div>
              <span className="text-[#A3845B] font-bold text-sm">➔</span>
              <div className="px-3 py-1 bg-red-600 text-white rounded font-bold text-xs shadow-sm">병오년 (丙火)</div>
            </div>
          );
        } else if (dayStemEl === "화") {
          stemHarmonyDesc = \`의뢰인 \${name}님은 태양 혹은 횃불(화)의 일간(\${dayStem}) 기질을 지니셨습니다. 내 기운과 동일한 병오년의 거대한 불꽃(화)을 조우하여 '비겁(比劫)'이 극에 달하는 주체적인 해가 됩니다. 자신감과 독립심이 극대화되어 신규 사업, 창업, 혹은 강력한 자립을 도모하려는 에너지가 솟구칩니다. 남의 눈치를 보지 않고 오롯이 내 주도하에 판을 짜고 리드할 수 있는 최적의 시기입니다. 다만, 강한 자존심끼리 마주쳐 동료, 배우자와 대립하거나 자만으로 손재수를 입기 쉬우니 한 걸음 양보가 운을 살리는 지름길입니다. 주변 사람들과의 공생을 먼저 고려하고, 지나친 확장을 경계하는 신중함이야말로 솟구치는 불길을 황금으로 바꾸는 연쇠가 될 것입니다.\`;
          relationGraph = (
            <div className="flex items-center justify-center gap-4 py-4 my-2 bg-[#FAF7F0] rounded-lg border border-[#E2DDD5]/50">
              <div className="px-3 py-1 bg-red-500 text-white rounded font-bold text-xs shadow-sm">나 ({dayStem}火)</div>
              <span className="text-[#A3845B] font-bold text-sm">➔</span>
              <div className="px-2 py-0.5 bg-amber-100 text-amber-900 border border-amber-300 rounded text-[9px] font-semibold">비겁중중 (경쟁·자립)</div>
              <span className="text-[#A3845B] font-bold text-sm">➔</span>
              <div className="px-3 py-1 bg-red-600 text-white rounded font-bold text-xs shadow-sm">병오년 (丙火)</div>
            </div>
          );
        } else if (dayStemEl === "토") {
          stemHarmonyDesc = \`의뢰인 \${name}님은 넉넉한 대지(토)의 일간(\${dayStem}) 기질을 소유하고 계십니다. 불꽃(화)이 흙을 다정하게 익혀주고 단단히 다져주는 '인성(印星)'의 대단히 길한 기류가 도래합니다. 공부, 학업, 국가 고시, 자격증 취득 등 문서상의 경사가 따르며, 나를 후원해 주는 조력자나 은인(귀인)의 등장이 강력하게 보장되는 은혜롭고 든든한 한 해가 될 것입니다. 인생의 중요한 계약서 도장을 찍거나, 부동산 및 문서 형태의 자산을 확보하는 데 최고의 타이밍입니다. 다만, 들어오는 기운이 지나치게 강해지면 스스로 안일함에 빠지거나 행동하지 않고 생각만 많아지는 부작용이 생길 수 있으니, 계획을 세웠다면 지체 없이 실천으로 옮기는 기동력을 발휘하십시오.\`;
          relationGraph = (
            <div className="flex items-center justify-center gap-4 py-4 my-2 bg-[#FAF7F0] rounded-lg border border-[#E2DDD5]/50">
              <div className="px-3 py-1 bg-[#A3845B] text-white rounded font-bold text-xs shadow-sm">나 ({dayStem}土)</div>
              <span className="text-[#A3845B] font-bold text-sm">⇠</span>
              <div className="px-2 py-0.5 bg-amber-100 text-amber-900 border border-amber-300 rounded text-[9px] font-semibold">화생토 (인성·후원)</div>
              <span className="text-[#A3845B] font-bold text-sm">⇠</span>
              <div className="px-3 py-1 bg-red-600 text-white rounded font-bold text-xs shadow-sm">병오년 (丙火)</div>
            </div>
          );
        } else if (dayStemEl === "금") {
          stemHarmonyDesc = \`의뢰인 \${name}님은 단단한 바위나 보석(금)의 일간(\${dayStem}) 기질을 타고나셨습니다. 맹렬한 불꽃(화)이 쇠붙이를 제련하고 쓸모 있는 도구로 다듬는 강력한 '관성(官星)'의 해를 지납니다. 직장에서 중책을 맡아 공적 위상이 올라가거나 승진 및 영전의 기회를 얻게 됩니다. 나의 명예와 신용도가 크게 올라가 주변의 존경을 받는 귀한 시기입니다. 다만 압박감과 책임감이 극에 달해 뼈, 호흡기 계통 건강 관리 및 상사와의 충돌 조절에 만전을 기해야 합니다. 지나친 완벽주의로 스스로를 옥죄기 쉬우니, 일과 휴식의 균형을 엄격하게 관리하고 사소한 실수에는 관대해지는 너그러운 마음가짐이 절대적으로 요구됩니다.\`;
          relationGraph = (
            <div className="flex items-center justify-center gap-4 py-4 my-2 bg-[#FAF7F0] rounded-lg border border-[#E2DDD5]/50">
              <div className="px-3 py-1 bg-gray-400 text-gray-900 rounded font-bold text-xs shadow-sm">나 ({dayStem}金)</div>
              <span className="text-[#A3845B] font-bold text-sm">⇠</span>
              <div className="px-2 py-0.5 bg-red-100 text-red-950 border border-red-300 rounded text-[9px] font-semibold">화극금 (관성·제련)</div>
              <span className="text-[#A3845B] font-bold text-sm">⇠</span>
              <div className="px-3 py-1 bg-red-600 text-white rounded font-bold text-xs shadow-sm">병오년 (丙火)</div>
            </div>
          );
        } else {
          stemHarmonyDesc = \`의뢰인 \${name}님은 깊고 차가운 물(수)의 일간(\${dayStem}) 기질을 지니고 태어나셨습니다. 차가운 물줄기가 2026년 병오년의 거대한 화기(화)를 통제하고 가두는 '재성(財星)'의 해가 열립니다. 막혔던 현금 흐름이 트이고 투자 소득, 연봉 협상 타결, 횡재수 등 경제적 기회가 요동칩니다. 내 노력의 결실이 눈에 보이는 성과물로 뚜렷하게 환원되는 가장 역동적인 한 해가 될 것입니다. 다만 불을 끄느라 내 수분이 소모되므로 건강을 챙기며 에너지를 완급 조절하십시오. 급격하게 늘어나는 지출이나 감정적 소비를 통제하고, 안정적인 저축 비중을 늘려야 연말에 새어나가는 자금 없이 든든한 금고를 지킬 수 있습니다.\`;
          relationGraph = (
            <div className="flex items-center justify-center gap-4 py-4 my-2 bg-[#FAF7F0] rounded-lg border border-[#E2DDD5]/50">
              <div className="px-3 py-1 bg-gray-800 text-white rounded font-bold text-xs shadow-sm">나 ({dayStem}水)</div>
              <span className="text-[#A3845B] font-bold text-sm">➔</span>
              <div className="px-2 py-0.5 bg-amber-100 text-amber-900 border border-amber-300 rounded text-[9px] font-semibold">수극화 (재성·획득)</div>
              <span className="text-[#A3845B] font-bold text-sm">➔</span>
              <div className="px-3 py-1 bg-red-600 text-white rounded font-bold text-xs shadow-sm">병오년 (丙火)</div>
            </div>
          );
        }

        return wrapLock(
          <div className="space-y-6 py-4">
            <div className="text-center space-y-2 mb-8">
              <span className="text-xs text-[#A3845B] font-bold block">일간(日干)과의 융합</span>
              <h2 className="font-myeongjo text-2xl font-bold text-[#1A1A1A]">나의 타고난 일간과 세운의 융합</h2>
              <div className="w-16 h-0.5 bg-[#A3845B]/30 mx-auto my-1" />
            </div>
            <div className="bg-white border border-[#E2DDD5] rounded-lg p-6 space-y-4 shadow-sm text-xs leading-relaxed font-light text-gray-700 font-traditional">
              <div className="bg-[#FAF7F0] p-4 rounded border border-[#E2DDD5]/60 text-center font-bold text-sm text-[#A3845B]">
                {name}님의 일간: {dayStem} ({dayStemEl}의 기운)
              </div>
              
              {relationGraph}

              <p className="mt-4">
                {stemHarmonyDesc}
              </p>
            </div>
          </div>,
          "일간 오행과 세운의 융합 분석"
        );

      case "ny_ilju_harmony":
        const ilju = sajuInfo.day.stem + sajuInfo.day.branch;
        const dayBranch = sajuInfo.day.branch;
        let relationDesc = "";
        let statusBadge = <span className="bg-blue-100 text-blue-800 border border-blue-200 text-[10px] font-bold px-2 py-0.5 rounded shadow-sm">완만한 조화 (평온)</span>;
        
        if (dayBranch === "子") {
          relationDesc = "2026년 오화(午火) 세운은 귀하의 일지 자수(子水)와 격렬히 부딪치는 자오충(子午沖)을 유발합니다. 이는 집터, 근무지 이동, 혹은 부부 관계의 급격한 지각변동을 뜻합니다. 흔들림을 두려워하기보다 고여있던 나쁜 습관을 털어내는 계기로 삼으십시오.";
          statusBadge = <span className="bg-red-100 text-red-800 border border-red-200 text-[10px] font-bold px-2 py-0.5 rounded animate-pulse shadow-sm">⚠️ 격렬한 변화 (충살)</span>;
        } else if (dayBranch === "午") {
          relationDesc = "2026년 오화(午火)는 내 일지의 오화와 겹쳐 스스로를 옭아매는 오오자형(午午自刑)을 일으킵니다. 감정 기복이 심해져 섣부른 말이나 행동으로 일을 그르치기 쉬우니 계약 체결 시에는 반드시 타인의 피드백을 한 번 더 거치십시오.";
          statusBadge = <span className="bg-orange-100 text-orange-800 border border-orange-200 text-[10px] font-bold px-2 py-0.5 rounded shadow-sm">⚠️ 스스로 단속 (자형)</span>;
        } else if (dayBranch === "未" || dayBranch === "寅" || dayBranch === "戌") {
          relationDesc = "2026년 세운의 오화(午火)는 내 일지와 따뜻한 합(午未 육합, 寅午戌 삼합)을 이루어 평화롭고 조화로운 기류를 형성합니다. 대인관계의 오해가 눈 녹듯 풀리고 귀인의 적극적인 협력을 받아 편안하게 안정을 얻을 수 있는 대길한 흐름입니다.";
          statusBadge = <span className="bg-emerald-100 text-emerald-800 border border-emerald-200 text-[10px] font-bold px-2 py-0.5 rounded shadow-sm">★ 대길한 화합 (지합)</span>;
        } else if (dayBranch === "丑") {
          relationDesc = "2026년 오화(午火)는 내 일지 축토(丑土)와 만나며 서로 은근히 밀어내고 원망하게 만드는 축오원진(丑午怨嗔) 및 귀문관살 기류를 생성합니다. 예민함과 심리적 불안정이 높아져 가까운 이의 말 한마디에 큰 상처를 입거나 오해를 하기 쉽습니다. 상대방을 비난하기 전에 한 템포 호흡을 고르고 이성적으로 팩트를 점검하십시오.";
          statusBadge = <span className="bg-purple-100 text-purple-800 border border-purple-200 text-[10px] font-bold px-2 py-0.5 rounded shadow-sm">⚠️ 감정 오해 (원진)</span>;
        }

        return wrapLock(
          <div className="space-y-6 py-4">
            <div className="text-center space-y-2 mb-8">
              <span className="text-xs text-[#A3845B] font-bold block">일주(日柱) 지합·충 진단</span>
              <h2 className="font-myeongjo text-2xl font-bold text-[#1A1A1A]">일주와 세운의 형·충·회·합 정밀 진단</h2>
              <div className="w-16 h-0.5 bg-[#A3845B]/30 mx-auto my-1" />
            </div>
            <div className="bg-white border border-[#E2DDD5] rounded-lg p-6 space-y-4 shadow-sm text-xs leading-relaxed font-light text-gray-700 font-traditional">
              <div className="flex justify-between items-center bg-[#FAF7F0] p-4 rounded border border-[#E2DDD5]/60 text-sm font-bold text-[#8B221E]">
                <span>귀하의 타고난 일주: {ilju}일주</span>
                {statusBadge}
              </div>
              <p className="mt-4">
                일지는 사주에서 <strong>나의 개인적인 안식처, 침실, 그리고 배우자 궁</strong>을 상징합니다. 1년의 기류를 지배하는 세운의 지지(오화)가 내 안식처의 글자와 어떤 관계를 맺느냐에 따라 실질적인 신체 컨디션과 가정생활의 평화 지수가 좌우됩니다.
              </p>
              <p>
                {relationDesc}
              </p>
            </div>
          </div>,
          "일주와 세운의 합·충·형·파·해 진단"
        );

      case "ny_elements_balance":
        return wrapLock(
          <div className="space-y-6 py-4">
            <div className="text-center space-y-2 mb-8">
              <span className="text-xs text-[#A3845B] font-bold block">신년 오행 균형</span>
              <h2 className="font-myeongjo text-2xl font-bold text-[#1A1A1A]">2026년 세운 유입 오행 균형 분석</h2>
              <div className="w-16 h-0.5 bg-[#A3845B]/30 mx-auto my-1" />
            </div>
            <div className="bg-white border border-[#E2DDD5] rounded-lg p-6 space-y-6 shadow-sm text-xs text-gray-700 font-traditional">
              <p className="leading-relaxed font-light">
                의뢰인 {name}님의 타고난 사주 원국 8글자에 2026년 병오년의 <strong>강렬한 불(火) 기운 2개</strong>가 유입되었을 때의 종합 오행 저울 분포 상태입니다. 오행의 치우침 정도에 따라 한 해의 운명적 컨디션이 요동치게 됩니다.
              </p>
              
              <div className="space-y-3 bg-[#FAF7F0] p-4 rounded border border-[#E2DDD5]/60">
                {Object.entries(sajuInfo.elements).map(([el, count]) => {
                  const nyCount = el === "화" ? count + 2 : count;
                  const percentage = (nyCount / 10) * 100;
                  return (
                    <div key={el} className="flex items-center gap-3 text-xs">
                      <span className={\`w-16 text-center py-0.5 rounded font-bold text-[10px] \${getElementColor(el)}\`}>
                        {el} ({nyCount}개)
                      </span>
                      <div className="flex-1 h-2.5 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className={\`h-full transition-all duration-500 \${getElementBarColor(el)}\`} 
                          style={{ width: \`\${percentage}%\` }}
                        />
                      </div>
                      <span className="w-8 text-right font-semibold text-gray-500">{Math.round(percentage)}%</span>
                    </div>
                  );
                })}
              </div>

              <p className="leading-relaxed font-light border-t border-[#E2DDD5]/60 pt-3">
                {sajuInfo.elements.화 + 2 >= 4 ? (
                  <span className="text-red-700 font-bold block mb-1 flex items-center gap-1">⚠️ [경보] 화(火) 기운의 비대화로 인한 건조/과열 상태</span>
                ) : (
                  <span className="text-gray-800 font-bold block mb-1 flex items-center gap-1">✓ [안정] 적절한 화기 조율 상태</span>
                )}
                올해 세상은 거대한 화염으로 뒤덮여, 상대적으로 <strong>수(水)와 금(金)의 기운이 극단적으로 증발하거나 쇠약해지는 약화 상태</strong>가 발생하기 쉽습니다. 사주 균형이 무너지면 심리적으로 성급해지고 체력이 쉽게 고갈되므로, 일상생활 속에서 인위적으로 물과 금속의 차갑고 안정적인 에너지를 수혈하여 기류의 과열을 방어해 주는 처방이 필수적입니다.
              </p>
            </div>
          </div>,
          "신년 오행 과잉/결핍 진단"
        );

      case "ny_elements_supplement":
        return wrapLock(
          <div className="space-y-6 py-4">
            <div className="text-center space-y-2 mb-8">
              <span className="text-xs text-[#A3845B] font-bold block">오행 보완 비책 (五行 補完 秘策)</span>
              <h2 className="font-myeongjo text-2xl font-bold text-[#1A1A1A]">부족한 오행을 채우는 생활 밀착 개운법</h2>
              <div className="w-16 h-0.5 bg-[#A3845B]/30 mx-auto my-1" />
            </div>
            <div className="bg-white border border-[#E2DDD5] rounded-lg p-6 space-y-6 shadow-sm text-xs leading-relaxed font-light text-gray-700 font-traditional">
              <p className="text-justify font-light text-gray-600">
                2026년 병오년(丙午年)의 맹렬한 불꽃 기류 속에서 내 사주 원국을 안정시키기 위해서는 강한 불기운에 의해 증발하기 쉬운 <strong>수(水)</strong> 기운과 녹아내리기 쉬운 <strong>금(金)</strong> 기운을 보완해야 합니다. 오행의 상생 흐름인 <strong>금생수(金生水: 쇠가 물을 맑게 걸러내고 생한다)</strong> 작용을 일상에서 실천하여 운명을 개척하는 최고의 처방입니다.
              </p>
              
              <div className="grid grid-cols-2 gap-4">
                {/* 수 기운 보완 처방 */}
                <div className="border border-[#D4E2D7] bg-[#F4FAF6] rounded-xl p-5 shadow-sm space-y-3">
                  <div className="font-bold text-[#2D5A27] text-xs border-b border-[#2D5A27]/20 pb-2 flex items-center gap-1.5">
                    <span className="text-lg">🌊</span> 수(水) 기운 처방: 지혜와 평온
                  </div>
                  
                  {/* 시각화: 개운 지표 */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[9px] text-[#2D5A27] font-semibold">
                      <span>정신적 여유 & 충동 억제</span>
                      <span>88%</span>
                    </div>
                    <div className="w-full h-1.5 bg-[#E6EFEA] rounded-full overflow-hidden">
                      <div className="h-full bg-[#2D5A27] rounded-full" style={{ width: "88%" }} />
                    </div>
                  </div>

                  <ul className="space-y-2 text-[10px] text-gray-600 font-light pt-2">
                    <li className="flex items-start gap-1">
                      <span className="text-[#2D5A27] font-bold">•</span>
                      <span><strong>개운 시간:</strong> 진시(07~09시) 공복 냉수, 해시(21~23시) 명상 반신욕</span>
                    </li>
                    <li className="flex items-start gap-1">
                      <span className="text-[#2D5A27] font-bold">•</span>
                      <span><strong>공간 풍수:</strong> 집안 북쪽에 바다/호수 그림 액자나 미니 어항 배치</span>
                    </li>
                    <li className="flex items-start gap-1">
                      <span className="text-[#2D5A27] font-bold">•</span>
                      <span><strong>행운 스타일:</strong> 블랙, 네이비 계열 의상, 유연한 실크 소재 패션</span>
                    </li>
                    <li className="flex items-start gap-1">
                      <span className="text-[#2D5A27] font-bold">•</span>
                      <span><strong>보약 식품:</strong> 미역, 다시마 등 해조류, 블랙푸드(검은깨, 검은콩)</span>
                    </li>
                  </ul>
                  <p className="text-[9px] text-gray-500 bg-white/70 p-2 rounded border border-[#E2DDD5]/30 leading-normal">
                    💡 <strong>보충 설명:</strong> 수(水) 기운은 성급한 불길을 잠재우고 내면의 통찰을 깨워줍니다. 감정이 격앙될 때 시원한 물 한 잔을 천천히 음미하는 행동이 즉각적인 개운법입니다.
                  </p>
                </div>

                {/* 금 기운 보완 처방 */}
                <div className="border border-[#E7DCD0] bg-[#FCF9F5] rounded-xl p-5 shadow-sm space-y-3">
                  <div className="font-bold text-[#A3845B] text-xs border-b border-[#A3845B]/20 pb-2 flex items-center gap-1.5">
                    <span className="text-lg">🪙</span> 금(金) 기운 처방: 결단과 자산
                  </div>

                  {/* 시각화: 개운 지표 */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[9px] text-[#A3845B] font-semibold">
                      <span>현실적 결단 & 자산 보호</span>
                      <span>92%</span>
                    </div>
                    <div className="w-full h-1.5 bg-[#F2ECE4] rounded-full overflow-hidden">
                      <div className="h-full bg-[#A3845B] rounded-full" style={{ width: "92%" }} />
                    </div>
                  </div>

                  <ul className="space-y-2 text-[10px] text-gray-600 font-light pt-2">
                    <li className="flex items-start gap-1">
                      <span className="text-[#A3845B] font-bold">•</span>
                      <span><strong>개운 시간:</strong> 사시(09~11시) 플래너 수기 기록, 신시(15~17시) 완급 조율</span>
                    </li>
                    <li className="flex items-start gap-1">
                      <span className="text-[#A3845B] font-bold">•</span>
                      <span><strong>공간 풍수:</strong> 서재 서쪽에 정돈된 금속 스탠드나 흰색 석조 소품 배치</span>
                    </li>
                    <li className="flex items-start gap-1">
                      <span className="text-[#A3845B] font-bold">•</span>
                      <span><strong>행운 스타일:</strong> 화이트, 실버 메탈 시계나 은 반지 악세사리 착용</span>
                    </li>
                    <li className="flex items-start gap-1">
                      <span className="text-[#A3845B] font-bold">•</span>
                      <span><strong>보약 식품:</strong> 아몬드, 호두 등 견과류, 도라지나 배 등 흰색 식품</span>
                    </li>
                  </ul>
                  <p className="text-[9px] text-gray-500 bg-white/70 p-2 rounded border border-[#E2DDD5]/30 leading-normal">
                    💡 <strong>보충 설명:</strong> 금(金) 기운은 맺고 끊음이 흐려질 때 단호한 판단력을 주고, 불필요하게 돈이 세어 나가는 것을 방어하여 내 지갑과 재물 창고를 튼튼하게 지켜줍니다.
                  </p>
                </div>
              </div>

              {/* 하단 융합 시각적 요약 박스 (금생수 상생 작용) */}
              <div className="border border-[#E2DDD5] bg-[#FAF8F5] rounded-xl p-5 space-y-3">
                <h4 className="font-myeongjo text-xs font-bold text-[#8B221E] text-center">
                  🔑 2026 병오년 수호의 핵심: 금생수(金生水) 상생 순환도
                </h4>
                
                <div className="flex items-center justify-around py-2 max-w-sm mx-auto bg-white rounded-lg border border-[#E2DDD5]/60 shadow-inner">
                  <div className="flex flex-col items-center">
                    <div className="w-10 h-10 rounded-full bg-gray-100 border border-gray-300 flex items-center justify-center font-bold text-xs text-gray-800 shadow-sm">金 (금)</div>
                    <span className="text-[8px] text-gray-500 mt-1">냉철한 결단</span>
                  </div>
                  
                  <div className="flex flex-col items-center">
                    <span className="text-gray-400 font-bold text-sm">➔</span>
                    <span className="text-[7px] text-[#8B221E] font-semibold bg-red-50 px-1 rounded border border-red-200">금생수 (상생)</span>
                  </div>

                  <div className="flex flex-col items-center">
                    <div className="w-10 h-10 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center font-bold text-xs text-blue-900 shadow-sm">水 (수)</div>
                    <span className="text-[8px] text-blue-600 mt-1">유연한 수용</span>
                  </div>

                  <div className="flex flex-col items-center">
                    <span className="text-gray-400 font-bold text-sm">➔</span>
                    <span className="text-[7px] text-green-700 font-semibold bg-green-50 px-1 rounded border border-green-200">화기 제어 (안정)</span>
                  </div>

                  <div className="flex flex-col items-center">
                    <div className="w-10 h-10 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center font-bold text-xs text-amber-900 shadow-sm">平 (평)</div>
                    <span className="text-[8px] text-amber-700 mt-1">신년 균형 회복</span>
                  </div>
                </div>

                <p className="text-[10px] text-gray-500 leading-relaxed text-center font-light pt-1">
                  결단(金)이 바로 서야 지혜(水)가 맑아지고, 비로소 세운의 격렬한 불기운(火)을 지혜롭게 조율하여 **안정적인 부와 명예**를 성취할 수 있습니다.
                </p>
              </div>
            </div>
          </div>,
          "부족한 오행을 채우는 일상 개운법"
        );

      case "ny_health_presc":
        return wrapLock(
          <div className="space-y-6 py-4">
            <div className="text-center space-y-2 mb-8">
              <span className="text-xs text-[#A3845B] font-bold block">건강 수호 보감 (健康 守護 寶鑑)</span>
              <h2 className="font-myeongjo text-2xl font-bold text-[#1A1A1A]">세운 기류 변화에 따른 신년 건강 처방</h2>
              <div className="w-16 h-0.5 bg-[#A3845B]/30 mx-auto my-1" />
            </div>
            <div className="bg-white border border-[#E2DDD5] rounded-lg p-6 space-y-6 shadow-sm text-xs leading-relaxed font-light text-gray-700 font-traditional">
              <p className="text-justify font-light text-gray-600">
                동양 의학의 원전인 황제내경(黃帝內經) 운기학에 따르면, 2026년 병오년은 강력한 불의 세력이 기승을 부려 우리 신체 내부의 <strong>심장(심혈관계), 소장, 그리고 안구 부위의 열감을 강하게 자극</strong>하게 됩니다. 상대적으로 화기(火氣)에 의해 수분과 금속 기운이 증발하면서 <strong>호흡기계(폐/기관지) 및 비뇨기계(신장/방광)가 건조하게 메마르는 리스크</strong>가 유독 높으므로 이에 대한 선제적 방어가 필수적입니다.
              </p>
              
              {/* 장부별 건강 적신호 정밀 진단 카드 */}
              <div className="space-y-4">
                {/* 심혈관계 카드 */}
                <div className="border border-red-100 bg-red-50/30 rounded-xl p-4 shadow-sm space-y-3">
                  <div className="flex justify-between items-center border-b border-red-100/70 pb-2">
                    <span className="font-bold text-red-900 flex items-center gap-1.5 text-xs">
                      <span>❤️</span> 심혈관계 (심장 / 혈압 / 혈액순환)
                    </span>
                    <span className="text-[9px] bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-bold">⚠️ 과열·위험 상태</span>
                  </div>
                  
                  {/* 시각화: 지표 바 */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[8px] text-red-700 font-semibold">
                      <span>심장 열감 및 자율신경 압박도</span>
                      <span>80% (위험)</span>
                    </div>
                    <div className="w-full h-1.5 bg-red-100/60 rounded-full overflow-hidden">
                      <div className="h-full bg-red-500 rounded-full" style={{ width: "80%" }} />
                    </div>
                  </div>
                  
                  <p className="text-[10px] text-gray-600 font-light leading-relaxed">
                    강렬한 세운의 화기가 혈압 상승 및 상열감을 부추깁니다. 평소 두통이 잦거나 안구가 쉽게 충혈되는 증상이 생기며, 자율신경계 과열로 인한 가슴 두근거림이나 불면 증상이 찾아올 수 있으니 흥분과 과로를 피해야 합니다.
                  </p>
                  <div className="text-[9px] text-[#8B221E] font-medium bg-white/80 p-2 rounded border border-red-200/50">
                    💡 <strong>실천 요령:</strong> 매운 자극성 음식과 음주를 제한하고, 하루 10분씩 뇌를 식히는 냉각 호흡 및 명상을 실천해 열감을 내려야 합니다.
                  </div>
                </div>

                {/* 호흡기계 카드 */}
                <div className="border border-amber-100 bg-amber-50/20 rounded-xl p-4 shadow-sm space-y-3">
                  <div className="flex justify-between items-center border-b border-amber-100/70 pb-2">
                    <span className="font-bold text-amber-900 flex items-center gap-1.5 text-xs">
                      <span>🤍</span> 호흡기계 (폐 / 기관지 / 피부 건조)
                    </span>
                    <span className="text-[9px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-bold">⚠️ 수분 증발·주의</span>
                  </div>

                  {/* 시각화: 지표 바 */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[8px] text-amber-800 font-semibold">
                      <span>기관지 점막 및 피부 건조도</span>
                      <span>60% (주의)</span>
                    </div>
                    <div className="w-full h-1.5 bg-amber-100/50 rounded-full overflow-hidden">
                      <div className="h-full bg-amber-500 rounded-full" style={{ width: "60%" }} />
                    </div>
                  </div>

                  <p className="text-[10px] text-gray-600 font-light leading-relaxed">
                    뜨거운 열기가 사주의 금(金) 기운을 녹이면서 기관지 점막과 피부 장벽을 빠르게 메마르게 만듭니다. 원인 모를 마른기침, 목 이물감, 만성적인 인후염 및 피부 가려움증이 쉽게 도질 수 있어 보습 관리가 생명입니다.
                  </p>
                  <div className="text-[9px] text-amber-900 font-medium bg-white/80 p-2 rounded border border-amber-200/50">
                    💡 <strong>실천 요령:</strong> 가습기를 활용해 실내 습도를 50~60%로 고정하고, 점막을 촉촉하게 지켜주는 맥문동이나 오미자차를 수시로 마시면 건조증을 예방할 수 있습니다.
                  </div>
                </div>

                {/* 비뇨기계 카드 */}
                <div className="border border-blue-100 bg-blue-50/20 rounded-xl p-4 shadow-sm space-y-3">
                  <div className="flex justify-between items-center border-b border-blue-100/70 pb-2">
                    <span className="font-bold text-blue-900 flex items-center gap-1.5 text-xs">
                      <span>🖤</span> 비뇨기계 (신장 / 방광 / 만성 피로)
                    </span>
                    <span className="text-[9px] bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full font-bold">⚠️ 수기 고갈·쇠약</span>
                  </div>

                  {/* 시각화: 지표 바 */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[8px] text-blue-800 font-semibold">
                      <span>신장 필터 기능 및 에너지 쇠약도</span>
                      <span>40% (약화)</span>
                    </div>
                    <div className="w-full h-1.5 bg-blue-100/50 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500 rounded-full" style={{ width: "40%" }} />
                    </div>
                  </div>

                  <p className="text-[10px] text-gray-600 font-light leading-relaxed">
                    오행의 물(水) 기운이 세운의 불길을 잡기 위해 과도하게 소모되면서 신장과 방광 기능이 쇠약해집니다. 이로 인해 만성 피로가 유발되고, 아침마다 몸과 얼굴이 자주 부으며 하체 근력과 비뇨계통 에너지가 저하되기 쉽습니다.
                  </p>
                  <div className="text-[9px] text-blue-950 font-medium bg-white/80 p-2 rounded border border-blue-200/50">
                    💡 <strong>실천 요령:</strong> 무리한 야근과 과로를 피하고 충분한 수면 시간을 보장해야 하며, 검은깨, 검은콩 등 짠맛을 지닌 블랙 오행 식품으로 신장의 근본 수기를 보충해야 합니다.
                  </div>
                </div>
              </div>

              {/* 하단: 건강 수호 3대 비책 체크리스트 */}
              <div className="border border-[#E2DDD5]/60 rounded-xl p-5 bg-[#FAF8F5] shadow-sm space-y-3">
                <h4 className="font-myeongjo text-xs font-bold text-[#A3845B] border-b border-[#E2DDD5]/50 pb-1.5 flex items-center gap-1.5">
                  🍀 [신년 건강 수호를 위한 3대 핵심 생활 수칙]
                </h4>
                <div className="grid gap-2 text-[10px] text-gray-600 font-light">
                  <div className="flex gap-2 items-start bg-white p-2.5 rounded border border-[#E2DDD5]/40">
                    <span className="w-5 h-5 rounded-full bg-[#FAF7F0] text-[#A3845B] border border-[#E2DDD5]/60 flex items-center justify-center font-bold text-[10px] shrink-0">1</span>
                    <p className="leading-relaxed"><strong>하루 미온수 1.5L 규칙적 수혈:</strong> 차가운 얼음물은 자칫 비위를 상하게 하니 체온과 비슷한 온도의 맑은 물을 매시간 반 컵씩 음용하십시오.</p>
                  </div>
                  <div className="flex gap-2 items-start bg-white p-2.5 rounded border border-[#E2DDD5]/40">
                    <span className="w-5 h-5 rounded-full bg-[#FAF7F0] text-[#A3845B] border border-[#E2DDD5]/60 flex items-center justify-center font-bold text-[10px] shrink-0">2</span>
                    <p className="leading-relaxed"><strong>야간 족욕 및 반신욕 생활화:</strong> 머리로 솟아오른 뜨거운 기운을 발밑으로 끌어내리는 수승화강(水昇火降) 요법으로 불면증과 안구 건조증을 퇴치하십시오.</p>
                  </div>
                  <div className="flex gap-2 items-start bg-white p-2.5 rounded border border-[#E2DDD5]/40">
                    <span className="w-5 h-5 rounded-full bg-[#FAF7F0] text-[#A3845B] border border-[#E2DDD5]/60 flex items-center justify-center font-bold text-[10px] shrink-0">3</span>
                    <p className="leading-relaxed"><strong>자연 친화적 흙길 밟기(어싱):</strong> 전자파를 빼주고 지구 대지의 안정적 에너지를 발바닥으로 흡수하여 심혈관계의 압박을 낮추는 최고의 자연 요법입니다.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>,
          "신년 건강 처방"
        );
`;

const finalContent = content.substring(0, startIndex) + enriched6To10 + content.substring(endIndex);

fs.writeFileSync(filePath, finalContent, 'utf-8');
console.log("Pages 6 to 10 successfully enriched with proper template escapes!");
