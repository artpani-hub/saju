const fs = require('fs');

const targetFile = 'd:/인터그리비티/saju/src/app/result/components/renderNewYearPageContent.js';
let content = fs.readFileSync(targetFile, 'utf8');

// 1. ny_preface 치환
const startPreface = content.indexOf('case "ny_preface":');
const endPreface = content.indexOf('case "ny_intro_saju":');

if (startPreface === -1 || endPreface === -1) {
  console.error("ny_preface or ny_intro_saju not found");
  process.exit(1);
}

const newPrefaceCode = `case "ny_preface": {
        const dayStemEl = sajuInfo?.day?.stemEl || baseEl || "목";
        const mVal = parseInt(month) || 1;
        let seasonText = "새로운 생명이 움트는 봄";
        if (mVal >= 3 && mVal <= 5) seasonText = "새로운 생명이 움트는 봄";
        else if (mVal >= 6 && mVal <= 8) seasonText = "정열적인 생명력이 팽창하는 여름";
        else if (mVal >= 9 && mVal <= 11) seasonText = "풍요로운 결실을 수확하고 준비하는 가을";
        else seasonText = "만물을 품고 조용히 갈무리하는 겨울";

        let dynamicAdvice = "";
        if (dayStemEl === "목") {
          dynamicAdvice = \`특히 의뢰인 \${name}님은 싱그러운 목(木) 기운을 본질로 품고 태어나셨습니다. 2026년 병오년의 타오르는 불꽃(火)은 목생화(木生火)의 흐름으로 귀하의 에너지를 밖으로 넓게 팽창시키고 재능을 펼치게 만듭니다. 그러나 나무의 수분이 메말라 번아웃되기 쉬운 기류를 내재하고 있으므로, 올 한 해는 무조건적인 돌진보다 내면의 수기를 수혈하는 현명한 완급 조절이 최고의 신년 등대가 될 것입니다.\`;
        } else if (dayStemEl === "화") {
          dynamicAdvice = \`특히 의뢰인 \${name}님은 정열적인 화(火) 기운을 본질로 품고 태어나셨습니다. 2026년 병오년의 불꽃(火)은 내 사주와 세운이 불로 하나되어 타오르는 비겁(比劫)의 강한 에너지를 만듭니다. 주체성과 독립심이 극대화되어 판을 주도적으로 흔드는 힘이 있으나, 불필요한 고집이나 과열된 자존심으로 인해 재물 누수나 대인 마찰을 부를 수 있으니, 올 한 해는 차분하게 불꽃을 제어하는 보수적 방어와 신중함이 최고의 신년 등대가 될 것입니다.\`;
        } else if (dayStemEl === "토") {
          dynamicAdvice = \`특히 의뢰인 \${name}님은 묵직하고 따뜻한 토(土) 기운을 본질로 품고 태어나셨습니다. 2026년 병오년의 불꽃(火)은 흙을 든든하게 생조해주는 화생토(火生土)의 인성(印星) 에너지를 만듭니다. 귀인과 문서 계약의 길함이 크게 돋보여 새로운 기반을 탄탄히 다지기에 적합한 조건입니다. 다만, 들어오는 에너지가 무거워 생각에만 잠겨 실천을 미루는 '생각의 감옥'에 갇힐 위험이 있으니, 올 한 해는 맑은 직관과 과감한 기동력이 최고의 신년 등대가 될 것입니다.\`;
        } else if (dayStemEl === "금") {
          dynamicAdvice = \`특히 의뢰인 \${name}님은 결단력 있는 금(金) 기운을 본질로 품고 태어나셨습니다. 2026년 병오년의 불꽃(火)은 단단한 원석이나 무쇠를 제련하는 화극금(화극금)의 관성(官星) 기류를 이끌어냅니다. 직장에서의 승진, 명예의 획득, 큰 책임감이 주어져 한 단계 높은 사회적 위상을 다질 수 있는 시험대에 서게 됩니다. 다만, 과도한 책임 지움과 제련 스트레스로 인해 신체가 쉽게 건조해질 수 있으니, 올 한 해는 유연한 마음가짐과 규칙적인 휴식이 최고의 신년 등대가 될 것입니다.\`;
        } else {
          dynamicAdvice = \`특히 의뢰인 \${name}님은 지혜로운 수(수) 기운을 본질로 품고 태어나셨습니다. 2026년 병오년의 불꽃(화)은 물이 불을 통제하며 성과를 거두는 수극화(수극화)의 재성(재성) 활력을 불어넣습니다. 막혔던 자금 흐름이 풀리고 경제적 실리를 확실하게 거둘 수 있는 역동적인 재물 기회가 주어지게 됩니다. 다만, 조급하게 서둘러 분수에 넘치는 투자를 감행하면 불길에 물이 모두 증발하여 오히려 패를 볼 수 있으니, 올 한 해는 이성적이고 차분한 자산 수성이 최고의 신년 등대가 될 것입니다.\`;
        }

        return (
          <div className="space-y-6 py-4">
            <div className="text-center space-y-2 mb-8">
              <span className="text-xs text-[#A3845B] font-bold block">명리 서막 (命理 序幕)</span>
              <h2 className="font-myeongjo text-2xl font-bold text-[#1A1A1A]">새해를 맞이하는 역학적 지혜와 혜안의 등대</h2>
              <div className="w-16 h-0.5 bg-[#A3845B]/30 mx-auto my-1" />
            </div>
            <div className="bg-white border border-[#E2DDD5] rounded-lg p-6 space-y-4 shadow-sm text-xs leading-relaxed font-light text-gray-700 font-traditional">
              <p>
                동양 명리학의 근본 원리인 <strong>천인상응(天人相應: 하늘과 인간은 긴밀하게 소통하며 반응한다)</strong> 사상에 따르면, 1년의 운(運)이란 미리 정해진 고정된 시나리오가 아니라 매년 우리에게 새롭게 밀려오는 거대한 계절적 날씨와 기후에 비유됩니다. 폭풍우가 치는 한겨울에 억지로 봄 씨앗을 뿌리려 하거나, 땡볕이 내리쬐는 극심한 가뭄에 물을 주지 않고 방치한다면, 아무리 훌륭한 씨앗이라 한들 결실을 맺지 못하고 썩어버리는 자연의 이치와도 같습니다.
              </p>
              <p>
                의뢰인 <strong>{name}</strong>님은 <strong>{seasonText}철</strong>에 태어나 사주 원국의 독자적인 우주 에너지를 품으셨기에, 올해 병오년의 불꽃 날씨와 만나는 양상이 매우 입체적이고 다각적입니다.
              </p>
              <p>
                {dynamicAdvice}
              </p>
              <p className="bg-[#FAF7F0] p-4 rounded border border-[#E2DDD5]/60 text-amber-900 font-semibold text-center leading-relaxed">
                "우매한 자는 닥쳐올 길흉에 일희일비하지만, 지혜로운 자는 다가올 흐름을 미리 파악해 스스로의 기운을 튜닝한다(趨吉避凶)."
              </p>
              <p>
                신년의 강렬한 화(火)의 팽창력은 우리에게 활발한 대외 성장의 기회를 주는 동시에 감정 과열과 충동이라는 어두운 그림자를 함께 던집니다. 올 한 해 수많은 선택의 갈림길에서 본 보감을 항상 곁에 두시고, 삶의 든든한 등대이자 최고의 전략적 플레이북으로 삼아 대길한 성취를 이루시길 간절히 기원합니다.
              </p>
            </div>
          </div>
        );
      }

      `;

