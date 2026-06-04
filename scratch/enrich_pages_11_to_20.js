const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'src', 'app', 'result', 'page.js');
let content = fs.readFileSync(filePath, 'utf-8');

// 1. Enrich Region A: case "ny_lucky_secrets" up to case "ny_wealth_fortune"
const startMarkerA = '      case "ny_lucky_secrets":';
const endMarkerA = '      case "ny_wealth_fortune":';

const startIndexA = content.indexOf(startMarkerA);
const endIndexA = content.indexOf(endMarkerA);

if (startIndexA === -1 || endIndexA === -1) {
  console.error("Region A markers not found in result/page.js!");
  process.exit(1);
}

const enrichedA = `      case "ny_lucky_secrets":
        const luckyColor = prescriptions[0]?.color || "밝은 계열";
        const luckyDir = prescriptions[0]?.direction || "북쪽";
        const luckyNum = prescriptions[0]?.number || "1, 6";
        const luckyItem = prescriptions[0]?.items || "수경 식물, 미니 가습기";
        const dayStemElChar = sajuInfo.day.stemEl;
        
        let luckyMantra = "";
        if (dayStemElChar === "목") luckyMantra = "나는 굳건한 거목처럼 흔들림 없이 성장하며, 신년의 불꽃을 창조적 결실로 승화한다.";
        else if (dayStemElChar === "화") luckyMantra = "나는 밝은 등불이 되어 세상을 주도하며, 주변과 상생하는 지혜를 실천한다.";
        else if (dayStemElChar === "토") luckyMantra = "나는 넉넉한 대지처럼 만물을 품어 안으며, 차분한 문서의 경사를 맞이한다.";
        else if (dayStemElChar === "금") luckyMantra = "나는 강직한 무쇠처럼 스스로를 제련하여, 명예로운 승진과 안정을 쟁취한다.";
        else luckyMantra = "나는 유연한 강물처럼 굽이쳐 흐르며, 다가오는 풍요로운 재물 기회를 온전히 담아낸다.";

        return wrapLock(
          <div className="space-y-6 py-4">
            <div className="text-center space-y-2 mb-8">
              <span className="text-xs text-[#A3845B] font-bold block">신년 행운 비방 (新年 行運 秘方)</span>
              <h2 className="font-myeongjo text-2xl font-bold text-[#1A1A1A]">2026 병오년 맞춤 수호 비책</h2>
              <div className="w-16 h-0.5 bg-[#A3845B]/30 mx-auto my-1" />
            </div>
            <div className="bg-white border border-[#E2DDD5] rounded-lg p-6 space-y-5 shadow-sm text-xs leading-relaxed font-light text-gray-700 font-traditional">
              <p className="text-gray-600 font-light text-justify">
                2026년 병오년의 타오르는 불꽃 속에서 의뢰인 \${name}님의 기운을 온전히 수호하고 재물운과 명예운을 팽창시켜 줄 행운 비방입니다. 일상 속에서 적극 활용하여 개운을 유도하십시오.
              </p>
              
              <div className="grid grid-cols-3 gap-3 text-center py-4 bg-[#FAF7F0] rounded-xl border border-[#E2DDD5]/60 shadow-inner">
                <div className="space-y-1">
                  <span className="text-[10px] text-gray-400 block font-semibold">🎨 수호 색상</span>
                  <span className="font-bold text-gray-800 text-xs">{luckyColor}</span>
                </div>
                <div className="space-y-1 border-x border-[#E2DDD5]/60">
                  <span className="text-[10px] text-gray-400 block font-semibold">🔢 행운의 숫자</span>
                  <span className="font-bold text-gray-800 text-xs">{luckyNum}</span>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] text-gray-400 block font-semibold">🧭 개운 방향</span>
                  <span className="font-bold text-gray-800 text-xs">{luckyDir}</span>
                </div>
              </div>

              {/* 추가 처방 카드 */}
              <div className="border border-[#E2DDD5]/70 rounded-xl p-4 bg-[#FAF8F5] space-y-3 shadow-sm">
                <span className="font-bold text-xs text-[#A3845B] block">🗝️ 수호 귀인 보완 소품</span>
                <p className="text-[11px] text-gray-600 leading-normal">
                  귀하의 신년 수호 소품은 <strong>{luckyItem}</strong>입니다. 현관 입구의 잘 보이는 곳이나 집안의 {luckyDir} 방위에 해당 소품을 배치해 두면, 탁하고 과열된 기류를 정화하고 대길한 에너지를 실시간으로 수혈해 주는 필터 역할을 합니다.
                </p>
              </div>

              {/* 수호 선언문 (Mantra) */}
              <div className="border-2 border-double border-[#A3845B]/40 bg-white rounded-xl p-5 shadow-sm space-y-3 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-12 h-12 bg-[#A3845B]/5 rounded-bl-full flex items-center justify-center pointer-events-none">
                  <span className="text-[8px] font-bold text-[#A3845B]/40 rotate-45 select-none">MANTRA</span>
                </div>
                <span className="font-bold text-xs text-[#8B221E] block">🔮 매일 아침 외치는 [신년 수호 만트라]</span>
                <div className="bg-[#FAF7F0] border-l-4 border-[#8B221E] p-3 rounded-r">
                  <p className="font-myeongjo text-[11px] leading-relaxed text-gray-800 italic font-semibold">
                    " {luckyMantra} "
                  </p>
                </div>
                <p className="text-[9px] text-gray-400 font-light leading-relaxed">
                  * 매일 아침 거울을 보고 이 선언문을 스스로에게 낭독하십시오. 말(言)이 가진 파동 에너지가 잠든 무의식을 깨워 운의 궤도를 즉시 순행하도록 조율해 줍니다.
                </p>
              </div>
            </div>
          </div>,
          "신년 맞춤 행운 비방"
        );

      case "ny_monthly":
        const m = page.monthNum;
        const monthTitles = {
          1: "입춘(立春)과 우수(雨水)가 교차하며 얼어붙었던 대지가 녹고 새로운 나무의 기운이 싹트는 경인월(庚寅月)입니다. 올해 병오년의 불씨를 지피기 위해 땔감을 모으고 기초 설계를 다듬는 명리 서막의 시기입니다. 섣부른 계약이나 대규모 자금 투자는 운명적 마찰력을 높이므로 피하십시오. 직장 내에서는 새로운 기획서 작성, 시장 분석, 물밑 협상에 주력하는 것이 최고의 생존 전략입니다. 성급히 나섰다가는 경쟁자들에게 내 패를 읽혀 도중에 기류가 꺾일 수 있으니 주의해야 합니다.",
          2: "경칩(驚蟄)과 춘분(春分)이 지나며 초목에 푸른 생명력이 가득 차오르는 신묘월(辛묘月)입니다. 목(木) 기운이 활성화되어 병오년의 화기(火氣)를 부채질하는 국면으로 진입합니다. 내면에서 강한 독립 의지와 이직, 창업 욕구가 샘솟아 마음이 웅장해지기 쉽습니다. 하지만 아직 지상의 온도가 충분치 않으므로 겉보기식 확장은 금물입니다. 특히 가까운 동료나 가족과의 사소한 대화 중 자존심을 건드리는 말실수로 인해 묵은 갈등이 폭발할 수 있으니 10초 묵언 수행을 철저히 실천하십시오.",
          3: "청명(淸明)과 곡우(穀雨)를 거치며 비옥한 습토가 뜨거워지는 기류를 부드럽게 흡수해 주는 임진월(壬辰月)입니다. 물기를 머금은 흙(濕土)이 유입되어 운세 전반에 단비가 내리는 격입니다. 문서운, 계약운, 시험운이 대단히 안정을 찾게 되며 오랫동안 꼬여있던 복잡한 행정적 난제나 소송 시비가 조용히 타결되는 상서로운 흐름입니다. 평소 어려워했던 인맥에게 가벼운 안부를 전하며 도움을 요청하면 기대 이상의 든든한 백업을 받아 문제를 매끄럽게 처리할 수 있습니다.",
          4: "입하(立夏)와 소만(小滿)이 도래하며 초여름의 뜨거운 사화(巳火) 기운이 세상을 뒤덮는 계사월(癸巳月)입니다. 공중의 수분이 빠르게 증발하여 기류가 건조해지고 심리적 피로도가 급격하게 증가하는 타이밍입니다. 의욕은 앞서지만 쉽게 지치고 만성 피로나 두통, 안구건조증이 나를 괴롭히기 쉽습니다. 무리한 장거리 이동이나 과도한 밤샘 업무는 신체 밸런스를 붕괴시키니 서늘한 실내에서 주기적으로 수분을 보충하고 머리를 식히는 습관을 기르십시오.",
          5: "망종(芒종)과 하지(夏至)를 지나며 하늘과 땅에 가장 뜨거운 용광로의 불길이 중첩되는 갑오월(甲午月)입니다. 세운의 오화(午火)와 이번 달의 오화가 겹치며 스스로를 옭아매는 오오자형(午午自刑)의 흉조가 도사립니다. 사소한 일에 욱하고 감정이 폭발하여 오랫동안 쌓아온 평판을 한순간에 날려버리거나, 홧김에 중요한 직장에 사직서를 던지는 충동성이 극대화됩니다. 중대한 도장 찍기나 감정적 대화는 뒤로 미루고, 침착한 타협책을 찾는 것만이 액운을 피하는 방법입니다.",
          6: "소서(小暑)와 대서(大暑)를 통과하며 대지가 한낮의 열기로 가득 차 숨이 턱턱 막히는 을미월(乙未月)입니다. 메마른 흙(燥土)이 화기를 가두어 팽창력이 극대화되므로 경제적 손재의 위험(군겁쟁재)이 도처에 깔려 있습니다. 남들의 솔깃한 투자 권유나 대박 루머에 휩쓸려 큰돈을 베팅했다가는 묶이거나 증발해 버리기 십상입니다. 지갑을 단단히 닫고 보수적인 적금 형태 위주로 자산을 갈무리하며 현상을 유지하는 수비적 전략이 백번 안전합니다.",
          7: "입추(立秋)와 처서(處暑)를 맞이하며 마침내 서늘한 가을 바람이 불어와 타오르는 잔열을 정화해 주는 병신월(丙申月)입니다. 금(金)의 결실 에너지가 유입되어 나를 가두고 짓눌렀던 답답한 기류가 한순간에 트이는 극적인 터닝 포인트입니다. 막혔던 비즈니스 자금 흐름이 매끄럽게 정산되거나, 나에게 든든한 제안을 건네는 귀인이 서쪽 방면에서 찾아오는 상서로운 달입니다. 적극적으로 명함을 돌리고 내 아이디어를 공개 발표하여 운의 서광을 움켜쥐십시오.",
          8: "백로(白露)와 추분(秋分)을 지나며 맑고 깨끗한 서리가 내려 알찬 오행의 열매를 완성해 주는 정유월(丁酉月)입니다. 금(金)의 기운이 최절정에 달하여 명예 상승, 승진 영전, 계약 체결 등 실질적인 보상과 경제적 이권이 주머니에 쓸어 담기는 최고의 달입니다. 평소 도전하고 싶었던 연봉 협상이나 중요한 문서상의 취득은 이번 달의 기운을 활용하여 과감하게 추진하십시오. 기대 이상의 매끄럽고 압도적인 성과가 보장됩니다.",
          9: "한로(寒露)와 상강(霜降)을 거치며 수확을 끝낸 들판을 단단히 정리정돈하고 창고의 자물쇠를 채우는 무술월(戊戌月)입니다. 건조한 흙의 기운이 들어와 한 해 동안 거두었던 자산을 안전하게 갈무리하도록 유도합니다. 지출 관리에 만전을 기하고 충동적인 쇼핑이나 사치성 비용을 억제하며 내실을 다지십시오. 차분하게 통장 잔고를 확인하고 장기 자산 포트폴리오를 다각화하기에 최적의 이성적 타이밍입니다.",
          10: "입동(立冬)과 소설(小雪)이 찾아와 지상의 모든 타오르던 불기를 흔적 없이 잠재우는 기해월(己亥月)입니다. 차갑고 깊은 해수(亥水)의 물줄기가 유입되어 그간 나를 피로하게 만들었던 구설수나 대인관계의 얽힌 실타래들이 시원하게 씻겨 내려갑니다. 그동안 나를 외롭게 만들거나 대립했던 상사, 동료들과의 오해가 눈 녹듯 풀리고, 편안한 대화의 물꼬가 열려 아늑한 정신적 평온을 되찾게 되는 귀한 시기입니다.",
          11: "대설(大雪)과 동지(冬至)를 관통하며 차가운 한겨울의 강물이 세운의 불꽃과 격렬하게 마주치는 경자월(庚子月)입니다. 자오충(子午沖)의 충돌 기류가 월운에서도 중첩되므로 갑작스러운 이사, 해외 출장, 혹은 부서 재배치 등 급격한 물리적 공간의 변동수가 발생합니다. 급작스러운 변화를 두려워하지 말고 흐름을 즐기되, 빙판길 안전사고나 신체 급격한 온도차로 인한 면역력 저하에 특히 유의하며 스케줄을 조율하십시오.",
          12: "소한(小寒)과 대한(大寒)을 통과하며 얼어붙은 겨울 흙이 온기를 품은 채 다가오는 정미년 새해의 서광을 준비하는 신축월(辛丑月)입니다. 1년간의 땀 방울과 성패를 엄숙히 정돈하고 마음의 휴식을 취하는 정돈의 계절입니다. 무리한 외부 활동을 전면 통제하고, 나만의 침실 조명을 낮춰 명상하며 다가올 새해의 3대 계획을 선명하게 다이어리에 적어 정리정돈하는 것이 가장 상서로운 액막이 행동입니다."
        };
        const monthDetailsEnriched = {
          1: {
            wealth: "재정적으로는 지출 통제가 최우선 과제입니다. 겉보기에는 신규 거래나 수입 기회가 도래하는 듯 보이지만, 실질적인 입금까지는 마찰이 예상됩니다. 예산을 20% 보수적으로 잡으십시오.",
            love: "연인 관계에서는 감정 조절이 조율의 핵심입니다. 내면의 조급함이 겉으로 표출되어 상대방을 다그치기 쉬우니 한 템포 물러서서 배려 어린 침묵을 유지하는 것이 사랑을 지키는 비법입니다.",
            health: "겨울철 정체되었던 기혈 순환을 돕는 가벼운 스트레칭이 필수적입니다. 찬바람을 쐬며 기관지가 약해지기 쉬우니 외출 시 스카프나 목도리로 목을 보호하십시오.",
            wealthVal: 2, loveVal: 3, healthVal: 2
          },
          2: {
            wealth: "독립적인 투자나 주식 투기에 손을 뻗기 쉬운 달이나 낙심할 우려가 큽니다. 확실한 전문가의 서류 검증 없이 지인의 말만 믿고 돈을 빌려주거나 투자하는 행위는 절대 엄금입니다.",
            love: "연인 간의 데이트 시 자존심을 건드리는 농담이 큰 싸움으로 번집니다. '내가 맞고 네가 틀리다'는 식의 논쟁을 멈추고 부드러운 눈빛과 경청의 대화법을 실천하십시오.",
            health: "목 기운의 팽창으로 간에 피로가 쉽게 누적됩니다. 늦은 시간의 불필요한 과음을 완전 차단하고, 녹색 채소와 수분이 풍부한 식단을 가까이 하십시오.",
            wealthVal: 2, loveVal: 2, healthVal: 3
          },
          3: {
            wealth: "문서와 계약으로 인한 재물적 이득이 보장되는 달입니다. 묶여 있던 전세금 반환, 계약금 입금 등 기분 좋은 목돈의 소식이 도래합니다. 부동산 계약이나 자격증 관련 비즈니스를 추진하기에 대단히 좋습니다.",
            love: "싱글의 경우, 조력자의 주선이나 소개팅을 통해 나에게 편안한 정서적 지지를 건넬 진중한 인연을 만나게 될 운명의 서광이 강력하게 비춥니다. 적극적으로 나서십시오.",
            health: "위장 장애와 소화 불량이 발생할 우려가 있으니 규칙적인 식사 시간을 유지하고, 식후 20분 동안 가볍게 대지를 딛으며 걷는 행동을 추천합니다.",
            wealthVal: 5, loveVal: 4, healthVal: 3
          },
          4: {
            wealth: "매출 증대나 보너스 기류가 잠시 보이지만 그만큼 품위 유지비나 돌발 지출이 함께 폭증하여 실속이 떨어집니다. 가계부를 꼼꼼히 적으며 불필요한 고정비를 과감히 다이어트하십시오.",
            love: "연인의 사소한 거짓말이나 감춤으로 인해 내면의 예민함이 증폭될 수 있습니다. 윽박지르기보다는 차분히 대화를 유도하여 상대의 진짜 속마음을 조용히 확인해 보십시오.",
            health: "체내 수분이 급격히 메말라 안구 건조 및 피부 가려움증이 심해집니다. 하루 8잔 이상의 맑은 물을 주기적으로 음용하여 세포에 수분을 공급하십시오.",
            wealthVal: 3, loveVal: 2, healthVal: 2
          },
          5: {
            wealth: "손재수와 관재 구설의 위험이 도처에 깔린 가장 위험한 달입니다. 동업이나 신규 확장 투자는 절대 파탄에 이르니 기존 자산을 완전히 잠금 계좌에 대피시켜 수비하십시오.",
            love: "부부나 연인 사이에 홧김에 이별을 통보하거나 돌이킬 수 없는 상처를 주기 쉽습니다. 갈등 발생 시 즉시 자리를 피해 30분 동안 혼자만의 침묵 명상 시간을 가지십시오.",
            health: "심혈관 질환이나 갑작스러운 가슴 두근거림, 혈압 상승에 각별히 유의해야 합니다. 땀을 뻘뻘 흘리는 격렬한 운동보다는 차분한 스트레칭과 요가를 권장합니다.",
            wealthVal: 1, loveVal: 1, healthVal: 1
          },
          6: {
            wealth: "부동산 청약이나 주식 시장의 뜬소문에 속아 재산을 탕진할 위험이 높습니다. 공격적인 재테크 대신 적금 비율을 15% 이상 높이고 내 자산의 실질적 잔고를 방어하는 데 올인하십시오.",
            love: "상대방에 대한 집착이나 불필요한 의심이 깊어져 숨통을 조이게 만들기 쉽습니다. 서로에게 혼자만의 여유 시간을 허락하여 정서적 신뢰의 균형을 되찾으십시오.",
            health: "만성 체증과 더위로 인한 탈수 증상이 요동치니 야외 활동 시 반드시 이온음료나 물병을 소지하시고, 기름지고 매운 식단을 최대한 멀리하십시오.",
            wealthVal: 2, loveVal: 2, healthVal: 2
          },
          7: {
            wealth: "기다리던 금전의 혈맥이 시원하게 뚫리며 사업적 파트너로부터 대대적인 투자를 받거나 미수금이 말끔히 입금되는 경사스러운 달입니다. 적극적으로 영업력을 발휘하십시오.",
            love: "오랫동안 어긋났던 연인 관계의 갈등이 마법처럼 자연스럽게 풀려 애정이 다시 불타오릅니다. 연인에게 정성 가득한 손 편지나 작은 실버 선물을 건네보십시오.",
            health: "그간 누적되었던 만성 피로가 해소되고 컨디션이 대대적으로 회복되는 시기입니다. 가벼운 유산소 운동으로 기초 근력을 한 단계 단단히 다져두기에 최적입니다.",
            wealthVal: 4, loveVal: 4, healthVal: 4
          },
          8: {
            wealth: "직장인은 연봉 대폭 인상이나 상여금 수령, 비즈니스 사업가는 고수익 계약 성사가 완벽하게 담보됩니다. 2026년 중 자산을 가장 크게 불릴 수 있는 골든 먼스이므로 집중하십시오.",
            love: "싱글은 나의 지적이고 고급스러운 매력에 반한 훌륭한 인성이 나에게 다가와 다정하게 고백할 흐름입니다. 연인은 양가 부모님께 인사를 드리거나 미래를 약속하기 좋습니다.",
            health: "호흡기가 건조해지며 마른기침이나 환절기 감기가 찾아올 수 있으니, 도라지청이나 따뜻한 둥굴레차를 수시로 마셔 목을 촉촉하게 코팅해주십시오.",
            wealthVal: 5, loveVal: 5, healthVal: 3
          },
          9: {
            wealth: "수익을 수확하고 보관하는 창고 마감의 기간입니다. 충동적인 쇼핑이나 사치스러운 기분 내기용 소비를 억제하고 통장에 자금을 잠가 현명하게 내실을 지키십시오.",
            love: "연인 간의 관계가 다소 정체되어 권태감을 느끼기 쉬운 시기입니다. 겉보기 화려한 장소 대신 조용하고 깊은 대화를 나눌 수 있는 호젓한 교외 데이트를 추천합니다.",
            health: "관절과 뼈마디가 굳거나 근육이 경직되기 쉬운 시기이니 아침저녁으로 온열 찜질이나 가벼운 폼롤러 스트레칭을 생활화하여 부상을 미연에 예방하십시오.",
            wealthVal: 4, loveVal: 3, healthVal: 2
          },
          10: {
            wealth: "돈의 누수가 멈추고 자금 흐름이 대단히 안정화됩니다. 무리한 대출을 상환하거나 포트폴리오를 저위험 자산 위주로 리밸런싱하여 재정적 기초 체력을 다지기에 최고입니다.",
            love: "대인관계와 연인 궁합에 은혜로운 평화가 도래합니다. 묵은 오해가 눈 녹듯 사그라들어 편안한 안락함을 공유하며 아늑한 정을 돈독하게 쌓아올립니다.",
            health: "신장과 비뇨기계 컨디션이 호전됩니다. 취침 전 따뜻한 핫팩을 아랫배에 올려 혈류를 덥혀주고 숙면을 취하면 다음 날 아침이 개운해질 것입니다.",
            wealthVal: 4, loveVal: 4, healthVal: 4
          },
          11: {
            wealth: "급작스러운 출장이나 환경적 변동으로 인해 부가적인 비용 지출이 발생할 수 있습니다. 비상금을 충분히 확보해 두고, 지인과의 금전 거래나 보증은 완전 거부하십시오.",
            love: "물리적 공간 변동(이사, 장거리 출장 등)으로 인해 서로 소통의 부재가 발생할 수 있습니다. 매일 정해진 시간에 다정하게 목소리 전화를 나누어 안심을 선물하십시오.",
            health: "빙판길 골절 사고나 심한 감기몸살의 위험이 상존하니 외출 시 따뜻하게 체온을 보존하시고 굽이 낮고 미끄러지지 않는 신발을 착용하십시오.",
            wealthVal: 2, loveVal: 3, healthVal: 1
          },
          12: {
            wealth: "1년의 재정 결산을 마무리하고 신년의 새로운 자금 계획을 세우는 시기입니다. 고정비를 줄이고 저축 비율을 한 단계 끌어올리는 알뜰한 재무 구조가 완성됩니다.",
            love: "안정적이고 차분한 애정 전선이 흐릅니다. 서로를 존중하며 다가오는 새해의 공통 목표(내 집 마련, 장기 계획 등)를 다정하게 설계하기에 최적입니다.",
            health: "체력을 고갈되기 쉬운 엄동설한의 시기이니 흰색 뿌리채소와 고단백 한식 요리로 신체 내부의 온기 센서를 채워 체력을 원천 보충해 주십시오.",
            wealthVal: 3, loveVal: 3, healthVal: 3
          }
        };
        
        const activeDetail = monthDetailsEnriched[m] || { wealth: "", love: "", health: "", wealthVal: 3, loveVal: 3, healthVal: 3 };
        
        // 시각화: 별점 렌더러
        const renderStars = (val) => {
          return (
            <div className="flex gap-0.5 text-amber-500 font-bold text-[13px] shrink-0">
              {"★".repeat(val)}{"☆".repeat(5 - val)}
            </div>
          );
        };

        return wrapLock(
          <div className="space-y-6 py-4">
            <div className="text-center space-y-2 mb-8">
              <span className="text-xs text-[#A3845B] font-bold block">월별 상세 신수비결</span>
              <h2 className="font-myeongjo text-2xl font-bold text-[#1A1A1A]">2026년 음력 {m}월 정밀 운명 지도</h2>
              <div className="w-16 h-0.5 bg-[#A3845B]/30 mx-auto my-1" />
            </div>
            <div className="bg-white border border-[#E2DDD5] rounded-lg p-6 space-y-5 shadow-sm text-xs leading-relaxed font-light text-gray-700 font-traditional">
              <p className="bg-[#FAF7F0] p-4 rounded-xl border border-[#E2DDD5]/60 text-[11px] font-semibold text-[#8B221E] leading-relaxed text-justify">
                {monthTitles[m]}
              </p>
              
              {/* 운기 정밀 지표 리스트 (시각화 보강) */}
              <div className="space-y-4 pt-2">
                <div className="bg-[#FCF9F5] border border-[#E2DDD5]/70 rounded-xl p-4 space-y-2 shadow-sm">
                  <div className="flex justify-between items-center border-b border-[#E2DDD5]/40 pb-1.5">
                    <span className="font-bold text-[#A3845B] flex items-center gap-1 text-[11px]">🪙 재물/비즈니스 전술</span>
                    {renderStars(activeDetail.wealthVal)}
                  </div>
                  <p className="text-[10px] text-gray-500 font-light leading-relaxed">{activeDetail.wealth}</p>
                </div>

                <div className="bg-[#FFF5F5]/30 border border-red-100 rounded-xl p-4 space-y-2 shadow-sm">
                  <div className="flex justify-between items-center border-b border-red-100/70 pb-1.5">
                    <span className="font-bold text-red-700 flex items-center gap-1 text-[11px]">💕 애정/연인 전술</span>
                    {renderStars(activeDetail.loveVal)}
                  </div>
                  <p className="text-[10px] text-gray-500 font-light leading-relaxed">{activeDetail.love}</p>
                </div>

                <div className="bg-[#F4FAF6] border border-[#D4E2D7] rounded-xl p-4 space-y-2 shadow-sm">
                  <div className="flex justify-between items-center border-b border-[#D4E2D7]/70 pb-1.5">
                    <span className="font-bold text-[#2D5A27] flex items-center gap-1 text-[11px]">🌿 건강/수호 처방</span>
                    {renderStars(activeDetail.healthVal)}
                  </div>
                  <p className="text-[10px] text-gray-500 font-light leading-relaxed">{activeDetail.health}</p>
                </div>
              </div>
            </div>
          </div>,
          \`음력 \${m}월 상세 신수비결\`
        );
`;

