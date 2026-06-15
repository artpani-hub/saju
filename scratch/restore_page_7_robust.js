const fs = require('fs');
const path = require('path');

const filePath = path.join('d:', '인터그리비티', 'saju', 'src', 'app', 'result', 'components', 'renderNewYearPageContent.js');
let content = fs.readFileSync(filePath, 'utf8');

const targetStr = '      case "ny_ilju_harmony":\r\n        const ilju = sajuInfo.day.stem + sajuInfo.day.branch;\r\n        const dayBranch = sajuInfo.day.branch;\r\n        let relationDesc = "";\r\n        let statusBadge = <span className="bg-blue-100 text-blue-800 border border-blue-200 text-[10px] font-bold px-2 py-0.5 rounded shadow-sm">완만한 조화 (평온)</span>;\r\n        \r\n        if (dayBranch === "子") {\r\n          relationDesc = "2026년 오화(午火) 세운은 귀하의 일지 자수(子水)와 격렬히 부딪치는 자오충(子午沖)을 유발합니다. 이는 집터, 근무지 이동, 혹은 부부 관계의 급격한 지각변동을 뜻합니다. 흔들림을 두려워하기보다 고여있던 나쁜 습관을 털어내는 계기로 삼으십시오.";\r\n          statusBadge = <span className="bg-red-100 text-red-800 border border-red-200 text-[10px] font-bold px-2 py-0.5 rounded animate-pulse shadow-sm">⚠️ 격렬한 변화 (충살)</span>;\r\n        } else if (dayBranch === "午") {\r\n          relationDesc = "2026년 오화(午火)는 내 일지의 오화와 겹쳐 스스로를 옭아매는 오오자형(午午自刑)을 일으킵니다. 감정 기복이 심해져 섣부른 말이나 행동으로 일을 그르치기 쉬우니 계약 체결 시에는 반드시 타인의 피드백을 한 번 더 거치십시오.";\r\n          statusBadge = <span className="bg-orange-100 text-orange-800 border border-orange-200 text-[10px] font-bold px-2 py-0.5 rounded shadow-sm">⚠️ 스스로 단속 (자형)</span>;\r\n        } else if (dayBranch === "未" || dayBranch === "寅" || dayBranch === "戌") {\r\n          relationDesc = "2026년 세운의 오화(午火)는 내 일지와 따뜻한 합(午未 육합, 寅午戌 삼합)을 이루어 평화롭고 조화로운 기류를 형성합니다. 대인관계의 오해가 눈 녹듯 풀리고 귀인의 적극적인 협력을 받아 편안하게 안정을 얻을 수 있는 대길한 흐름입니다.";\r\n          statusBadge = <span className="bg-emerald-100 text-emerald-800 border border-emerald-200 text-[10px] font-bold px-2 py-0.5 rounded shadow-sm">★ 대길한 화합 (지합)</span>;\r\n        } else if (dayBranch === "丑") {\r\n          relationDesc = "2026년 오화(午火)는 내 일지 축토(丑土)와 만나며 서로 은근히 밀어내고 원망하게 만드는 축오원진(丑午怨嗔) 및 귀문관살 기류를 생성합니다. 예민함과 심리적 불안정이 높아져 가까운 이의 말 한마디에 큰 상처를 입거나 오해를 하기 쉽습니다. 상대방을 비난하기 전에 한 템포 호흡을 고르고 이성적으로 팩트를 점검하십시오.";\r\n          statusBadge = <span className="bg-purple-100 text-purple-800 border border-purple-200 text-[10px] font-bold px-2 py-0.5 rounded shadow-sm">⚠️ 감정 오해 (원진)</span>;\r\n        }\r\n\r\n        return wrapLock(\r\n          <div className="space-y-6 py-4">\r\n            <div className="text-center space-y-2 mb-8">\r\n              <span className="text-xs text-[#A3845B] font-bold block">일주(日柱) 지합·충 진단</span>\r\n              <h2 className="font-myeongjo text-2xl font-bold text-[#1A1A1A]">일주와 세운의 형·충·회·합 정밀 진단</h2>\r\n              <div className="w-16 h-0.5 bg-[#A3845B]/30 mx-auto my-1" />\r\n            </div>\r\n            <div className="bg-white border border-[#E2DDD5] rounded-lg p-6 space-y-4 shadow-sm text-xs leading-relaxed font-light text-gray-700 font-traditional">\r\n              <div className="flex justify-between items-center bg-[#FAF7F0] p-4 rounded border border-[#E2DDD5]/60 text-sm font-bold text-[#8B221E]">\r\n                <span>귀하의 타고난 일주: {ilju}일주</span>\r\n                {statusBadge}\r\n              </div>\r\n              <p className="mt-4">\r\n                일지는 사주에서 <strong>나의 개인적인 안식처, 침실, 그리고 배우자 궁</strong>을 상징합니다. 1년의 기류를 지배하는 세운의 지지(오화)가 내 안식처의 글자와 어떤 관계를 맺느냐에 따라 실질적인 신체 컨디션과 가정생활의 평화 지수가 좌우됩니다.\r\n              </p>\r\n              <p>\r\n                {relationDesc}\r\n              </p>\r\n            </div>\r\n          </div>,\r\n          "일주와 세운의 합·충·형·파·해 진단"\r\n        );';