content = content.slice(0, startPreface) + newPrefaceCode + content.slice(endPreface);

// 2. ny_intro_saju 치환
const startIntro = content.indexOf('case "ny_intro_saju":');
const endIntro = content.indexOf('case "ny_daewun_flow":');

if (startIntro === -1 || endIntro === -1) {
  console.error("ny_intro_saju or ny_daewun_flow not found");
  process.exit(1);
}

const newIntroCode = `case "ny_intro_saju": {
        const woodCount = sajuInfo?.elements?.목 || 0;
        const fireCount = sajuInfo?.elements?.화 || 0;
        const earthCount = sajuInfo?.elements?.토 || 0;
        const metalCount = sajuInfo?.elements?.금 || 0;
        const waterCount = sajuInfo?.elements?.수 || 0;
        
        const counts = { "목": woodCount, "화": fireCount, "토": earthCount, "금": metalCount, "수": waterCount };
        
        let dominantEl = "목";
        let maxCount = -1;
        Object.entries(counts).forEach(([el, cnt]) => {
          if (cnt > maxCount) {
            maxCount = cnt;
            dominantEl = el;
          }
        });

        let deficientEl = "목";
        let minCount = 99;
        Object.entries(counts).forEach(([el, cnt]) => {
          if (cnt < minCount) {
            minCount = cnt;
            deficientEl = el;
          }
        });

        let dominantDesc = "";
        if (dominantEl === "목") {
          dominantDesc = "나무(木)의 위로 솟구치며 새로운 일을 과감하게 추진하고 시작하려는 진취적인 성장 에너지입니다. 기획이나 창의적 시작점의 개척 능력이 매우 발달해 있습니다.";
        } else if (dominantEl === "화") {
          dominantDesc = "불(火)의 팽창하고 밝게 드러내는 화려한 표현성과 대외적 소통력입니다. 대중 중심에 서거나 자신의 재능을 화사하게 어필하는 매력의 기운이 뛰어납니다.";
        } else if (dominantEl === "토") {
          dominantDesc = "흙(土)의 중심을 잡아주고 모든 기운을 중재하는 포용력과 신뢰도입니다. 타인에게 신망을 두터이 얻으며, 묵묵하고 듬직하게 안정과 경제적 안정을 이뤄내는 기틀이 됩니다.";
        } else if (dominantEl === "금") {
          dominantDesc = "쇠(金)의 맺고 끊음이 확실한 단호한 절제와 이성적 판단력입니다. 복잡한 미련이나 군더더기 없이 확실하고 실리적인 결과를 이끌어내는 결단력이 강력합니다.";
        } else {
          dominantDesc = "물(水)의 깊고 유연하게 스며드는 뛰어난 통찰력과 지혜입니다. 한 치 앞이 아닌 대세를 멀리 내다보며 전략을 세우고 마음의 안정을 유도하는 내실이 탄탄합니다.";
        }

        let deficientDesc = "";
        if (minCount === 0) {
          if (deficientEl === "목") {
            deficientDesc = "나무(木)의 개척 에너지가 0개로 결핍되어 시작 단계에서 주저하거나 과도한 계획에만 에너지를 쏟아 첫발을 떼지 못하는 아쉬움이 있습니다. 실행 본능을 적극 깨워야 합니다.";
          } else if (deficientEl === "화") {
            deficientDesc = "불(火)의 에너지 분출력이 0개로 결핍되어 본인의 훌륭한 실력이나 가치보다 과소평가받거나 낯을 많이 가리기 쉽습니다. 의식적으로 환하게 미소 짓고 자신감을 드러내야 발복합니다.";
          } else if (deficientEl === "토") {
            deficientDesc = "흙(土)의 보관 및 매립 에너지가 0개로 결핍되어 자산이 고이지 못하고 흩어지는 위험이 있습니다. 2026년 버는 수익은 부동산이나 장기 적금 등 문서 형태로 바로 잠가 지켜야 합니다.";
          } else if (deficientEl === "금") {
            deficientDesc = "쇠(金)의 차단 및 거절력이 0개로 결핍되어 거절하지 못하고 질질 끌려다니다 상처를 받거나 손실을 보기 쉽습니다. 세련되게 차단하고 거절하는 연습이 최고의 개운법입니다.";
          } else {
            deficientDesc = "물(水)의 흐름 및 정화 기운이 0개로 결핍되어 한 번 상처받거나 앙금이 생기면 마음에 오래 담아두고 고립되는 경향이 있습니다. 가볍게 털어내고 물 흐르듯 유연해져야 합니다.";
          }
        } else {
          if (deficientEl === "목") {
            deficientDesc = "나무(木) 기운이 가장 약하므로 추진과 과감성 측면에서 보강이 요구됩니다. 규칙적인 아침 활동을 습관화하십시오.";
          } else if (deficientEl === "화") {
            deficientDesc = "불(火) 기운이 가장 부족하여 열정과 자기표현의 기운을 보강해야 합니다. 밝은 색상 코디와 대외 네트워킹에 참여해보십시오.";
          } else if (deficientEl === "토") {
            deficientDesc = "흙(土) 기운이 상대적으로 약해 자산의 안전한 수성에 주안점을 둬야 합니다. 충동적 분산 투자보다 저축형 금고를 다지십시오.";
          } else if (deficientEl === "금") {
            deficientDesc = "쇠(金) 기운이 가장 부족하므로 결단과 공사 구분을 명확히 하는 연습을 실천하여 리스크를 예방하십시오.";
          } else {
            deficientDesc = "물(水) 기운이 가장 약하므로 생각을 종이에 써서 정돈하고 매일 온수 족욕을 통해 긴장을 푸는 수기 충원이 필요합니다.";
          }
        }

        return wrapLock(
          <div className="space-y-6 py-4">
            <div className="text-center space-y-2 mb-8">
              <span className="text-xs text-[#A3845B] font-bold block">명조(命造) 분석</span>
              <h2 className="font-myeongjo text-2xl font-bold text-[#1A1A1A]">나를 증명하는 우주의 지도, 사주 원국 정밀 해설</h2>
              <div className="w-16 h-0.5 bg-[#A3845B]/30 mx-auto my-1" />
            </div>
            <div className="bg-white border border-[#E2DDD5] rounded-lg p-6 space-y-6 shadow-sm text-xs leading-relaxed font-light text-gray-700 font-traditional">
              <p>
                의뢰인 <strong>{name}</strong>님이 탄생하는 그 순간, 우주 공간을 채웠던 여덟 글자의 명조(命造: 사주 원국) 배치입니다. 명리학에서 사주 원국은 평생에 걸쳐 귀하를 구성하는 <strong>정신적 뼈대이자 유전적인 기질의 기본형</strong>을 상징합니다.
              </p>
              
              <div className="grid grid-cols-4 gap-2 text-center font-bold">
                <div className="bg-[#FAF7F0] p-2.5 rounded border border-[#E2DDD5]/50">
                  <div className="text-[10px] text-gray-400">시주(時柱)</div>
                  <div className="text-sm text-[#A3845B] mt-1.5">{sajuInfo.hour.stem}{sajuInfo.hour.branch}</div>
                  <div className="text-[9px] text-gray-500 font-light mt-0.5">{sajuInfo.hour.stemEl}/{sajuInfo.hour.branchEl}</div>
                  <div className="text-[8px] text-gray-400 mt-1.5 font-normal border-t border-gray-200/60 pt-1">노년·자식운</div>
                </div>
                <div className="bg-[#FAF7F0] p-2.5 rounded border border-[#E2DDD5]/50 border-2 border-brass">
                  <div className="text-[10px] text-brass">일주(日柱)</div>
                  <div className="text-sm text-brass mt-1.5">{sajuInfo.day.stem}{sajuInfo.day.branch}</div>
                  <div className="text-[9px] text-brass font-light mt-0.5">{sajuInfo.day.stemEl}/{sajuInfo.day.branchEl}</div>
                  <div className="text-[8px] text-brass mt-1.5 font-normal border-t border-brass/20 pt-1">중년·배우자궁</div>
                </div>
                <div className="bg-[#FAF7F0] p-2.5 rounded border border-[#E2DDD5]/50">
                  <div className="text-[10px] text-gray-400">월주(月柱)</div>
                  <div className="text-sm text-[#A3845B] mt-1.5">{sajuInfo.month.stem}{sajuInfo.month.branch}</div>
                  <div className="text-[9px] text-gray-500 font-light mt-0.5">{sajuInfo.month.stemEl}/{sajuInfo.month.branchEl}</div>
                  <div className="text-[8px] text-gray-400 mt-1.5 font-normal border-t border-gray-200/60 pt-1">청년·사회운</div>
                </div>
                <div className="bg-[#FAF7F0] p-2.5 rounded border border-[#E2DDD5]/50">
                  <div className="text-[10px] text-gray-400">년주(年柱)</div>
                  <div className="text-sm text-[#A3845B] mt-1.5">{sajuInfo.year.stem}{sajuInfo.year.branch}</div>
                  <div className="text-[9px] text-gray-500 font-light mt-0.5">{sajuInfo.year.stemEl}/{sajuInfo.year.branchEl}</div>
                  <div className="text-[8px] text-gray-400 mt-1.5 font-normal border-t border-gray-200/60 pt-1">초년·조상궁</div>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <p>
                  네 개의 기둥 중에서도 나 자신을 대변하는 <strong>일간(日干: {sajuInfo.day.stem})</strong>은 나의 정신적 자아와 핵심 가치관을 주도하는 최고 결정권자입니다. 일주(日柱)의 지지({sajuInfo.day.branch})는 내가 지향하는 내면의 안전지대이자 배우자와 정서적 교감을 나누는 주거 환경입니다.
                </p>
                <div className="bg-[#FAF8F5] border border-[#E2DDD5]/60 rounded-xl p-4 space-y-2.5">
                  <span className="font-bold text-xs text-[#8A6F4C] block">⚖️ {name}님의 사주 원국 오행 분석</span>
                  <p className="text-[11px] leading-relaxed text-gray-700">
                    의뢰인님의 사주 원국에서 가장 왕성한 기맥을 형성하고 있는 주도 오행은 <strong>{dominantEl}({dominantEl === "목" ? "木" : dominantEl === "화" ? "火" : dominantEl === "토" ? "土" : dominantEl === "금" ? "金" : "水"})</strong> 기운으로, <strong>{dominantDesc}</strong>
                  </p>
                  <p className="text-[11px] leading-relaxed text-gray-700 border-t border-gray-200/40 pt-2">
                    반면, 기맥의 보완이 가장 시급한 보완 대상 오행은 <strong>{deficientEl}({deficientEl === "목" ? "木" : deficientEl === "화" ? "火" : deficientEl === "토" ? "土" : deficientEl === "금" ? "金" : "水"})</strong> 기운으로, <strong>{deficientDesc}</strong>
                  </p>
                </div>
                <p>
                  올해 병오년의 불꽃은 이 여덟 글자의 유기적 관계와 마주하여 천간의 합과 지지의 충을 정밀하게 일으킵니다. 내 원국에 어떤 글자들이 있고, 그 글자들이 세운의 글자와 어떻게 융합하는지 명확하게 인지하고 대처할 때 나쁜 액운을 지혜롭게 비껴가고 인생의 큰 복록을 온전히 취하게 될 것입니다.
                </p>
              </div>
            </div>
          </div>,
          "의뢰인 명조 분석과 사주 원국"
        );
      }

      `;

