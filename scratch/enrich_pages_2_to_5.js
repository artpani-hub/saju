const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'src', 'app', 'result', 'page.js');
let content = fs.readFileSync(filePath, 'utf-8');

// We will target the range between case "ny_preface" and case "ny_stem_harmony"
const markerStart = '      case "ny_preface":';
const markerEnd = '      case "ny_stem_harmony":';

const startIndex = content.indexOf(markerStart);
const endIndex = content.indexOf(markerEnd);

if (startIndex === -1 || endIndex === -1) {
  console.error("Enrichment markers not found in result/page.js!");
  process.exit(1);
}

const enrichedPages2To5 = `      case "ny_preface":
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
                동양 역학의 최고 정수인 삼재(三才) 사상에서는 우리의 한 해 성패를 결정짓는 요소를 세 가지로 나눕니다. 첫째는 하늘의 때를 선제적으로 읽어내는 <strong>천시(天時)</strong>이고, 둘째는 내가 딛고 서 있는 대지와 가구, 인테리어 등 공간적 에너지를 조율하는 <strong>지리(地理)</strong>이며, 셋째는 닥쳐올 운명을 알고 나 스스로의 감정을 통제하여 결단력 있게 행동하는 <strong>인화(人和)</strong>입니다. 이 세 가지가 하나로 결합할 때 비로소 위대한 도약과 운명의 전환이 보장됩니다.
              </p>
              <p>
                본 혜안당 정통 신수비결은 2026년 병오년(丙午年)에 우리를 찾아올 거대한 태양과 용광로의 불꽃 기운을 정밀 진단하여, 의뢰인 \${name}님이 어느 시기에 돛을 활짝 펼쳐 공격적으로 전진하고, 어느 시기에 닻을 내린 채 내실을 기하며 자산을 수호해야 하는지를 천간지지의 역학적 조합으로 풀어낸 고품격 명조 비방서입니다.
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

      case "ny_intro_saju":
        return wrapLock(
          <div className="space-y-6 py-4">
            <div className="text-center space-y-2 mb-8">
              <span className="text-xs text-[#A3845B] font-bold block">명조(命造) 분석</span>
              <h2 className="font-myeongjo text-2xl font-bold text-[#1A1A1A]">나를 증명하는 우주의 지도, 사주 원국 정밀 해설</h2>
              <div className="w-16 h-0.5 bg-[#A3845B]/30 mx-auto my-1" />
            </div>
            <div className="bg-white border border-[#E2DDD5] rounded-lg p-6 space-y-6 shadow-sm text-xs leading-relaxed font-light text-gray-700 font-traditional">
              <p>
                의뢰인 \${name}님이 탄생하는 그 순간, 우주 공간을 채웠던 여덟 글자의 명조(命造: 사주 원국) 배치입니다. 명리학에서 사주 원국은 평생에 걸쳐 귀하를 구성하는 <strong>정신적 뼈대이자 유전적인 기질의 기본형</strong>을 상징합니다.
              </p>
              
              <div className="grid grid-cols-4 gap-2 text-center font-bold">
                <div className="bg-[#FAF7F0] p-2.5 rounded border border-[#E2DDD5]/50">
                  <div className="text-[10px] text-gray-400">시주(時柱)</div>
                  <div className="text-sm text-[#A3845B] mt-1.5">\${sajuInfo.hour.stem}\${sajuInfo.hour.branch}</div>
                  <div className="text-[9px] text-gray-500 font-light mt-0.5">\${sajuInfo.hour.stemEl}/\${sajuInfo.hour.branchEl}</div>
                  <div className="text-[8px] text-gray-400 mt-1.5 font-normal border-t border-gray-200/60 pt-1">노년·자식운</div>
                </div>
                <div className="bg-[#FAF7F0] p-2.5 rounded border border-[#E2DDD5]/50 border-2 border-brass">
                  <div className="text-[10px] text-brass">일주(日柱)</div>
                  <div className="text-sm text-brass mt-1.5">\${sajuInfo.day.stem}\${sajuInfo.day.branch}</div>
                  <div className="text-[9px] text-brass font-light mt-0.5">\${sajuInfo.day.stemEl}/\${sajuInfo.day.branchEl}</div>
                  <div className="text-[8px] text-brass mt-1.5 font-normal border-t border-brass/20 pt-1">중년·배우자궁</div>
                </div>
                <div className="bg-[#FAF7F0] p-2.5 rounded border border-[#E2DDD5]/50">
                  <div className="text-[10px] text-gray-400">월주(月柱)</div>
                  <div className="text-sm text-[#A3845B] mt-1.5">\${sajuInfo.month.stem}\${sajuInfo.month.branch}</div>
                  <div className="text-[9px] text-gray-500 font-light mt-0.5">\${sajuInfo.month.stemEl}/\${sajuInfo.month.branchEl}</div>
                  <div className="text-[8px] text-gray-400 mt-1.5 font-normal border-t border-gray-200/60 pt-1">청년·사회운</div>
                </div>
                <div className="bg-[#FAF7F0] p-2.5 rounded border border-[#E2DDD5]/50">
                  <div className="text-[10px] text-gray-400">년주(年柱)</div>
                  <div className="text-sm text-[#A3845B] mt-1.5">\${sajuInfo.year.stem}\${sajuInfo.year.branch}</div>
                  <div className="text-[9px] text-gray-500 font-light mt-0.5">\${sajuInfo.year.stemEl}/\${sajuInfo.year.branchEl}</div>
                  <div className="text-[8px] text-gray-400 mt-1.5 font-normal border-t border-gray-200/60 pt-1">초년·조상궁</div>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <p>
                  네 개의 기둥 중에서도 나 자신을 대변하는 <strong>일간(日干: \${sajuInfo.day.stem})</strong>은 나의 정신적 자아와 핵심 가치관을 주도하는 최고 결정권자입니다. 일주(日柱)의 지지(\${sajuInfo.day.branch})는 내가 지향하는 내면의 안전지대이자 배우자와 정서적 교감을 나누는 주거 환경입니다.
                </p>
                <p>
                  또한 사회적 활동 영역과 직업적 성취를 보여주는 월주(月柱)는 청년기부터 사회 초년생 시절의 대외적인 명예와 성장의 속도를 지배합니다. 초년과 조상의 기틀을 의미하는 년주(年柱)는 굳건한 뿌리가 되어 귀하의 든든한 보호막이 되어 줍니다.
                </p>
                <p>
                  올해 병오년의 불꽃은 이 여덟 글자의 유기적 관계와 마주하여 천간의 합과 지지의 충을 정밀하게 일으킵니다. 내 원국에 어떤 글자들이 있고, 그 글자들이 세운의 글자와 어떻게 융합하는지 명확하게 인지하고 대처할 때 나쁜 액운을 지혜롭게 비껴가고 인생의 큰 복록을 온전히 취하게 될 것입니다.
                </p>
              </div>
            </div>
          </div>,
          "의뢰인 명조 분석과 사주 원국"
        );

      case "ny_daewun_flow":
        return wrapLock(
          <div className="space-y-6 py-4">
            <div className="text-center space-y-2 mb-8">
              <span className="text-xs text-[#A3845B] font-bold block">생애 대운(大運)</span>
              <h2 className="font-myeongjo text-2xl font-bold text-[#1A1A1A]">운명의 거대한 강물, 10년 대운과 신년의 융합</h2>
              <div className="w-16 h-0.5 bg-[#A3845B]/30 mx-auto my-1" />
            </div>
            <div className="bg-white border border-[#E2DDD5] rounded-lg p-6 space-y-4 shadow-sm text-xs leading-relaxed font-light text-gray-700 font-traditional">
              <p>
                명리학에서 흔히 말하는 대운(大運)이란 '갑자기 찾아오는 엄청나게 좋은 대박 행운'이 아니라, 10년마다 순환하며 바뀌는 <strong>내 인생의 거대한 기후적 환경과 무대</strong>를 의미합니다.
              </p>
              <p>
                쉽게 말해 대운은 내가 운전해 가야 하는 도로의 포장 상태나 계절적 계절(봄·여름·가을·겨울)과 같으며, 매년 들어오는 세운(歲運)은 그 계절 위에서 날씨 변화처럼 매일 요동치는 비바람과 태양에 비유할 수 있습니다. 내가 달리는 고속도로(대운)가 비포장도로라면 아무리 맑은 날씨의 세운을 만나더라도 속도를 내기 어렵고, 도로 상태가 매끄러운 8차선 아스팔트 대운을 지나고 있다면 일시적으로 태풍이나 눈비(나쁜 세운)가 찾아오더라도 가볍게 이겨내며 안정을 유지할 수 있는 이치입니다.
              </p>
              <p>
                의뢰인 \${name}님의 현재 10년 대운의 궤적은 2026년 병오년의 맹렬한 불꽃 기류와 만나 인생의 실질적인 전환점과 삶의 우선순위 조정을 강력하게 암시하고 있습니다. 대운의 지지가 나의 사주 균형을 돕는 오행인 수(水)나 금(金) 기운을 다정하게 머금고 있다면 세운의 과도한 화기를 정밀 제어하여 유용한 황동 보검으로 제련해 내는 생애 최고의 번영기가 펼쳐질 것이고, 대운마저 불씨를 자극하는 목(木)이나 화(火) 기류로 치우쳐 있다면 감정적 과열과 돌발 손재수를 방어하는 보수적 수비 전략이 강력하게 요구됩니다.
              </p>
              <div className="bg-[#FAF7F0] p-4 rounded border border-[#E2DDD5]/60 text-center text-[11px] font-semibold text-gray-800">
                💡 내 인생의 대세 대운을 면밀하게 이해하고, 세운의 기후 변화에 유연하게 옷을 갈아입는 자만이 무모한 질주를 차단하고 다가올 10년의 경제적·신체적 안정을 견고하게 수호할 수 있습니다.
              </div>
            </div>
          </div>,
          "생애 대운 흐름과 세운의 융합 분석"
        );

      case "ny_seoun_analysis":
        return wrapLock(
          <div className="space-y-6 py-4">
            <div className="text-center space-y-2 mb-8">
              <span className="text-xs text-[#A3845B] font-bold block">2026 병오년(丙午年)</span>
              <h2 className="font-myeongjo text-2xl font-bold text-[#1A1A1A]">천지합화(天地合火) - 태양과 용광로의 역동적 서사</h2>
              <div className="w-16 h-0.5 bg-[#A3845B]/30 mx-auto my-1" />
            </div>
            <div className="bg-white border border-[#E2DDD5] rounded-lg p-6 space-y-4 shadow-sm text-xs leading-relaxed font-light text-gray-700 font-traditional">
              <div className="border-l-4 border-[#8B221E] pl-4 py-1">
                <h4 className="font-myeongjo text-sm font-bold text-gray-800">하늘과 대지를 붉게 태우는 거대한 에너지</h4>
                <p className="text-[11px] text-gray-500 mt-1">천간 丙火(태양)와 지지 午火(용광로)가 일으키는 극단적 양기(陽氣)의 절정</p>
              </div>
              <p>
                2026년 병오년은 하늘의 환하고 눈부신 태양이자 만물을 비추는 순수 불꽃인 <strong>병화(丙火)</strong>와 지상의 거대한 용광로이자 쉬지 않고 거칠게 질주하는 준마인 <strong>오화(午火)</strong>가 위아래로 하나를 이루며 다가오는 격정적인 해입니다. 명리학에서는 이처럼 천간과 지지가 모두 화(火) 기운으로 강력하게 결합한 형세를 <strong>천지합화(天地合火)</strong>라 칭하며, 우주의 팽창력과 열정이 극한에 다다르는 시기로 정의합니다.
              </p>
              <p>
                이 기류 하에서는 온 세상의 라이프사이클 속도가 무서우리만치 빨라집니다. 감추어졌던 어두운 위선이나 묵은 조직의 모순들이 태양 아래 적나라하게 폭로되며 강제적인 개혁과 정리가 단행되고, 문화, 기술, IT 산업에서는 기존 패러다임을 뒤흔드는 파괴적 혁신이 불길처럼 번집니다. 개인 역시 그간 억눌러 왔던 자립심과 열망이 폭발하여 이직, 독립, 새로운 공부나 비즈니스에 도전하고자 하는 마음의 역동성이 최대로 상승하게 됩니다.
              </p>
              <p>
                그러나 과도한 화염은 반드시 주위의 물과 쇠를 메마르게 하고 산을 가뭄에 찌들게 합니다. 심리적인 조급함으로 인해 섣부른 계약서 도장을 찍거나, 분노를 조절하지 못해 소중한 인맥을 태워버릴 리스크가 공존하므로, 타오르는 불길 한가운데에서 차가운 호수 같은 침묵과 정교한 자금 수비 대책을 세워 두는 것만이 올해 약속된 번영과 권세를 완전히 내 것으로 만드는 혜안의 핵심입니다.
              </p>
            </div>
          </div>,
          "병오년 세운 기류 총평"
        );
`;

const finalContent = content.substring(0, startIndex) + enrichedPages2To5 + content.substring(endIndex);

fs.writeFileSync(filePath, finalContent, 'utf-8');
console.log("Enrichment for pages 2 to 5 completed successfully!");
