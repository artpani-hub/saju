const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'src', 'app', 'result', 'page.js');
let content = fs.readFileSync(filePath, 'utf-8');

// We escape the template literal placeholders so that Node.js doesn't try to evaluate them inside the script.
const newCases = `
      case "ny_intro_saju":
        return wrapLock(
          <div className="space-y-6 py-4">
            <div className="text-center space-y-2 mb-8">
              <span className="text-xs text-[#A3845B] font-bold block">명조(命造) 분석</span>
              <h2 className="font-myeongjo text-2xl font-bold text-[#1A1A1A]">의뢰인 명조 분석과 사주 원국</h2>
              <div className="w-16 h-0.5 bg-[#A3845B]/30 mx-auto my-1" />
            </div>
            <div className="bg-white border border-[#E2DDD5] rounded-lg p-6 space-y-6 shadow-sm text-xs leading-relaxed font-light text-gray-700 font-traditional">
              <p>
                의뢰인 \${name}님의 사주 팔자(四柱八字) 원국 구성입니다. 사주는 연(年), 월(月), 일(日), 시(時)의 네 기둥과 여덟 글자로 이루어지며, 나의 타고난 기질과 에너지 흐름을 보여줍니다.
              </p>
              <div className="grid grid-cols-4 gap-2 text-center font-bold">
                <div className="bg-[#FAF7F0] p-2 rounded border border-[#E2DDD5]/50">
                  <div className="text-[10px] text-gray-400">시주(時柱)</div>
                  <div className="text-sm text-[#A3845B] mt-1">\${sajuInfo.hour.stem}\${sajuInfo.hour.branch}</div>
                  <div className="text-[9px] text-gray-500 font-light">\${sajuInfo.hour.stemEl}/\${sajuInfo.hour.branchEl}</div>
                  <div className="text-[8px] text-gray-400 mt-1 font-normal">노년·자식운</div>
                </div>
                <div className="bg-[#FAF7F0] p-2 rounded border border-[#E2DDD5]/50 border-2 border-brass">
                  <div className="text-[10px] text-brass">일주(日柱)</div>
                  <div className="text-sm text-brass mt-1">\${sajuInfo.day.stem}\${sajuInfo.day.branch}</div>
                  <div className="text-[9px] text-brass font-light">\${sajuInfo.day.stemEl}/\${sajuInfo.day.branchEl}</div>
                  <div className="text-[8px] text-brass mt-1 font-normal">중년·배우자궁</div>
                </div>
                <div className="bg-[#FAF7F0] p-2 rounded border border-[#E2DDD5]/50">
                  <div className="text-[10px] text-gray-400">월주(月柱)</div>
                  <div className="text-sm text-[#A3845B] mt-1">\${sajuInfo.month.stem}\${sajuInfo.month.branch}</div>
                  <div className="text-[9px] text-gray-500 font-light">\${sajuInfo.month.stemEl}/\${sajuInfo.month.branchEl}</div>
                  <div className="text-[8px] text-gray-400 mt-1 font-normal">청년·사회운</div>
                </div>
                <div className="bg-[#FAF7F0] p-2 rounded border border-[#E2DDD5]/50">
                  <div className="text-[10px] text-gray-400">년주(年柱)</div>
                  <div className="text-sm text-[#A3845B] mt-1">\${sajuInfo.year.stem}\${sajuInfo.year.branch}</div>
                  <div className="text-[9px] text-gray-500 font-light">\${sajuInfo.year.stemEl}/\${sajuInfo.year.branchEl}</div>
                  <div className="text-[8px] text-gray-400 mt-1 font-normal">초년·조상궁</div>
                </div>
              </div>
              <p className="border-t border-[#E2DDD5]/60 pt-3">
                특히 일간(日干: \${sajuInfo.day.stem})은 나 자신을 상징하는 핵심적인 글자이며, 2026년 병오년 세운의 유입에 따라 가장 역동적으로 반응하게 됩니다.
              </p>
            </div>
          </div>,
          "의뢰인 명조 분석과 사주 원국"
        );

      case "ny_daewun_flow":
        return wrapLock(
          <div className="space-y-6 py-4">
            <div className="text-center space-y-2 mb-8">
              <span className="text-xs text-[#A3845B] font-bold block">생애 대운(大運)</span>
              <h2 className="font-myeongjo text-2xl font-bold text-[#1A1A1A]">대세 대운 흐름과 세운의 융합</h2>
              <div className="w-16 h-0.5 bg-[#A3845B]/30 mx-auto my-1" />
            </div>
            <div className="bg-white border border-[#E2DDD5] rounded-lg p-6 space-y-4 shadow-sm text-xs leading-relaxed font-light text-gray-700 font-traditional">
              <p>
                대운(大運)이란 10년 주기로 변화하는 나의 큰 운명적 환경을 뜻합니다. 매년 들어오는 세운(歲運)은 이 대운이라는 거대한 무대 위에서 춤을 추는 댄서와 같습니다.
              </p>
              <p>
                의뢰인 \${name}님의 현재 대운 기류는 2026년 병오년의 천지합화(天地合火) 기운과 만나 삶의 우선순위를 재배치하게 만듭니다. 대운의 지지가 화(火) 기운을 지지하느냐, 혹은 제어하느냐에 따라 성공의 속도와 수호의 강도가 결정됩니다.
              </p>
              <div className="bg-[#FAF7F0] p-4 rounded border border-[#E2DDD5]/60 text-center text-[11px] font-semibold text-gray-800">
                💡 올해는 장기적인 커리어 변화를 추진하기 전, 현재 위치에서 대운의 지지적 안정을 확보하는 것이 가장 현명합니다.
              </div>
            </div>
          </div>,
          "생애 대운 흐름과 세운의 융합 분석"
        );

      case "ny_elements_supplement":
        return wrapLock(
          <div className="space-y-6 py-4">
            <div className="text-center space-y-2 mb-8">
              <span className="text-xs text-[#A3845B] font-bold block">오행 보완 비책</span>
              <h2 className="font-myeongjo text-2xl font-bold text-[#1A1A1A]">부족한 오행을 채우는 생활 습관</h2>
              <div className="w-16 h-0.5 bg-[#A3845B]/30 mx-auto my-1" />
            </div>
            <div className="bg-white border border-[#E2DDD5] rounded-lg p-6 space-y-4 shadow-sm text-xs leading-relaxed font-light text-gray-700 font-traditional">
              <p>
                2026년 병오년에는 화(火) 기운이 극단적으로 팽창하여 수(水)와 금(金)이 쉽게 메마릅니다. 일상에서 부족한 기운을 인위적으로 보완해 주는 비책입니다.
              </p>
              <div className="space-y-3 pt-2">
                <div className="border-b border-[#E2DDD5]/50 pb-2">
                  <span className="font-bold text-[#5F7A68]">🌊 수(水) 기운 보완법:</span>
                  <p className="text-gray-500 mt-1">취침 전 반신욕이나 족욕을 통해 체내 순환을 돕고, 하루 1.5L 이상의 수분을 지속적으로 섭취하십시오. 북쪽으로 머리를 두고 자는 것이 기류 안정에 좋습니다.</p>
                </div>
                <div>
                  <span className="font-bold text-[#8A6F4C]">🪙 금(金) 기운 보완법:</span>
                  <p className="text-gray-500 mt-1">메탈 소재의 시계나 은 액세서리를 착용하십시오. 업무 공간에는 금속 제 소품이나 정돈된 스틸 프레임 가구를 두는 것이 정신 집중을 돕습니다.</p>
                </div>
              </div>
            </div>
          </div>,
          "부족한 오행을 채우는 일상 개운법"
        );

      case "ny_mind_meditation":
        return wrapLock(
          <div className="space-y-6 py-4">
            <div className="text-center space-y-2 mb-8">
              <span className="text-xs text-[#A3845B] font-bold block">정신 수양 보감</span>
              <h2 className="font-myeongjo text-2xl font-bold text-[#1A1A1A]">조급함을 다스리는 마음가짐</h2>
              <div className="w-16 h-0.5 bg-[#A3845B]/30 mx-auto my-1" />
            </div>
            <div className="bg-white border border-[#E2DDD5] rounded-lg p-6 space-y-4 shadow-sm text-xs leading-relaxed font-light text-gray-700 font-traditional">
              <p>
                병오년의 강한 화(火) 기운은 마음속에 조급함과 불같은 분노, 충동성을 자극하기 쉽습니다. 감정 과열로 인한 실수를 방지하는 혜안 명상법입니다.
              </p>
              <div className="bg-[#FAF7F0] p-4 rounded border border-[#E2DDD5]/60 space-y-2">
                <p className="font-semibold text-[#8B221E]">🧘 하루 10분 마인드풀니스 실천:</p>
                <p className="text-[11px] text-gray-600 font-light">
                  아침 기상 직후 또는 잠들기 전 10분 동안 스마트폰을 멀리하고 숨을 깊게 들이쉬고 내쉬며, 타오르는 불길이 차가운 호수에 가라앉는 시각화를 진행하십시오. 호흡을 조절할 때 비로소 화기가 진정되고 차분한 이성이 돌아옵니다.
                </p>
              </div>
            </div>
          </div>,
          "스트레스 조율 및 정신 건강 명상 처방"
        );

      case "ny_season_spring":
        return wrapLock(
          <div className="space-y-6 py-4">
            <div className="text-center space-y-2 mb-8">
              <span className="text-xs text-[#A3845B] font-bold block">봄철 기류 전략</span>
              <h2 className="font-myeongjo text-2xl font-bold text-[#1A1A1A]">음력 1월~3월 계절별 행동 전략</h2>
              <div className="w-16 h-0.5 bg-[#A3845B]/30 mx-auto my-1" />
            </div>
            <div className="bg-white border border-[#E2DDD5] rounded-lg p-6 space-y-4 shadow-sm text-xs leading-relaxed font-light text-gray-700 font-traditional">
              <p>
                봄은 목(木)의 기운이 솟아나 화(火)의 불길을 지피기 시작하는 명리학적 인오축(寅午戌)의 시기입니다. 
              </p>
              <p>
                이 시기에는 성급한 도전을 피하고 기획서 작성, 시장 조사, 네트워크 형성에 집중하는 것이 좋습니다. 외부적인 확장은 최소화하되, 내적인 역량을 키우는 준비 운동을 완벽하게 끝내야 다가오는 뜨거운 여름에 성과를 극대화할 수 있습니다.
              </p>
            </div>
          </div>,
          "봄철 계절적 세부 기운과 전략"
        );

      case "ny_season_summer":
        return wrapLock(
          <div className="space-y-6 py-4">
            <div className="text-center space-y-2 mb-8">
              <span className="text-xs text-[#A3845B] font-bold block">여름철 기류 전략</span>
              <h2 className="font-myeongjo text-2xl font-bold text-[#1A1A1A]">음력 4월~6월 계절별 행동 전략</h2>
              <div className="w-16 h-0.5 bg-[#A3845B]/30 mx-auto my-1" />
            </div>
            <div className="bg-white border border-[#E2DDD5] rounded-lg p-6 space-y-4 shadow-sm text-xs leading-relaxed font-light text-gray-700 font-traditional">
              <p>
                여름은 사오미(巳午未)의 순수 화기가 폭발하는 병오년의 절정기이자 화기 과열 구간입니다.
              </p>
              <p>
                인간관계에서의 사소한 오해가 큰 구설로 비화되거나 홧김에 직장을 그만두는 충동적 판단의 위험이 높습니다. 중요 의사결정은 가을로 유보하고, 건강 면에서는 탈수 증세와 심혈관 질환에 특히 유의해야 하는 시기입니다.
              </p>
            </div>
          </div>,
          "여름철 계절적 세부 기운과 전략"
        );

      case "ny_season_autumn":
        return wrapLock(
          <div className="space-y-6 py-4">
            <div className="text-center space-y-2 mb-8">
              <span className="text-xs text-[#A3845B] font-bold block">가을철 기류 전략</span>
              <h2 className="font-myeongjo text-2xl font-bold text-[#1A1A1A]">음력 7월~9월 계절별 행동 전략</h2>
              <div className="w-16 h-0.5 bg-[#A3845B]/30 mx-auto my-1" />
            </div>
            <div className="bg-white border border-[#E2DDD5] rounded-lg p-6 space-y-4 shadow-sm text-xs leading-relaxed font-light text-gray-700 font-traditional">
              <p>
                가을은 신유술(申酉戌) 금(金)의 기운이 들어와 타오르던 열기를 가라앉히고 실질적인 열매(결실)를 수확하는 황금기입니다.
              </p>
              <p>
                그동안 밀어붙였던 일들이 결실을 맺거나 문서운, 계약운이 대단히 유리하게 작용합니다. 이직이나 연봉 협상, 자산의 실질적 투자 등은 이 가을의 정밀한 타이밍을 공략해야 가장 큰 이득을 취할 수 있습니다.
              </p>
            </div>
          </div>,
          "가을철 계절적 세부 기운과 전략"
        );

      case "ny_season_winter":
        return wrapLock(
          <div className="space-y-6 py-4">
            <div className="text-center space-y-2 mb-8">
              <span className="text-xs text-[#A3845B] font-bold block">겨울철 기류 전략</span>
              <h2 className="font-myeongjo text-2xl font-bold text-[#1A1A1A]">음력 10월~12월 계절별 행동 전략</h2>
              <div className="w-16 h-0.5 bg-[#A3845B]/30 mx-auto my-1" />
            </div>
            <div className="bg-white border border-[#E2DDD5] rounded-lg p-6 space-y-4 shadow-sm text-xs leading-relaxed font-light text-gray-700 font-traditional">
              <p>
                겨울은 해자축(亥子丑) 수(水)의 기운이 도래하여 병오년의 잔열을 차분하게 정리하고 차세대 운세로 교대하는 재충전기입니다.
              </p>
              <p>
                자금을 안정적으로 갈무리하고 무리한 투자에서 손을 떼며 내실을 다질 때입니다. 차기 연도인 2027년 정미년(丁未年)의 흐름을 미리 설계하고 건강을 회복하기에 최상의 적기입니다.
              </p>
            </div>
          </div>,
          "겨울철 계절적 세부 기운과 전략"
        );

      case "ny_wealth_portfolio":
        return wrapLock(
          <div className="space-y-6 py-4">
            <div className="text-center space-y-2 mb-8">
              <span className="text-xs text-[#A3845B] font-bold block">재무 포트폴리오</span>
              <h2 className="font-myeongjo text-2xl font-bold text-[#1A1A1A]">오행 성향 맞춤형 신년 재테크 조언</h2>
              <div className="w-16 h-0.5 bg-[#A3845B]/30 mx-auto my-1" />
            </div>
            <div className="bg-white border border-[#E2DDD5] rounded-lg p-6 space-y-4 shadow-sm text-xs leading-relaxed font-light text-gray-700 font-traditional">
              <p>
                의뢰인 \${name}님의 사주 오행 배치를 토대로 제안하는 2026년 경제 활동의 맥락과 방향성입니다.
              </p>
              <div className="border-l-4 border-[#8B221E] pl-4 py-1">
                <h4 className="font-semibold text-gray-800">성장주보다는 가치주, 공격보다는 방어</h4>
              </div>
              <p>
                올해는 화기 과잉으로 주식 시장이나 부동산 시장의 급등락이 심화될 것입니다. 공격적인 레버리지 투자는 손재수를 강하게 부르므로 예적금 비율을 높이고 채권, 금과 같은 안전자산에 분산 배치하는 것이 자산 방어에 큰 도움이 됩니다.
              </p>
              <p>
                특히 나만의 수호 오행인 수(水)와 금(金) 기운을 금융 비즈니스와 매치시켜 보십시오. 단기적 투기를 차단하고 배당이 꾸준하게 들어오는 월배당 리츠나 대형 지수 ETF 위주로 포트폴리오를 재구성하는 것이 이번 세운의 흔들림을 극복하고 자산을 안전하게 2배 이상 키울 비결입니다.
              </p>
            </div>
          </div>,
          "오행별 추천 투자 스타일 및 재무 가이드"
        );

      case "ny_career_detailed":
        return wrapLock(
          <div className="space-y-6 py-4">
            <div className="text-center space-y-2 mb-8">
              <span className="text-xs text-[#A3845B] font-bold block">이직 및 승진</span>
              <h2 className="font-myeongjo text-2xl font-bold text-[#1A1A1A]">신년 직무 및 신분 변화 타이밍 가이드</h2>
              <div className="w-16 h-0.5 bg-[#A3845B]/30 mx-auto my-1" />
            </div>
            <div className="bg-white border border-[#E2DDD5] rounded-lg p-6 space-y-4 shadow-sm text-xs leading-relaxed font-light text-gray-700 font-traditional">
              <p>
                의뢰인 \${name}님의 올해 승진, 이직, 시험 통과 등 명예/커리어 운세의 구체적인 핵심 기간을 짚어드립니다.
              </p>
              <div className="space-y-2 bg-[#FAF7F0] p-4 rounded border border-[#E2DDD5]/60">
                <p><strong>• 골든 타임 (승진/영전/합격):</strong> 음력 8월(정유월)과 음력 10월(기해월)에 내 신분이 상승하는 귀중한 기회가 들어옵니다.</p>
                <p><strong>• 예방 타임 (조직 갈등/구설):</strong> 음력 5월(갑오월)은 극단적인 화기 중첩으로 인해 감정적 한계를 느끼거나 돌발 사직서를 충동적으로 내던질 위험이 있으니 극히 유의하십시오.</p>
              </div>
              <p>
                상반기에는 내부 조직 정비에 주력하고, 제안 수락이나 이력서 제출 등 적극적인 구직 활동은 하반기(음력 7월 이후)에 실행해야 후회 없는 결정을 이끌어낼 수 있습니다.
              </p>
            </div>
          </div>,
          "이직 및 승진 상세 타이밍 가이드"
        );

      case "ny_social_life":
        return wrapLock(
          <div className="space-y-6 py-4">
            <div className="text-center space-y-2 mb-8">
              <span className="text-xs text-[#A3845B] font-bold block">대인관계 조율</span>
              <h2 className="font-myeongjo text-2xl font-bold text-[#1A1A1A]">신년 인맥 관리 및 대인관계 조율</h2>
              <div className="w-16 h-0.5 bg-[#A3845B]/30 mx-auto my-1" />
            </div>
            <div className="bg-white border border-[#E2DDD5] rounded-lg p-6 space-y-4 shadow-sm text-xs leading-relaxed font-light text-gray-700 font-traditional">
              <p>
                병오년은 대인관계의 리셋 현상이 자주 일어나는 기류를 가집니다. 올해 나에게 등대가 되어줄 귀인의 띠와 경계해야 할 띠에 관한 정보입니다.
              </p>
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="bg-emerald-50/50 p-3 rounded border border-emerald-100">
                  <span className="font-bold text-emerald-800">👍 올해의 귀인 (띠):</span>
                  <p className="text-[11px] text-emerald-950 mt-1"><strong>말띠, 양띠, 개띠</strong>가 나에게 결정적인 경제적·정신적 조언을 건네는 파트너입니다. 이들의 묵직한 조율력이 불의 날카로움을 제어합니다.</p>
                </div>
                <div className="bg-rose-50/50 p-3 rounded border border-rose-100">
                  <span className="font-bold text-rose-800">⚠️ 경계해야 할 상대:</span>
                  <p className="text-[11px] text-rose-950 mt-1"><strong>쥐띠</strong>와는 사소한 이권 문제로 큰 다툼이 날 수 있으니 문서 계약 시 두 번 검토하고 불필요한 사교모임을 최소화하십시오.</p>
                </div>
              </div>
            </div>
          </div>,
          "신년 인맥 관리 및 대인관계 조율"
        );

      case "ny_roadmap_2030":
        return wrapLock(
          <div className="space-y-6 py-4">
            <div className="text-center space-y-2 mb-8">
              <span className="text-xs text-[#A3845B] font-bold block">2030 경술년(庚戌年)</span>
              <h2 className="font-myeongjo text-2xl font-bold text-[#1A1A1A]">2030년 경술년(庚戌年) 세운 로드맵</h2>
              <div className="w-16 h-0.5 bg-[#A3845B]/30 mx-auto my-1" />
            </div>
            <div className="bg-white border border-[#E2DDD5] rounded-lg p-6 space-y-4 shadow-sm text-xs leading-relaxed font-light text-gray-700 font-traditional">
              <p>
                2030년 경술년(庚戌年)은 천간에 강건한 금(金) 기운과 지지에 뜨거운 화기를 품은 술토(戌土)가 들어오는 해입니다.
              </p>
              <p>
                쇠를 담금질하여 마침내 보검으로 완성하는 중대한 결실의 해가 됩니다. 2026년부터 차근차근 다져온 커리어나 투자 자산이 이 시기에 비로소 명확한 현금 흐름으로 환원되어 경제적 독립의 기틀을 다지게 될 것입니다.
              </p>
            </div>
          </div>,
          "2030년 경술년(庚戌年) 세운 로드맵"
        );

      case "ny_roadmap_2031":
        return wrapLock(
          <div className="space-y-6 py-4">
            <div className="text-center space-y-2 mb-8">
              <span className="text-xs text-[#A3845B] font-bold block">2031 신해년(辛亥年)</span>
              <h2 className="font-myeongjo text-2xl font-bold text-[#1A1A1A]">2031년 신해년(辛亥年) 세운 로드맵</h2>
              <div className="w-16 h-0.5 bg-[#A3845B]/30 mx-auto my-1" />
            </div>
            <div className="bg-white border border-[#E2DDD5] rounded-lg p-6 space-y-4 shadow-sm text-xs leading-relaxed font-light text-gray-700 font-traditional">
              <p>
                2031년 신해년(辛亥年)은 하늘에 반짝이는 보석인 신금(辛金)과 땅에 유유히 흐르는 큰 물 해수(亥水)가 결합한 금수상생(金水相生)의 해입니다.
              </p>
              <p>
                명리학적으로 만물이 정화되고 평온함을 얻는 해이며, 의뢰인 \${name}님에게도 지난 5년간의 거친 풍파와 열정이 평화로운 일상과 가정의 안락함으로 치환되는 은혜로운 보상의 해가 될 것입니다.
              </p>
            </div>
          </div>,
          "2031년 신해년(辛亥年) 세운 로드맵"
        );

      case "ny_lucky_fashion":
        return wrapLock(
          <div className="space-y-6 py-4">
            <div className="text-center space-y-2 mb-8">
              <span className="text-xs text-[#A3845B] font-bold block">패션 스타일링</span>
              <h2 className="font-myeongjo text-2xl font-bold text-[#1A1A1A]">나의 사주 기운을 보완하는 외적 연출법</h2>
              <div className="w-16 h-0.5 bg-[#A3845B]/30 mx-auto my-1" />
            </div>
            <div className="bg-white border border-[#E2DDD5] rounded-lg p-6 space-y-4 shadow-sm text-xs leading-relaxed font-light text-gray-700 font-traditional">
              <p>
                옷차림과 컬러 배치는 가장 쉽고 즉각적으로 나의 기적 주파수를 바꾸는 실천법입니다. 외적 연출을 통해 내면의 품격과 운을 극대화해 보십시오.
              </p>
              <div className="space-y-3 pt-2">
                <div>
                  <span className="font-bold text-[#5F7A68]">👔 추천 의상 스타일:</span>
                  <p className="text-gray-500 mt-1">지나치게 화려한 원색 패턴은 피하고 네이비, 차콜, 화이트 톤의 깔끔하고 정돈된 미니멀 클래식 룩을 지향하십시오. 내적인 이성과 카리스마를 전달하여 구설을 방어하는 데 유리합니다.</p>
                </div>
                <div>
                  <span className="font-bold text-[#A3845B]">💍 액세서리 팁:</span>
                  <p className="text-gray-500 mt-1">심플한 스틸이나 실버 계열의 주얼리, 정갈한 금속 안경테를 매치하면 타인에게 정돈된 신뢰감을 대폭 높여 비즈니스적 딜을 성사시키는 데 결정적인 도움을 줍니다.</p>
                </div>
              </div>
            </div>
          </div>,
          "신년 패션 메이크업 스타일링 가이드"
        );

      case "ny_diet_presc":
        return wrapLock(
          <div className="space-y-6 py-4">
            <div className="text-center space-y-2 mb-8">
              <span className="text-xs text-[#A3845B] font-bold block">오행 섭생법</span>
              <h2 className="font-myeongjo text-2xl font-bold text-[#1A1A1A]">기운을 안정시키는 건강 체질 음식 가이드</h2>
              <div className="w-16 h-0.5 bg-[#A3845B]/30 mx-auto my-1" />
            </div>
            <div className="bg-white border border-[#E2DDD5] rounded-lg p-6 space-y-4 shadow-sm text-xs leading-relaxed font-light text-gray-700 font-traditional">
              <p>
                매일 입으로 들어가는 음식의 오행 성질은 오장육부의 열과 한기를 조율하는 기초 한의학적 개운 처방입니다.
              </p>
              <div className="bg-[#FAF7F0] p-4 rounded border border-[#E2DDD5]/60 space-y-2">
                <p><strong>• 수(水) 기운 보완 음식 (체내 건조 예방):</strong> 미역, 다시마 등 해조류와 검은콩, 흑임자, 제철 굴 요리를 즐겨 드십시오.</p>
                <p><strong>• 금(金) 기운 보완 음식 (호흡기/기관지 보호):</strong> 무, 도라지, 더덕 등 흰색 뿌리 채소를 섭취하여 폐와 위장의 기운을 보강하십시오.</p>
              </div>
              <p>
                불의 기운을 더 부추기는 캡사이신 위주의 지나치게 매운 음식이나 튀김류, 잦은 고도수의 과음은 가뜩이나 메말라 있는 위장을 상하게 하고 감정의 화기를 증폭시키므로 식단을 최대한 담백하고 가벼운 자연식 위주로 조율하십시오.
              </p>
            </div>
          </div>,
          "체질 맞춤형 오행 섭생 음식 처방"
        );
`;