content = content.slice(0, startIntro) + newIntroCode + content.slice(endIntro);

// 3. ny_daewun_flow 치환
const startDaewun = content.indexOf('case "ny_daewun_flow":');
const endDaewun = content.indexOf('case "ny_seoun_analysis":');

if (startDaewun === -1 || endDaewun === -1) {
  console.error("ny_daewun_flow or ny_seoun_analysis not found");
  process.exit(1);
}

const newDaewunCode = `case "ny_daewun_flow": {
        const dayStemElVal = sajuInfo?.day?.stemEl;
        let harmonyVal = 70;
        let stressVal = 60;
        let opportunityVal = 75;

        if (dayStemElVal === "수" || dayStemElVal === "水") {
          harmonyVal = 85; stressVal = 45; opportunityVal = 90;
        } else if (dayStemElVal === "금" || dayStemElVal === "金") {
          harmonyVal = 75; stressVal = 75; opportunityVal = 80;
        } else if (dayStemElVal === "화" || dayStemElVal === "火") {
          harmonyVal = 50; stressVal = 85; opportunityVal = 55;
        } else if (dayStemElVal === "목" || dayStemElVal === "木") {
          harmonyVal = 65; stressVal = 70; opportunityVal = 70;
        } else {
          harmonyVal = 80; stressVal = 50; opportunityVal = 75;
        }

        const woodCount = sajuInfo?.elements?.목 || 0;
        const fireCount = sajuInfo?.elements?.화 || 0;
        const waterCount = sajuInfo?.elements?.수 || 0;
        const metalCount = sajuInfo?.elements?.금 || 0;

        let daewunAnalysis = "";
        if (fireCount >= 3 || (fireCount + woodCount) >= 5) {
          daewunAnalysis = \`의뢰인 \${name}님의 사주 원국은 이미 목(木)과 화(火)의 에너지가 강성하여 내적인 열기와 양기가 매우 높은 구조를 나타냅니다. 여기에 2026년 병오년의 천지합화 불꽃이 가세하게 되면 사주 전체의 온도가 임계점 이상으로 치솟아 쉽게 조급해지고 성급하게 확장을 결정하거나 홧김에 직장을 이탈할 리스크가 짙어집니다. 따라서 대운의 순행 흐름 속에서 귀하가 수립해야 할 최고의 전략은 무리한 신규 판 벌이기를 철저히 지양하고, 감정을 제어하며 리스크 방어에 올인하는 보수적 수성 전술입니다.\`;
        } else if (waterCount >= 2) {
          daewunAnalysis = \`의뢰인 \${name}님의 사주 원국에는 세운의 뜨거운 불길을 다스리고 냉철하게 조율해 줄 맑고 깊은 수(水) 기운이 든든하게 자리 잡고 있습니다. 이는 2026년의 거대한 용광로 불씨가 다가오더라도 귀하의 내적인 수기가 이를 수화기제(수화기제: 물과 불의 조화로운 안착)의 흐름으로 매끄럽게 통제하여, 혼란 속에서도 확실한 이익 마진을 선점하고 장기적인 문서 자산으로 치환해내는 인생의 실질적 번영과 도약의 무대가 열리게 됨을 뜻합니다. 자신감 있게 주도권을 쥐고 나아가십시오.\`;
        } else if (metalCount >= 2) {
          daewunAnalysis = \`의뢰인 \${name}님의 사주 원국에는 단단하고 이성적인 금(金) 기운이 뼈대를 이루고 있습니다. 병오년의 맹렬한 불꽃은 귀하의 원석을 용광로에 넣어 명검으로 완성해나가는 관성(관성)의 제련 작용을 강력하게 시작합니다. 공적인 지위 획득, 책임의 막중함, 혹은 커리어 압박이 매우 거세게 주어지겠지만, 이 제련 기간을 끈기 있게 견디고 원칙을 지켜 버텨낸다면 연말에는 누구도 부정할 수 없는 찬란한 지위와 명예를 탈환하게 되는 대운의 통과의례입니다. 명검이 되는 고통을 즐기며 뚝심 있게 나아가십시오.\`;
        } else {
          daewunAnalysis = \`의뢰인 \${name}님의 사주 원국은 어느 한 기운이 무리하게 쏠리지 않고 음양오행의 에너지가 비교적 부드럽고 균형 있게 순환하는 명조입니다. 2026년의 거센 천지합화 불길이 찾아오더라도 사주 원국의 흙(土) 기운과 상생 기맥이 불길의 세기를 차분하게 흡수하여(화생토, 토생금), 일시적인 마찰이나 환경 변화가 유도되더라도 빠르게 원래의 안정을 되찾는 복원력을 유감없이 보여줄 것입니다. 큰 도박을 피하고 자신의 본업에 집중하면 가장 순탄한 성장을 이룰 것입니다.\`;
        }

        return wrapLock(
          <div className="space-y-6 py-4">
            <div className="text-center space-y-2 mb-8">
              <span className="text-xs text-[#A3845B] font-bold block">생애 대운(大運)</span>
              <h2 className="font-myeongjo text-2xl font-bold text-[#1A1A1A]">운명의 거대한 강물, 10년 대운과 신년의 융합</h2>
              <div className="w-16 h-0.5 bg-[#A3845B]/30 mx-auto my-1" />
            </div>

            {/* 프리미엄 시각화 1: 대운-세운 상호작용 에너지 튜브 흐름도 (SVG) */}
            <div className="bg-white border border-[#E2DDD5] rounded-xl p-5 shadow-sm space-y-4">
              <span className="font-bold text-xs text-[#8A6F4C] block">🌀 대운(大運) &amp; 세운(歲運) 에너지 조화 튜브</span>
              <div className="relative h-14 bg-gray-50 rounded-lg flex items-center justify-between px-6 border border-gray-100">
                <div className="flex flex-col text-left">
                  <span className="text-[9px] text-gray-400">10년 주기</span>
                  <span className="text-xs font-bold text-gray-800">대운 환경</span>
                </div>
                <div className="flex-1 mx-4 h-6 relative">
                  <svg className="w-full h-full" viewBox="0 0 100 20" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="tubeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#A3845B" />
                        <stop offset="50%" stopColor="#E2DDD5" />
                        <stop offset="100%" stopColor="#DC2626" />
                      </linearGradient>
                    </defs>
                    <path d="M 0 10 Q 25 2, 50 10 T 100 10" fill="none" stroke="url(#tubeGrad)" strokeWidth="4" strokeLinecap="round" />
                    <circle cx="50" cy="10" r="4" fill="#8B221E" />
                  </svg>
                </div>
                <div className="flex flex-col text-right">
                  <span className="text-[9px] text-gray-400">2026 병오년</span>
                  <span className="text-xs font-bold text-red-600">세운 불꽃</span>
                </div>
              </div>
            </div>

            {/* 프리미엄 시각화 2: 신년 대운 융합 지표 */}
            <div className="bg-[#FAF8F5] border border-[#E2DDD5] rounded-xl p-5 space-y-3">
              <span className="font-bold text-xs text-[#8A6F4C] block">📊 2026 신년 대운 조율 지표</span>
              <div className="space-y-2 text-[9px] font-semibold text-gray-700">
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span>에너지 융합 조화도</span>
                    <span className="text-emerald-700">\${harmonyVal}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-600 rounded-full" style={{ width: \`\${harmonyVal}%\` }} />
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span>신년 기회 포착률</span>
                    <span className="text-blue-700">\${opportunityVal}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-600 rounded-full" style={{ width: \`\${opportunityVal}%\` }} />
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span>기류 과열 스트레스</span>
                    <span className="text-red-600">\${stressVal}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-red-600 rounded-full" style={{ width: \`\${stressVal}%\` }} />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white border border-[#E2DDD5] rounded-lg p-6 space-y-4 shadow-sm text-xs leading-relaxed font-light text-gray-700 font-traditional">
              <p className="text-justify font-light">
                명리학에서 흔히 말하는 대운(大運)이란 '갑자기 찾아오는 엄청나게 좋은 대박 행운'이 아니라, 10년마다 순환하며 바뀌는 <strong>내 인생의 거대한 기후적 환경과 무대</strong>를 의미합니다.
              </p>
              <p className="text-justify font-light">
                쉽게 말해 대운은 내가 운전해 가야 하는 도로의 포장 상태나 계절적 계절(봄·여름·가을·겨울)과 같으며, 매년 들어오는 세운(歲運)은 그 계절 위에서 날씨 변화처럼 매일 요동치는 비바람과 태양에 비유할 수 있습니다. 내가 달리는 고속도로(대운)가 비포장도로라면 아무리 맑은 날씨의 세운을 만나더라도 속도를 내기 어렵고, 도로 상태가 매끄러운 8차선 아스팔트 대운을 지나고 있다면 일시적으로 태풍이나 눈비(나쁜 세운)가 찾아오더라도 가볍게 이겨내며 안정을 유지할 수 있는 이치입니다.
              </p>
              <p className="text-justify font-light">
                {daewunAnalysis}
              </p>
              <div className="bg-[#FAF7F0] p-4 rounded border border-[#E2DDD5]/60 text-center text-[11px] font-semibold text-gray-800">
                💡 내 인생의 대세 대운을 면밀하게 이해하고, 세운의 기후 변화에 유연하게 옷을 갈아입는 자만이 무모한 질주를 차단하고 다가올 10년의 경제적·신체적 안정을 견고하게 수호할 수 있습니다.
              </div>
            </div>
          </div>,
          "생애 대운 흐름과 세운의 융합 분석"
        );
      }

      `;