// 3. Enrich Region B: case "ny_mind_meditation" up to case "ny_season_autumn"
const startMarkerB = '      case "ny_mind_meditation":';
const endMarkerB = '      case "ny_season_autumn":';

const startIndexB = content.indexOf(startMarkerB);
const endIndexB = content.indexOf(endMarkerB);

if (startIndexB === -1 || endIndexB === -1) {
  console.error("Region B markers not found in result/page.js!");
  process.exit(1);
}

const enrichedB = `      case "ny_mind_meditation":
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
                  <span className="text-[9px] bg-red-100 text-red-700 px-2 py-0.5 rounded font-bold">감정 과열 90% 진정</span>
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

      case "ny_season_spring":
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
                      <span className="text-[#A3845B]">75%</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-[#A3845B] rounded-full" style={{ width: "75%" }} />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-[9px] font-semibold text-gray-500">
                      <span>외적 확장/모험 지표</span>
                      <span className="text-gray-400">40%</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-gray-400 rounded-full" style={{ width: "40%" }} />
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

      case "ny_season_summer":
        return wrapLock(
          <div className="space-y-6 py-4">
            <div className="text-center space-y-2 mb-8">
              <span className="text-xs text-[#8B221E] font-bold block">여름철 기류 전략 (음력 4~6월)</span>
              <h2 className="font-myeongjo text-2xl font-bold text-[#1A1A1A]">최대의 고비, 과열된 가마솥을 피해야 할 시기</h2>
              <div className="w-16 h-0.5 bg-[#A3845B]/30 mx-auto my-1" />
            </div>
            <div className="bg-white border border-[#E2DDD5] rounded-lg p-6 space-y-5 shadow-sm text-xs leading-relaxed font-light text-gray-700 font-traditional">
              <p className="text-justify font-light text-gray-600">
                여름철(음력 4월~6월)은 병오년의 불기운이 절정에 달하여 대지가 펄펄 끓는 격동의 시기입니다. 자존심 대립이 극에 달해 상사와의 마찰이 우려되거나 홧김에 직장을 이탈하려는 흉조(午午自刑)가 강해집니다. 이 시기에는 철저한 수비가 최고의 전략입니다.
              </p>
              
              {/* 시각화: 여름철 기류 지수 */}
              <div className="bg-red-50/20 border border-red-100 rounded-xl p-4 space-y-3">
                <span className="font-bold text-xs text-red-900 block">📊 여름철 기류 위험 지표</span>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <div className="flex justify-between text-[9px] font-semibold text-red-700">
                      <span>감정 기복 & 충동 위험도</span>
                      <span className="text-red-700">90%</span>
                    </div>
                    <div className="w-full h-1.5 bg-red-100 rounded-full overflow-hidden">
                      <div className="h-full bg-red-500 rounded-full" style={{ width: "90%" }} />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-[9px] font-semibold text-gray-500">
                      <span>안정적 성정 조율도</span>
                      <span className="text-gray-400">30%</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-gray-400 rounded-full" style={{ width: "30%" }} />
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
`;

// Apply Region A
let finalContent = content.substring(0, startIndexA) + enrichedA + content.substring(endIndexA);

// Re-read boundaries as A replacement could shift indexes
const tempIndexB = finalContent.indexOf(startMarkerB);
const tempEndIndexB = finalContent.indexOf(endMarkerB);

if (tempIndexB === -1 || tempEndIndexB === -1) {
  console.error("Region B markers not found after replacing Region A!");
  process.exit(1);
}

finalContent = finalContent.substring(0, tempIndexB) + enrichedB + finalContent.substring(tempEndIndexB);

fs.writeFileSync(filePath, finalContent, 'utf-8');
console.log("Pages 11 to 20 successfully enriched with premium visual designs!");