const insertMarker = '      case "ny_final_blessing":';
const insertIndex = content.indexOf(insertMarker);

if (insertIndex === -1) {
  console.error("Marker not found!");
  process.exit(1);
}

// Write the script to execute cleanly
const configMarker = '  const getNewYearPagesConfiguration = (name, partnerName) => {';
const configEndMarker = '  const renderNewYearPageContent = (page, ctx) => {';

const configStartIndex = content.indexOf(configMarker);
const configEndIndex = content.indexOf(configEndMarker);

if (configStartIndex === -1 || configEndIndex === -1) {
  console.error("Config markers not found!");
  process.exit(1);
}

// Since the page.js is already modified with 51 pages config and empty bodies,
// we just need to replace the entire switch block from "ny_cover" to "ny_final_blessing".
// Let's perform a direct write of the updated file content.
// This is much safer and doesn't get messed up by template literals!

const finalConfig = `  const getNewYearPagesConfiguration = (name, partnerName) => {
    return [
      { page: 1, type: "ny_cover", title: "2026년 병오년(丙午年) 혜안당 정통 신수비결 표지" },
      { page: 2, type: "ny_preface", title: "새해를 맞이하는 마음가짐과 명리 서막" },
      { page: 3, type: "ny_intro_saju", title: "의뢰인 명조(命造) 분석과 오행 원국 배치" },
      { page: 4, type: "ny_daewun_flow", title: "생애 대운(大運)의 흐름과 2026년의 영향" },
      { page: 5, type: "ny_seoun_analysis", title: "병오년 천지합화(天地合火) 세운 총평" },
      { page: 6, type: "ny_stem_harmony", title: "일간(日干) 오행과 병오년 불꽃 기류 융합" },
      { page: 7, type: "ny_ilju_harmony", title: "일주(日柱)와 2026 세운의 합·충·형·파·해 진단" }, // 심화 (고급 제외 #1)
      { page: 8, type: "ny_elements_balance", title: "신년 오행 과잉/결핍 진단" },
      { page: 9, type: "ny_elements_supplement", title: "부족한 오행을 채우는 일상 개운법" },
      { page: 10, type: "ny_health_presc", title: "세운 기류 변화에 따른 신년 건강 처방" },
      { page: 11, type: "ny_mind_meditation", title: "스트레스 조율 및 정신 건강 명상 처방" },
      { page: 12, type: "ny_lucky_secrets", title: "병오년 맞춤 신년 행운 비방" },
      { page: 13, type: "ny_season_spring", title: "봄철(음력 1~3월) 계절적 세부 기운과 전략" },
      { page: 14, type: "ny_monthly", title: "음력 1월 상세 신수비결", monthNum: 1 },
      { page: 15, type: "ny_monthly", title: "음력 2월 상세 신수비결", monthNum: 2 },
      { page: 16, type: "ny_monthly", title: "음력 3월 상세 신수비결", monthNum: 3 },
      { page: 17, type: "ny_season_summer", title: "여름철(음력 4~6월) 계절적 세부 기운과 전략" },
      { page: 18, type: "ny_monthly", title: "음력 4월 상세 신수비결", monthNum: 4 },
      { page: 19, type: "ny_monthly", title: "음력 5월 상세 신수비결", monthNum: 5 },
      { page: 20, type: "ny_monthly", title: "음력 6월 상세 신수비결", monthNum: 6 },
      { page: 21, type: "ny_season_autumn", title: "가을철(음력 7~9월) 계절적 세부 기운과 전략" },
      { page: 22, type: "ny_monthly", title: "음력 7월 상세 신수비결", monthNum: 7 },
      { page: 23, type: "ny_monthly", title: "음력 8월 상세 신수비결", monthNum: 8 },
      { page: 24, type: "ny_monthly", title: "음력 9월 상세 신수비결", monthNum: 9 },
      { page: 25, type: "ny_season_winter", title: "겨울철(음력 10~12월) 계절적 세부 기운과 전략" },
      { page: 26, type: "ny_monthly", title: "음력 10월 상세 신수비결", monthNum: 10 },
      { page: 27, type: "ny_monthly", title: "음력 11월 상세 신수비결", monthNum: 11 },
      { page: 28, type: "ny_monthly", title: "음력 12월 상세 신수비결", monthNum: 12 },
      { page: 29, type: "ny_wealth_fortune", title: "신년 재물 및 사업운 분석" },
      { page: 30, type: "ny_wealth_portfolio", title: "오행별 추천 투자 스타일 및 재무 가이드" },
      { page: 31, type: "ny_career_fortune", title: "신년 직장 및 커리어 운세" },
      { page: 32, type: "ny_career_detailed", title: "이직 및 승진 상세 타이밍 가이드" },
      { page: 33, type: "ny_love_fortune", title: "신년 연애 및 가정운 주파수 조율" },
      { page: 34, type: "ny_social_life", title: "신년 인맥 관리 및 대인관계 조율" },
      { page: 35, type: "ny_study_fortune", title: "신년 학업 및 시험운 처방" },
      { page: 36, type: "ny_gossip_defense", title: "신년 구설 및 시비수 예방 수칙" },
      { page: 37, type: "ny_sinsal_active", title: "신년 3대 신살 작동 현황 분석" }, // 심화 (고급 제외 #2)
      { page: 38, type: "ny_gwiin_harmony", title: "신년 인연 및 귀인 조화 분석" },
      { page: 39, type: "ny_warning_period", title: "치명적인 액난 경보 및 방어 비책" }, // 심화 (고급 제외 #3)
      { page: 40, type: "ny_worry_solution", title: "고민 해결 맞춤형 솔루션" }, // 심화 (고급 제외 #4)
      { page: 41, type: "ny_roadmap_2027", title: "2027년 정미년(丁未年) 세운 로드맵" }, // 심화 (고급 제외 #5)
      { page: 42, type: "ny_roadmap_2028", title: "2028년 무신년(戊申年) 세운 로드맵" }, // 심화 (고급 제외 #6)
      { page: 43, type: "ny_roadmap_2029", title: "2029년 기유년(己酉年) 세운 로드맵" }, // 심화 (고급 제외 #7)
      { page: 44, type: "ny_roadmap_2030", title: "2030년 경술년(庚戌年) 세운 로드맵" },
      { page: 45, type: "ny_roadmap_2031", title: "2031년 신해년(辛亥年) 세운 로드맵" },
      { page: 46, type: "ny_action_rules", title: "신년 개운 실천 3대 행동 강령" },
      { page: 47, type: "ny_fengshui_interior", title: "신년 공간 풍수 인테리어 처방" }, // 심화 (고급 제외 #8)
      { page: 48, type: "ny_lucky_items", title: "신년 추천 수호 소품 리스트" },
      { page: 49, type: "ny_lucky_fashion", title: "신년 패션 메이크업 스타일링 가이드" },
      { page: 50, type: "ny_diet_presc", title: "체질 맞춤형 오행 섭생 음식 처방" },
      { page: 51, type: "ny_final_blessing", title: "병오년 성공 기원 마지막 축원문" }
    ];
  };`;

// We will write the file modification directly in JS and execute it.
const finalContent = content.substring(0, configStartIndex) + finalConfig + content.substring(configEndIndex, insertIndex) + newCases + content.substring(insertIndex);

fs.writeFileSync(filePath, finalContent, 'utf-8');
console.log("Enrichment script completed successfully without evaluation errors!");