content = content.slice(0, startDaewun) + newDaewunCode + content.slice(endDaewun);

// 4. ny_seoun_analysis 치환
const startSeoun = content.indexOf('case "ny_seoun_analysis":');
const endSeoun = content.indexOf('case "ny_stem_harmony":');

if (startSeoun === -1 || endSeoun === -1) {
  console.error("ny_seoun_analysis or ny_stem_harmony not found");
  process.exit(1);
}

const newSeounCode = `case "ny_seoun_analysis": {
        const speedAngle = -180 + (92 / 100) * 180;
        const rad = speedAngle * Math.PI / 180;
        const needleX = 100 + 60 * Math.cos(rad);
        const needleY = 90 + 60 * Math.sin(rad);

        const dayStemElVal = sajuInfo?.day?.stemEl;
        let seounPersonalizedDesc = "";
        
        if (dayStemElVal === "목") {
          seounPersonalizedDesc = \`이 천지합화의 불꽃 기맥은 목(木) 일간인 \${name}님에게는 내면에 품은 재능과 언어, 기획력을 힘차게 뿜어내는 식상(食傷)의 활성화를 이끕니다. 오랫동안 준비해온 전문 지식을 마케팅하거나 독자적 아이디어를 상용화하기에 대단히 유리한 해입니다. 다만, 불길이 내 뿌리와 수분을 과도하게 말려버릴 수 있으므로 감정적 조급증이나 상열감(번아웃)을 슬기롭게 차단해야 합니다. 상반기(음력 4~6월)에는 말을 아끼고 내실을 기하는 브레이크 장치가 최고의 개운 비방입니다.\`;
        } else if (dayStemElVal === "화") {
          seounPersonalizedDesc = \`이 천지합화의 불꽃 기맥은 화(火) 일간인 \${name}님에게는 나와 같은 불이 거대하게 동행하는 비겁(比劫)의 과열을 이끕니다. 자아 강도가 우주 끝까지 팽창하여 누군가의 간섭을 차단하고 1인 창업이나 독립을 꾀하려는 에너지가 폭발합니다. 단독 선두로 나서는 성취도에는 대길하나, 극도로 곤두선 자존심 때문에 가장 소중한 귀인이나 배우자를 밀어내고, 동업 또는 모험 투자를 감행해 큰 손재수를 입는 군겁쟁재(群劫爭財)의 리스크를 단호하게 통제하셔야 합니다.\`;
        } else if (dayStemElVal === "토") {
          seounPersonalizedDesc = \`이 천지합화의 불꽃 기맥은 토(土) 일간인 \${name}님에게는 거대한 대지를 따뜻하게 굳혀주는 인성(印星)의 막강한 생조로 작용합니다. 학위 취득, 승진 시험 합격, 혹은 아주 우량한 계약 문서를 안정적으로 취득하여 평생의 기반을 닦는 상서로운 흐름입니다. 다만, 내 영혼이 너무 편안하고 든든하여 행동을 미루거나 생각의 함정에 갇혀 관망만 하다 골든타임을 놓칠 수 있으니, 확실한 계획을 수립했다면 망설이지 않고 즉각 몸을 움직이는 돌파력을 병행하십시오.\`;
        } else if (dayStemElVal === "금") {
          seounPersonalizedDesc = \`이 천지합화의 불꽃 기맥은 금(金) 일간인 \${name}님에게는 거친 불길로 무쇠를 완벽한 명검으로 제련해 내는 관성(官星)의 시험대로 작동합니다. 직위 상승, 공적 책임의 확대, 가문의 명예 등 삶의 뼈대를 굳건히 세우는 찬란한 기회가 옵니다. 단, 제련 과정에서의 관성 스트레스와 정신적 건조증이 상당하므로 뼈, 관절, 기관지 건강을 철저히 사수해야 합니다. 무리한 자금 조달이나 이자 대출을 지양하고 내적인 연착륙을 지향하는 것이 명검이 되는 지름길입니다.\`;
        } else {
          seounPersonalizedDesc = \`이 천지합화의 불꽃 기맥은 수(水) 일간인 \${name}님에게는 물이 불을 가두고 성과를 낚아채는 재성(財星)의 보물 창고가 열림을 뜻합니다. 평생 중 가장 큰 재물적 파동 och 투자 회수, 금전 계약 성취의 역동적인 판이 짜이게 됩니다. 단, 병오년의 불꽃은 산 전체를 태울 만큼 거대하므로, 내 이성적인 통제력과 확실한 현금 잔고 수비가 병행되지 않은 채 성급히 불타기 투자를 시작하면 불길에 내 물줄기가 전부 증발하는 낭패를 보니, 단계적으로 이익을 현금 자산으로 수성하십시오.\`;
        }

        return wrapLock(
          <div className="space-y-6 py-4">
            <div className="text-center space-y-2 mb-8">
              <span className="text-xs text-[#A3845B] font-bold block">2026 병오년(丙午年)</span>
              <h2 className="font-myeongjo text-2xl font-bold text-[#1A1A1A]">천지합화(天地合火) - 태양과 용광로의 역동적 서사</h2>
              <div className="w-16 h-0.5 bg-[#A3845B]/30 mx-auto my-1" />
            </div>

            {/* 프리미엄 시각화 1: 화기 팽창도 스피도미터 */}
            <div className="bg-white border border-[#E2DDD5] rounded-xl p-5 shadow-sm flex flex-col items-center">
              <span className="font-bold text-xs text-[#8A6F4C] mb-2">🔥 2026 병오년 세운 화기(火氣) 팽창도</span>
              <div className="relative w-[180px] h-[105px]">
                <svg viewBox="0 0 200 110" className="w-full h-full">
                  <defs>
                    <linearGradient id="gaugeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#3B82F6" />
                      <stop offset="50%" stopColor="#F59E0B" />
                      <stop offset="100%" stopColor="#EF4444" />
                    </linearGradient>
                  </defs>
                  <path d="M 25 90 A 75 75 0 0 1 175 90" fill="none" stroke="#F3F4F6" strokeWidth="12" strokeLinecap="round" />
                  <path d="M 25 90 A 75 75 0 0 1 175 90" fill="none" stroke="url(#gaugeGrad)" strokeWidth="12" strokeLinecap="round" strokeDasharray="235" strokeDashoffset="18" />
                  
                  <circle cx="100" cy="90" r="5" fill="#1A1A1A" />
                  <line x1="100" y1="90" x2={needleX} y2={needleY} stroke="#1A1A1A" strokeWidth="2.5" strokeLinecap="round" />
                  
                  <text x="100" y="80" textAnchor="middle" fontSize="13" fontWeight="bold" fill="#8B221E">92% 극대화</text>
                  <text x="25" y="105" textAnchor="middle" fontSize="8" fill="#9CA3AF">안정</text>
                  <text x="175" y="105" textAnchor="middle" fontSize="8" fill="#EF4444">임계(팽창)</text>
                </svg>
              </div>
              <p className="text-[9px] text-gray-400 font-light mt-1">
                * 올해 천지합화(天地合火) 기운에 의해 우주적 열팽창도가 임계치에 다다라 자아 및 감정이 과열되기 쉽습니다.
              </p>
            </div>

            {/* 프리미엄 시각화 2: 4대 분야별 신년 운세 등급 카드 */}
            <div className="bg-[#FAF8F5] border border-[#E2DDD5] rounded-xl p-5 space-y-3">
              <span className="font-bold text-xs text-[#8A6F4C] block">📊 2026 분야별 길흉 대조 카드</span>
              <div className="grid grid-cols-4 gap-2 text-center text-[9px] font-bold">
                <div className="bg-white border border-[#E2DDD5] p-2.5 rounded shadow-sm">
                  <span className="text-gray-400 block font-normal mb-1">🪙 재물운</span>
                  <span className="bg-emerald-50 text-emerald-800 px-1 py-0.5 rounded block">대길 (大吉)</span>
                </div>
                <div className="bg-white border border-[#E2DDD5] p-2.5 rounded shadow-sm">
                  <span className="text-gray-400 block font-normal mb-1">💼 직업운</span>
                  <span className="bg-blue-50 text-blue-800 px-1 py-0.5 rounded block">상승 (吉)</span>
                </div>
                <div className="bg-white border border-[#E2DDD5] p-2.5 rounded shadow-sm">
                  <span className="text-gray-400 block font-normal mb-1">🌿 건강운</span>
                  <span className="bg-red-50 text-red-800 px-1 py-0.5 rounded block">경고 (凶)</span>
                </div>
                <div className="bg-white border border-[#E2DDD5] p-2.5 rounded shadow-sm">
                  <span className="text-gray-400 block font-normal mb-1">🤝 대인운</span>
                  <span className="bg-amber-50 text-amber-800 px-1 py-0.5 rounded block">조율 (平)</span>
                </div>
              </div>
            </div>

            <div className="bg-white border border-[#E2DDD5] rounded-lg p-6 space-y-4 shadow-sm text-xs leading-relaxed font-light text-gray-700 font-traditional">
              <div className="border-l-4 border-[#8B221E] pl-4 py-1">
                <h4 className="font-myeongjo text-sm font-bold text-gray-800">하늘과 대지를 붉게 태우는 거대한 에너지</h4>
                <p className="text-[11px] text-gray-500 mt-1">천간 丙火(태양)와 지지 午火(용광로)가 일으키는 극단적 양기(陽氣)의 절정</p>
              </div>
              <p className="text-justify font-light">
                2026년 병오년은 하늘의 환하고 눈부신 태양이자 만물을 비추는 순수 불꽃인 <strong>병화(丙火)</strong>와 지상의 거대한 용광로이자 쉬지 않고 거칠게 질주하는 준마인 <strong>오화(午火)</strong>가 위아래로 하나를 이루며 다가오는 격정적인 해입니다. 명리학에서는 이처럼 천간과 지지가 모두 화(火) 기운으로 강력하게 결합한 형세를 <strong>천지합화(天地合火)</strong>라 칭하며, 우주의 팽창력 och 열정이 극한에 다다르는 시기로 정의합니다.
              </p>
              <p className="text-justify font-light">
                {seounPersonalizedDesc}
              </p>
              <p className="text-justify font-light">
                이 맹렬한 기맥 하에서는 온 세상의 라이프사이클 속도가 무서우리만치 빨라집니다. 감추어졌던 어두운 위선이나 묵은 조직의 모순들이 태양 아래 적나라하게 폭로되며 강제적인 개혁과 정리가 단행되고, 문화, 기술, IT 산업에서는 기존 패러다임을 뒤흔드는 파괴적 혁신이 불길처럼 번집니다. 개인 역시 그간 억눌러 왔던 자립심과 열망이 폭발하여 이직, 독립, 새로운 공부나 비즈니스에 도전하고자 하는 마음의 역동성이 최대로 상승하게 됩니다.
              </p>
            </div>
          </div>,
          "병오년 세운 기류 총평"
        );
      }
`;

content = content.slice(0, startSeoun) + newSeounCode + content.slice(endSeoun);

fs.writeFileSync(targetFile, content, 'utf8');
console.log("Successfully updated renderNewYearPageContent.js with fully dynamic and personalized texts!");
