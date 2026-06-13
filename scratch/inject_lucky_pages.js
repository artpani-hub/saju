const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'src', 'app', 'result', 'components', 'renderNewYearPageContent.js');
let content = fs.readFileSync(filePath, 'utf8');

console.log("=== Injecting Enriched Pages 49 & 50 with lastIndexOf ===");

const enrichedPage49 = `case "ny_lucky_fashion":
        return wrapLock(
          <div className="space-y-6 py-4">
            <div className="text-center space-y-2 mb-8">
              <span className="text-xs text-[#A3845B] font-bold block">패션 스타일링 (吉慶 衣裝)</span>
              <h2 className="font-myeongjo text-2xl font-bold text-[#1A1A1A]">나의 사주 기운을 보완하는 외적 연출법</h2>
              <div className="w-16 h-0.5 bg-[#A3845B]/30 mx-auto my-1" />
            </div>

            <div className="bg-white border border-[#E2DDD5] rounded-lg p-6 space-y-6 shadow-sm text-xs leading-relaxed font-light text-gray-700 font-traditional">
              <p className="text-justify font-light text-gray-600">
                옷차림 and 컬러 배치는 가장 손쉽고 즉각적으로 내 주변의 개운 에너지를 자극하는 행동 풍수 실천법입니다. 2026년 병오년의 타오르는 화(火)의 열기를 식히고 메마른 땅을 적시는 수(水) 기운과, 단단한 결단력을 제공하는 금(金) 기운을 일상의 패션과 메이크업, 향수 섭생법을 통해 적극적으로 주입하십시오.
              </p>

              {/* 시각화 1: 럭키 컬러 칩 팔레트 */}
              <div className="bg-[#FAF8F5] border border-[#E2DDD5]/60 rounded-xl p-5 space-y-4">
                <span className="font-bold text-xs text-[#8A6F4C] block text-center">🎨 병오년 수호 오행 럭키 컬러 팔레트</span>
                
                <div className="grid grid-cols-4 gap-3 max-w-md mx-auto">
                  <div className="flex flex-col items-center space-y-1.5 p-2 bg-white rounded-lg border border-[#E2DDD5]/40 shadow-sm">
                    <div className="w-10 h-10 rounded-full bg-[#1A2E40] border border-gray-300 shadow-inner" />
                    <span className="font-semibold text-gray-800 text-[9px]">딥 네이비</span>
                    <span className="text-[8px] text-gray-400 font-light">수(水) 기류</span>
                  </div>
                  <div className="flex flex-col items-center space-y-1.5 p-2 bg-white rounded-lg border border-[#E2DDD5]/40 shadow-sm">
                    <div className="w-10 h-10 rounded-full bg-[#0D0D0D] border border-gray-300 shadow-inner" />
                    <span className="font-semibold text-gray-800 text-[9px]">제트 블랙</span>
                    <span className="text-[8px] text-gray-400 font-light">수(水) 수호</span>
                  </div>
                  <div className="flex flex-col items-center space-y-1.5 p-2 bg-white rounded-lg border border-[#E2DDD5]/40 shadow-sm">
                    <div className="w-10 h-10 rounded-full bg-[#EAEAEA] border border-gray-300 shadow-inner" />
                    <span className="font-semibold text-gray-800 text-[9px]">메탈 실버</span>
                    <span className="text-[8px] text-gray-400 font-light">금(金) 의지</span>
                  </div>
                  <div className="flex flex-col items-center space-y-1.5 p-2 bg-white rounded-lg border border-[#E2DDD5]/40 shadow-sm">
                    <div className="w-10 h-10 rounded-full bg-[#FAF5EB] border border-gray-300 shadow-inner" />
                    <span className="font-semibold text-gray-800 text-[9px]">크림 화이트</span>
                    <span className="text-[8px] text-gray-400 font-light">금(金) 신뢰</span>
                  </div>
                </div>
              </div>

              {/* 시각화 2: 스타일 시너지 및 보호 에너지 지표 */}
              <div className="bg-[#FAF7F0]/40 border border-[#E2DDD5] rounded-xl p-4 space-y-3 shadow-inner">
                <span className="font-bold text-xs text-[#8A6F4C] block">📊 럭키 스타일링 운세 보정 지표</span>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <div className="flex justify-between text-[9px] font-semibold text-[#8A6F4C]">
                      <span>대인관계 신용 및 평판 상승률</span>
                      <span className="text-[#8A6F4C]">90%</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-[#A3845B] rounded-full" style={{ width: "90%" }} />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-[9px] font-semibold text-[#8A6F4C]">
                      <span>구설수 방어 및 악살 차단율</span>
                      <span className="text-[#8A6F4C]">88%</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-[#A3845B] rounded-full" style={{ width: "88%" }} />
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 pt-1">
                  <div className="space-y-1">
                    <div className="flex justify-between text-[9px] font-semibold text-[#8A6F4C]">
                      <span>심리적 안정 & 조급함 냉각률</span>
                      <span className="text-[#8A6F4C]">85%</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-[#A3845B] rounded-full" style={{ width: "85%" }} />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-[9px] font-semibold text-[#8A6F4C]">
                      <span>영업 / 계약 성사 시너지</span>
                      <span className="text-[#8A6F4C]">92%</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-[#A3845B] rounded-full" style={{ width: "92%" }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* 스타일 처방 조견표 */}
              <span className="font-bold text-xs text-[#8A6F4C] block pt-2">🔑 부위별 디테일 코디네이션 처방</span>
              <div className="border border-[#E2DDD5] rounded-xl overflow-hidden shadow-sm">
                <table className="w-full text-[9px] text-left border-collapse">
                  <thead>
                    <tr className="bg-[#FAF7F0] text-[#8A6F4C] font-bold border-b border-[#E2DDD5]">
                      <th className="p-2">분류</th>
                      <th className="p-2 text-center">권장 스타일 및 포인트</th>
                      <th className="p-2 text-center">추천 아이템 / 컬러</th>
                      <th className="p-2">개운 메커니즘</th>
                    </tr>
                  </thead>
                  <tbody className="text-gray-600 font-light">
                    <tr className="border-b border-[#E2DDD5]/40">
                      <td className="p-2 font-semibold text-gray-800">👔 의상 코디</td>
                      <td className="p-2 text-center font-medium">단정한 미니멀 클래식 핏</td>
                      <td className="p-2 text-center text-[#1A2E40] font-semibold">네이비 자켓, 블랙 슬랙스</td>
                      <td className="p-2">화기를 통제하는 깔끔한 수(水)의 절제로 신용을 극대화함</td>
                    </tr>
                    <tr className="border-b border-[#E2DDD5]/40">
                      <td className="p-2 font-semibold text-gray-800">💄 메이크업</td>
                      <td className="p-2 text-center font-medium">윤기 나는 세미글로우 스킨</td>
                      <td className="p-2 text-center text-gray-600 font-semibold">수분 촉촉 립밤, 실버 펄 하이라이터</td>
                      <td className="p-2">가을 이슬처럼 촉촉하고 투명한 질감으로 금수쌍청 기류 활성화</td>
                    </tr>
                    <tr className="border-b border-[#E2DDD5]/40">
                      <td className="p-2 font-semibold text-gray-800">💍 액세서리</td>
                      <td className="p-2 text-center font-medium">차가운 금속 톤 안경 및 주얼리</td>
                      <td className="p-2 text-center text-gray-500 font-semibold">실버 주얼리, 메탈 스틸 시계</td>
                      <td className="p-2">금(金)의 기류를 더하여 대인관계 내 칼 같은 분별력과 명예운 수호</td>
                    </tr>
                    <tr className="border-b border-[#E2DDD5]/40">
                      <td className="p-2 font-semibold text-gray-800">💨 럭키 향수</td>
                      <td className="p-2 text-center font-medium">차분하고 묵직한 수분감 향조</td>
                      <td className="p-2 text-center text-emerald-800 font-semibold">우디, 머스크, 마린 향</td>
                      <td className="p-2">정서적 과열을 내리고 주변 인맥에게 차분하고 지혜로운 분위기 전달</td>
                    </tr>
                    <tr className="bg-rose-50/30">
                      <td className="p-2 font-semibold text-rose-800">⚠️ 피할 스타일</td>
                      <td className="p-2 text-center font-medium text-rose-950">화려한 원색 및 형광 패션</td>
                      <td className="p-2 text-center text-rose-700 font-semibold">레드, 네온 오렌지 상의</td>
                      <td className="p-2 text-rose-950">가뜩이나 뜨거운 병오년의 화기(불꽃)를 자극해 심리적 충동과 구설을 유발</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* 3열 수칙 카드 */}
              <div className="grid grid-cols-3 gap-3 pt-2">
                <div className="bg-[#FAF7F0] border border-[#E2DDD5]/60 p-3 rounded-xl text-center shadow-inner">
                  <span className="text-xl block mb-1">👔</span>
                  <span className="font-bold text-[#A3845B] text-[10px] block">네이비 톤온톤</span>
                  <p className="text-[8px] text-gray-400 font-light mt-1 leading-snug">상의를 어두운 남색 계열로 입어 침착성을 강화</p>
                </div>
                <div className="bg-[#FAF7F0] border border-[#E2DDD5]/60 p-3 rounded-xl text-center shadow-inner">
                  <span className="text-xl block mb-1">💍</span>
                  <span className="font-bold text-[#A3845B] text-[10px] block">메탈 포인트</span>
                  <p className="text-[8px] text-gray-400 font-light mt-1 leading-snug">은반지, 스틸 시계 등으로 판단 기류를 활성화</p>
                </div>
                <div className="bg-[#FAF7F0] border border-[#E2DDD5]/60 p-3 rounded-xl text-center shadow-inner">
                  <span className="text-xl block mb-1">💄</span>
                  <span className="font-bold text-[#A3845B] text-[10px] block">물광 메이크업</span>
                  <p className="text-[8px] text-gray-400 font-light mt-1 leading-snug">얼굴에 수분감을 가미해 화기 팽창을 억제</p>
                </div>
              </div>
            </div>
          </div>,
          "신년 패션 메이크업 스타일링 가이드"
        )`;