const newCase = `      case "ny_ilju_harmony": {
        const ilju = sajuInfo.day.stem + sajuInfo.day.branch;
        const dayBranch = sajuInfo.day.branch;
        let relationDesc = "";
        let statusBadge = <span className="bg-blue-100 text-blue-800 border border-blue-200 text-[10px] font-bold px-2 py-0.5 rounded shadow-sm">완만한 조화 (평온)</span>;
        
        let lightColor = "bg-blue-500";
        let borderClass = "border-blue-200";
        let cardBgClass = "bg-blue-50/10";
        let scoreLabel = "안전지대";
        let score = 70;

        const harmonyDataMap = {
          "子": {
            relationName: "자오충 (子午沖) - 격렬한 대립",
            score: 45,
            scoreLabel: "위험경보 (이동/변동)",
            lightColor: "bg-red-600",
            borderClass: "border-red-300",
            cardBgClass: "bg-red-50/40",
            statusBadge: <span className="bg-red-100 text-red-800 border border-red-200 text-[10px] font-bold px-2 py-0.5 rounded animate-pulse shadow-sm">⚠️ 격렬한 변화 (충살)</span>,
            relationDesc: "2026년 오화(午火) 세운은 귀하의 일지 자수(子水)와 격렬히 부딪치는 자오충(子午沖)을 유발합니다. 이는 집터, 근무지 이동, 혹은 부부 관계의 급격한 지각변동을 뜻합니다. 흔들림을 두려워하기보다 고여있던 나쁜 습관을 털어내는 계기로 삼으십시오.",
            guides: [
              { title: "추천 행동", content: "예상되는 주거지나 사무실 이사, 구조조정을 선제적으로 준비하여 충격을 완화하십시오.", icon: "🏃" },
              { title: "주의 사항", content: "사소한 갈등이 이혼이나 소송, 완전한 결별로 이어지기 쉬우니 대화를 극도로 절제하십시오.", icon: "⚖️" },
              { title: "대비 요령", content: "수(水) 기운을 보강하기 위해 북쪽 방향으로 머리를 두고 취침하며 심장 과열을 방지하십시오.", icon: "🌊" }
            ]
          },
          "午": {
            relationName: "오오자형 (午午自刑) - 스스로 제련",
            score: 50,
            scoreLabel: "감정단속 (자성)",
            lightColor: "bg-orange-500",
            borderClass: "border-orange-300",
            cardBgClass: "bg-orange-50/40",
            statusBadge: <span className="bg-orange-100 text-orange-800 border border-orange-200 text-[10px] font-bold px-2 py-0.5 rounded shadow-sm">⚠️ 스스로 단속 (자형)</span>,
            relationDesc: "2026년 오화(午火)는 내 일지의 오화와 겹쳐 스스로를 옭아매는 오오자형(午午自刑)을 일으킵니다. 감정 기복이 심해져 섣부른 말이나 행동으로 일을 그르치기 쉬우니 계약 체결 시에는 반드시 타인의 피드백을 한 번 더 거치십시오.",
            guides: [
              { title: "추천 행동", content: "중요한 비즈니스 문서 계약 날인 전 반드시 신뢰할 수 있는 제3자에게 이중 검토를 의뢰하십시오.", icon: "📝" },
              { title: "주의 사항", content: "충동적인 감정 과열로 사직서를 던지거나 동업 관계를 깨뜨리지 않도록 이성적 판단을 유지하십시오.", icon: "🔥" },
              { title: "대비 요령", content: "금(金) 기운을 자극하는 메탈 시계나 은반지를 착용하여 날카로운 분별력을 항시 확보하십시오.", icon: "🪙" }
            ]
          },
          "未": {
            relationName: "오미육합 (午未六合) - 따뜻한 안착",
            score: 95,
            scoreLabel: "대길화합 (귀인조력)",
            lightColor: "bg-emerald-600",
            borderClass: "border-emerald-300",
            cardBgClass: "bg-emerald-50/40",
            statusBadge: <span className="bg-emerald-100 text-emerald-800 border border-emerald-200 text-[10px] font-bold px-2 py-0.5 rounded shadow-sm">★ 대길한 화합 (지합)</span>,
            relationDesc: "2026년 세운의 오화(午火)는 내 일지 미토(未土)와 만나 완벽한 오미육합(午未六合)을 이룹니다. 얼어붙었던 배우자 관계가 부드럽게 복원되고, 귀인이 자발적으로 찾아와 나를 지탱해 주어 내실과 정서적 평화를 완벽하게 얻을 수 있는 시기입니다.",
            guides: [
              { title: "추천 행동", content: "마음속 담아두었던 고민이나 계획을 가족과 파트너에게 개방하여 긴밀한 신뢰를 회복하십시오.", icon: "🤝" },
              { title: "주의 사항", content: "도와주는 귀인의 조력을 당연시하지 말고 따뜻한 식사나 작은 감사 표현으로 인덕을 이어가십시오.", icon: "🎁" },
              { title: "대비 요령", content: "부부 침실이나 대화의 메인 공간에 노란색 비단 천이나 흙 오브제를 배치해 대길한 기운을 가두십시오.", icon: "🏺" }
            ]
          },
          "寅": {
            relationName: "인오반합 (寅午반합) - 강성한 도약",
            score: 90,
            scoreLabel: "신분상승 (창의도약)",
            lightColor: "bg-emerald-500",
            borderClass: "border-emerald-200",
            cardBgClass: "bg-emerald-50/10",
            statusBadge: <span className="bg-emerald-100 text-emerald-800 border border-emerald-200 text-[10px] font-bold px-2 py-0.5 rounded shadow-sm">★ 강성한 도약 (반합)</span>,
            relationDesc: "2026년 병오년 세운의 오화(午火)는 내 일지 인목(寅木)과 만나 강렬한 인오반합(寅午半合)을 형성합니다. 이는 내 창의적 영감과 실행력이 최고조에 달하여 시험 합격, 승진, 혹은 대대적인 문서 계약 취득에 매우 유리한 대길의 흐름입니다.",
            guides: [
              { title: "추천 행동", content: "과거에 미뤄둔 공적 프로젝트나 신규 기획안이 있다면 자신감 있게 단행하십시오.", icon: "🚀" },
              { title: "주의 사항", content: "기운이 너무 과열되면 주위 동료들에게 독선적인 인상을 줄 수 있으니 의견을 적극 수용하십시오.", icon: "👂" },
              { title: "대비 요령", content: "목(木)의 추진력을 돕기 위해 책상이나 컴퓨터 모니터 주변에 작은 관엽 식물 오브제를 배치하십시오.", icon: "🌿" }
            ]
          },
          "戌": {
            relationName: "오술반합 (午戌半합) - 견고한 수호",
            score: 92,
            scoreLabel: "수렴안착 (내실수호)",
            lightColor: "bg-emerald-600",
            borderClass: "border-emerald-300",
            cardBgClass: "bg-emerald-50/20",
            statusBadge: <span className="bg-emerald-100 text-emerald-800 border border-emerald-200 text-[10px] font-bold px-2 py-0.5 rounded shadow-sm">★ 견고한 수호 (반합)</span>,
            relationDesc: "2026년 오화(午火) 세운은 내 일지 술토(戌토)와 만나 결속력이 깊은 오술반합(午戌半合)을 완성합니다. 이는 흩어지려던 재정적 권리와 내적인 가정이 하나로 단단하게 고정되어 지켜짐을 의미합니다. 부동산 계약이나 자산 잠금에 최고의 타이밍입니다.",
            guides: [
              { title: "추천 행동", content: "자산을 분산 투자하기보다 단단한 안정형 채권이나 연금 자산에 가두어 수확을 마감하십시오.", icon: "🔒" },
              { title: "주의 사항", content: "지나치게 안정을 고집하느라 찾아온 귀인의 파트너십 기회를 거절하는 실수를 범하지 마십시오.", icon: "🤝" },
              { title: "대비 요령", content: "가죽 바인더나 정돈된 황토색 소품을 활용해 계약서 보관용 서랍 주변의 기맥을 단단하게 보강하십시오.", icon: "🗂️" }
            ]
          },
          "丑": {
            relationName: "축오원진 (丑午怨嗔) - 감정 대립",
            score: 48,
            scoreLabel: "신경안정 (원진/귀문)",
            lightColor: "bg-purple-600",
            borderClass: "border-purple-300",
            cardBgClass: "bg-purple-50/40",
            statusBadge: <span className="bg-purple-100 text-purple-800 border border-purple-200 text-[10px] font-bold px-2 py-0.5 rounded shadow-sm">⚠️ 감정 오해 (원진)</span>,
            relationDesc: "2026년 오화(午火)는 내 일지 축토(丑土)와 만나며 서로 은근히 밀어내고 원망하게 만드는 축오원진(丑午怨嗔) 및 귀문관살 기류를 생성합니다. 예민함과 심리적 불안정이 높아져 가까운 이의 말 한마디에 큰 상처를 입거나 오해를 하기 쉽습니다. 상대방을 비난하기 전에 한 템포 호흡을 고르고 이성적으로 팩트를 점검하십시오.",
            guides: [
              { title: "추천 행동", content: "가까운 인맥이나 배우자와 감정이 꼬였을 때는 3일간 물리적 비대면 시간을 갖는 침묵 요결을 실천하십시오.", icon: "🤫" },
              { title: "주의 사항", content: "불면이나 두통 등 신경계 신호가 극도에 달하니 저녁 8시 이후에는 카페인 섭취를 엄금하십시오.", icon: "☕" },
              { title: "대비 요령", content: "신경 완화를 위해 잠자리에 들기 전 차분한 조율을 돕는 라벤더 향이나 따뜻한 허브차를 음용하십시오.", icon: "🍵" }
            ]
          },
          "亥": {
            relationName: "해오암합 (亥午암합) - 비공개 결속",
            score: 85,
            scoreLabel: "비공개결속 (실속최우선)",
            lightColor: "bg-blue-600",
            borderClass: "border-blue-300",
            cardBgClass: "bg-blue-50/10",
            statusBadge: <span className="bg-blue-100 text-blue-800 border border-blue-200 text-[10px] font-bold px-2 py-0.5 rounded shadow-sm">★ 실속 결속 (암합)</span>,
            relationDesc: "2026년 세운 오화(午火)의 지장간과 귀하의 일지 해수(亥水) 지장간이 보이지 않게 조화롭게 결합하는 해오암합(亥午暗合)이 작용합니다. 대외적으로 화려하게 드러나지 않더라도, 수면 밑에서 든든한 스폰서가 유입되거나 실속 있는 이면 계약, 혹은 비공개 파트너십을 맺어 든든한 실익을 채우기 매우 좋은 길운입니다.",
            guides: [
              { title: "추천 행동", content: "외부로 크게 소문내기보다는 내부의 핵심 관계자들과 긴밀한 전략적 파트너십을 다져두십시오.", icon: "🤫" },
              { title: "주의 사항", content: "공개되지 않은 정보라도 법적인 테두리를 벗어나는 비공식적 제안은 과감히 선을 긋는 자제력이 필요합니다.", icon: "⚖️" },
              { title: "대비 요령", content: "나만의 기술이나 특허, 비밀 포트폴리오를 조용히 준비하여 연말에 강력한 무기로 꺼내 드십시오.", icon: "🔮" }
            ]
          }
        };

        const currentData = harmonyDataMap[dayBranch] || {
          relationName: "완만한 조화 (평온)",
          score: 70,
          scoreLabel: "안전지대",
          lightColor: "bg-blue-500",
          borderClass: "bg-blue-200",
          cardBgClass: "bg-blue-50/10",
          statusBadge: <span className="bg-blue-100 text-blue-800 border border-blue-200 text-[10px] font-bold px-2 py-0.5 rounded shadow-sm">완만한 조화 (평온)</span>,
          relationDesc: "2026년 오화(午火) 세운은 귀하의 일지 지지와 특별한 충살이나 원진 등의 부정적 기류를 맺지 않고 원활히 지나갑니다. 이는 내 안식처와 삶의 근간이 큰 부침 없이 무난하고 안정된 기류를 타게 됨을 뜻합니다. 평온함을 기회 삼아 인생의 중장기적인 플랜을 구축하고 실력을 기르기에 좋습니다.",
          guides: [
            { title: "추천 행동", content: "일주일에 한 번씩 온전한 나만의 시간을 갖고 중장기 커리어 트랙을 구상해 보십시오.", icon: "🌱" },
            { title: "주의 사항", content: "안정에 심취하여 타성에 젖지 않도록 신선한 자극과 자기계발 일정을 세우는 편이 좋습니다.", icon: "🏃" },
            { title: "대비 요령", content: "일상의 평화를 즐기되 갑작스럽게 흘러가는 시장 변화를 민감하게 관찰하고 데이터를 누적하십시오.", icon: "📊" }
          ]
        };

        return wrapLock(
          <div className="space-y-6 py-4">
            <div className="text-center space-y-2 mb-8">
              <span className="text-xs text-[#A3845B] font-bold block">일주(日柱) 지합·충 진단</span>
              <h2 className="font-myeongjo text-2xl font-bold text-[#1A1A1A]">일주와 세운의 형·충·회·합 정밀 진단</h2>
              <div className="w-16 h-0.5 bg-[#A3845B]/30 mx-auto my-1" />
            </div>

            {/* 프리미엄 시각화 1: 신년 일지 안전성 신호등 & 게이지 바 */}
            <div className={"border " + currentData.borderClass + " " + currentData.cardBgClass + " rounded-xl p-5 space-y-4 shadow-sm"}>
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2">
                  <div className="relative flex h-3.5 w-3.5">
                    <span className={"animate-ping absolute inline-flex h-full w-full rounded-full " + currentData.lightColor + " opacity-75"}></span>
                    <span className={"relative inline-flex rounded-full h-3.5 w-3.5 " + currentData.lightColor}></span>
                  </div>
                  <div className="pl-2">
                    <span className="text-[10px] text-gray-400 block font-semibold">신년 내밀궁(안식처) 보안 상태</span>
                    <span className="font-myeongjo text-xs font-bold text-gray-800">진단 키워드: {currentData.scoreLabel}</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[9px] text-gray-400 block font-semibold">일지 조화도 점수</span>
                  <span className="text-sm font-bold text-gray-800">{currentData.score}점</span>
                </div>
              </div>

              {/* 게이지 바 시각화 */}
              <div className="space-y-1">
                <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div className={"h-full transition-all duration-500 " + currentData.lightColor} style={{ width: currentData.score + "%" }} />
                </div>
                <div className="flex justify-between text-[8px] text-gray-400 font-medium">
                  <span>위험 (0점)</span>
                  <span>균형 (50점)</span>
                  <span>대길 (100점)</span>
                </div>
              </div>

              <p className="text-[10px] text-gray-500 font-light leading-relaxed text-justify">
                지지는 하늘의 에너지가 땅에 내린 실제 환경으로, 배우자와 가정 안락함을 지배합니다. 조화도 점수가 낮을 때는 충돌이나 시비수가 강하니 대외 마찰을 보수적으로 회피하십시오.
              </p>
            </div>

            {/* 프리미엄 시각화 2: 3열 행동 가이드 카드 */}
            <div className="bg-[#FAF8F5] border border-[#E2DDD5] rounded-xl p-5 space-y-3">
              <span className="font-bold text-xs text-[#8A6F4C] block">📋 2026 신년 3열 행동 가이드</span>
              <div className="grid grid-cols-3 gap-2 text-left">
                {currentData.guides.map((g, idx) => (
                  <div key={idx} className="bg-white border border-[#E2DDD5] p-3 rounded-lg shadow-sm flex flex-col justify-between space-y-2">
                    <div className="flex items-center gap-1">
                      <span className="text-sm">{g.icon}</span>
                      <span className="text-[9px] font-bold text-[#8B221E]">{g.title}</span>
                    </div>
                    <p className="text-[8px] text-gray-500 leading-normal font-light text-justify flex-1">
                      {g.content}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white border border-[#E2DDD5] rounded-lg p-6 space-y-4 shadow-sm text-xs leading-relaxed font-light text-gray-700 font-traditional">
              <div className="flex justify-between items-center bg-[#FAF7F0] p-4 rounded border border-[#E2DDD5]/60 text-sm font-bold text-[#8B221E]">
                <span>귀하의 타고난 일주: {ilju}일주</span>
                {statusBadge}
              </div>
              
              <div className="p-3 bg-gray-50 rounded border border-gray-200/60 font-semibold text-[#1A1A1A] text-[11px]">
                일지 관계: {currentData.relationName}
              </div>

              <p className="text-justify font-light text-gray-600">
                일지는 사주에서 <strong>개인적인 안식처, 침실, 그리고 배우자 궁</strong>을 상징합니다. 1년의 기류를 지배하는 세운의 지지(오화)가 내 안식처의 글자와 어떤 관계를 맺느냐에 따라 실질적인 신체 컨디션과 가정생활의 평화 지수가 좌우됩니다.
              </p>
              <p className="text-justify font-light text-gray-600">
                {currentData.relationDesc}
              </p>
            </div>
          </div>,
          "일주와 세운의 합·충·형·파·해 진단"
        );
      }`;

const index = content.indexOf(targetStr);
if (index === -1) {
  console.log("CRLF match failed. Trying LF match.");
  const targetStrLF = targetStr.replace(/\r\n/g, '\n');
  const indexLF = content.indexOf(targetStrLF);
  if (indexLF === -1) {
    console.error("ny_ilju_harmony old case not found with both LF and CRLF!");
    process.exit(1);
  }
  content = content.replace(targetStrLF, newCase);
} else {
  content = content.replace(targetStr, newCase);
}

fs.writeFileSync(filePath, content, 'utf8');
console.log("=== Page 7 (ny_ilju_harmony) successfully restored to premium visualization style ===");