const enrichedPage50 = `case "ny_diet_presc": {
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
          constitutionDesc = "소화기 계통의 힘을 쥐고 있으나, 세운의 열기가 강해져 위장이 쉽게 메마르고 체내 노폐물(습담)이 끈적하게 남기 쉬운 체질입니다. 비위가 약해지면 피로감 및 복부 팽만감을 자주 호소할 수 있습니다.";
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
                  <span>신·방광(Water) 음액 지수</span>
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
                매일 입으로 들어가는 음식의 오행 성질은 오장육부의 열과 한기를 조율하는 기초 한의학적 개운 처방입니다. 의뢰인 <strong>{name}</strong>님의 사주 일간 오행 성향을 분석한 결과, 아래와 같이 맞춤형 약선 섭생 처방이 제공됩니다.
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

const fashionIdx = content.lastIndexOf('case "ny_lucky_fashion":');
const dietIdx = content.lastIndexOf('case "ny_diet_presc":');
const blessingIdx = content.lastIndexOf('case "ny_final_blessing":');

if (fashionIdx === -1 || dietIdx === -1 || blessingIdx === -1) {
  console.error("Failed to find case indices with lastIndexOf!", { fashionIdx, dietIdx, blessingIdx });
  process.exit(1);
}

console.log("Indices found with lastIndexOf:", { fashionIdx, dietIdx, blessingIdx });

// 1. replace ny_lucky_fashion -> ny_diet_presc
content = content.slice(0, fashionIdx) + enrichedPage49 + "\n\n      " + content.slice(dietIdx);

// 재도출
const newDietIdx = content.lastIndexOf('case "ny_diet_presc":');
const newBlessingIdx = content.lastIndexOf('case "ny_final_blessing":');

// 2. replace ny_diet_presc -> ny_final_blessing
content = content.slice(0, newDietIdx) + enrichedPage50 + "\n\n      " + content.slice(newBlessingIdx);

fs.writeFileSync(filePath, content, 'utf8');
console.log("Enriched pages 49 & 50 successfully injected with lastIndexOf!");
