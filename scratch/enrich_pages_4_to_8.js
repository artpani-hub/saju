const fs = require('fs');
const path = require('path');

const filePath = path.join('d:', '인터그리비티', 'saju', 'src', 'app', 'result', 'page.js');
const backupPath = path.join('d:', '인터그리비티', 'saju', 'src', 'app', 'result', 'page.js.bak_4_to_8');

// 1. Read original content
let content = fs.readFileSync(filePath, 'utf8');

// 2. Create backup if not exists
if (!fs.existsSync(backupPath)) {
  fs.writeFileSync(backupPath, content, 'utf8');
  console.log(`Created backup of page.js at: ${backupPath}`);
} else {
  console.log(`Backup already exists at: ${backupPath}`);
}

console.log("=== Enriching Pages 4 ~ 8 ===");

// 헬퍼 함수: case "startCase": ~ case "endCase": 영역 치환
function replaceCase(startCase, endCase, newContent) {
  const startTarget = `case "${startCase}":`;
  const endTarget = `case "${endCase}":`;
  
  const startIdx = content.indexOf(startTarget);
  if (startIdx === -1) {
    throw new Error(`Start case not found: ${startCase}`);
  }
  
  const endIdx = content.indexOf(endTarget, startIdx + startTarget.length);
  if (endIdx === -1) {
    throw new Error(`End case not found: ${endCase}`);
  }
  
  // startIdx 전까지 + 신규 내용 + endIdx 부터 끝까지 결합
  content = content.slice(0, startIdx) + newContent + "\n\n      " + content.slice(endIdx);
  console.log(`Successfully replaced case "${startCase}" -> case "${endCase}"`);
}

// -------------------------------------------------------------
// [4페이지] case "elements": -> case "character":
// -------------------------------------------------------------
const enrichedElements = `case "elements": {
      // 5개 오행 개수 계산
      const woodCount = sajuInfo.elements.목 || 0;
      const fireCount = sajuInfo.elements.화 || 0;
      const earthCount = sajuInfo.elements.토 || 0;
      const metalCount = sajuInfo.elements.금 || 0;
      const waterCount = sajuInfo.elements.수 || 0;
      const totalEl = woodCount + fireCount + earthCount + metalCount + waterCount || 8;

      // 5개 오행 좌표 (펜타곤 상생 다이어그램용)
      // 중심 (100, 100), 반지름 60
      const getPentagonPoints = () => {
        const angles = [0, 72, 144, 216, 288];
        return angles.map(angle => {
          const rad = (angle - 90) * Math.PI / 180;
          return {
            x: 100 + 60 * Math.cos(rad),
            y: 100 + 60 * Math.sin(rad)
          };
        });
      };
      
      const pts = getPentagonPoints();

      // 결핍/과다에 따른 행운 가이드 처방
      const elementsList = [
        { name: "목", count: woodCount, text: "푸른 나무 (木)", color: "#5F7A68", bg: "bg-[#5F7A68]/10", border: "border-[#5F7A68]/30", num: "3, 8", dir: "동쪽", item: "원목 인테리어 소품, 반려식물 화분", colorDesc: "초록색, 에메랄드" },
        { name: "화", count: fireCount, text: "붉은 불꽃 (火)", color: "#DC2626", bg: "bg-red-50", border: "border-red-200", num: "2, 7", dir: "남쪽", item: "향초, 조명 인프라, 붉은색 포인트 액세서리", colorDesc: "오렌지, 핑크, 레드" },
        { name: "토", count: earthCount, text: "황색 대지 (土)", color: "#A3845B", bg: "bg-[#A3845B]/10", border: "border-[#A3845B]/30", num: "5, 10", dir: "중앙", item: "도자기 그릇, 돌/원석 반지", colorDesc: "황토색, 베이지, 브라운" },
        { name: "금", count: metalCount, text: "하얀 바위 (金)", color: "#9CA3AF", bg: "bg-gray-50", border: "border-gray-200", num: "4, 9", dir: "서쪽", item: "은반지, 메탈 시계, 정밀 필기구", colorDesc: "화이트, 실버, 메탈" },
        { name: "수", count: waterCount, text: "검은 물결 (水)", color: "#1F2937", bg: "bg-gray-100", border: "border-gray-300", num: "1, 6", dir: "북쪽", item: "가습기, 실내 분수, 투명한 유리컵", colorDesc: "검은색, 네이비" }
      ];

      // 정렬하여 개수가 가장 적은 오행(결핍) 찾기
      const sortedByCount = [...elementsList].sort((a, b) => a.count - b.count);
      const deficientEl = sortedByCount[0];

      return (
        <div className="space-y-6">
          <h3 className="font-myeongjo text-lg font-bold text-[#1A1A1A] border-b border-[#E2DDD5] pb-2">
            📊 오행(五행) 에너지 분포 분석
          </h3>
          <p className="text-xs text-[#5F5F5F] leading-relaxed">
            사주는 목(나무), 화(불), 토(흙), 금(쇠), 수(물) 5가지 자연 에너지를 상징하는 <strong>'오행'</strong>의 비율로 해석됩니다. 오행의 균형은 삶의 크고 작은 굴곡을 조절하는 뼈대가 되며, 내 사주에 부족하거나 너무 과한 에너지를 파악하여 일상(색상, 숫자, 환경 등)에서 의식적으로 보완해 나갈 때 극적인 운의 개화와 자산 형성이 찾아옵니다.
          </p>

          {/* 프리미엄 시각화 1: 오행 상생상극 순환 SVG 펜타곤 */}
          <div className="bg-white border border-[#E2DDD5] rounded-xl p-5 shadow-sm flex flex-col items-center">
            <span className="font-bold text-xs text-[#8A6F4C] mb-4">🌀 내 사주 오행 상생상극(相生相剋) 순환 구조</span>
            <div className="relative w-[210px] h-[210px] flex items-center justify-center">
              <svg viewBox="0 0 200 200" className="w-[180px] h-[180px]">
                {/* 상극 별 모양 선 */}
                <path d={\`M \${pts[0].x} \${pts[0].y} L \${pts[2].x} \${pts[2].y} L \${pts[4].x} \${pts[4].y} L \${pts[1].x} \${pts[1].y} L \${pts[3].x} \${pts[3].y} Z\`} fill="none" stroke="#E2DDD5" strokeWidth="1.5" strokeDasharray="3,3" />
                {/* 상생 외부 오각형 선 */}
                <polygon points={\`\${pts[0].x},\${pts[0].y} \${pts[1].x},\${pts[1].y} \${pts[2].x},\${pts[2].y} \${pts[3].x},\${pts[3].y} \${pts[4].x},\${pts[4].y}\`} fill="none" stroke="#A3845B" strokeWidth="1.5" opacity="0.4" />
                
                {/* 각 꼭짓점 오행 노드 */}
                {elementsList.map((item, idx) => {
                  const pt = pts[idx];
                  const percentage = (item.count / totalEl * 100).toFixed(0);
                  const circleSize = 18 + item.count * 3;
                  return (
                    <g key={idx}>
                      <circle cx={pt.x} cy={pt.y} r={circleSize} fill={item.color} opacity="0.9" />
                      <circle cx={pt.x} cy={pt.y} r={circleSize + 3} fill="none" stroke={item.color} strokeWidth="1" opacity="0.4" />
                      <text x={pt.x} y={pt.y - 1} textAnchor="middle" fill="#FFFFFF" fontSize="9" fontWeight="bold">{item.name}</text>
                      <text x={pt.x} y={pt.y + 8} textAnchor="middle" fill="#FFFFFF" fontSize="7" opacity="0.9">{percentage}%</text>
                    </g>
                  );
                })}
              </svg>
            </div>
            <p className="text-[10px] text-gray-500 font-light text-center mt-3">
              * 노드의 지름은 내 사주 원국에서 해당 오행이 차지하는 개수와 세기에 비례합니다.
            </p>
          </div>

          <div className="space-y-3 bg-white border border-[#E2DDD5] rounded-lg p-5 shadow-sm">
            {elementsList.map((item) => {
              const percentage = (item.count / totalEl) * 100;
              return (
                <div key={item.name} className="flex items-center gap-3 text-xs">
                  <span className={\`w-16 text-center py-1 rounded font-bold text-[11px] \${getElementColor(item.name)}\`}>
                    {item.name} ({item.count}개)
                  </span>
                  <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
                    <div className={\`h-full transition-all duration-500 \${getElementBarColor(item.name)}\`} style={{ width: \`\${percentage}%\` }} />
                  </div>
                  <span className="w-10 text-right font-semibold text-[#5F5F5F]">{Math.round(percentage)}%</span>
                </div>
              );
            })}
          </div>

          {/* 프리미엄 시각화 2: 2026년 오행 럭키 플레이트 */}
          <div className={\`border \${deficientEl.border} \${deficientEl.bg} rounded-xl p-5 space-y-3\`}>
            <div className="flex items-center gap-2">
              <span className="text-lg">🧭</span>
              <div>
                <span className="text-[10px] text-[#8A6F4C] font-bold block">결핍 오행 보강 처방</span>
                <span className="font-myeongjo text-sm font-bold text-gray-800">귀하의 수호 오행: {deficientEl.text}</span>
              </div>
            </div>
            <p className="text-[11px] text-gray-600 leading-relaxed font-light text-justify">
              귀하의 사주 원국에서 가장 기운이 약한 오행은 <strong>{deficientEl.text}</strong>({deficientEl.count}자)입니다. 2026년 병오년의 타오르는 불 기운 속에 밸런스를 잡기 위해서는 이 부족한 기운을 일상에서 다음과 같이 의식적으로 수혈해 주셔야 합니다.
            </p>
            <div className="grid grid-cols-2 gap-3 text-[10px] font-medium text-gray-700 pt-1">
              <div className="bg-white/80 backdrop-blur-xs p-3 rounded border border-gray-200/50 space-y-1">
                <span className="text-gray-400 block">🎨 행운의 색상</span>
                <span className="font-bold text-[#1A1A1A]">{deficientEl.colorDesc} 계열</span>
              </div>
              <div className="bg-white/80 backdrop-blur-xs p-3 rounded border border-gray-200/50 space-y-1">
                <span className="text-gray-400 block">🔢 행운의 숫자</span>
                <span className="font-bold text-[#1A1A1A]">{deficientEl.num}</span>
              </div>
              <div className="bg-white/80 backdrop-blur-xs p-3 rounded border border-gray-200/50 space-y-1">
                <span className="text-gray-400 block">🗺️ 행운의 방위</span>
                <span className="font-bold text-[#1A1A1A]">{deficientEl.dir} (생활/공부 공간 기점)</span>
              </div>
              <div className="bg-white/80 backdrop-blur-xs p-3 rounded border border-gray-200/50 space-y-1">
                <span className="text-gray-400 block">💍 럭키 아이템</span>
                <span className="font-bold text-[#1A1A1A] truncate block">{deficientEl.item}</span>
              </div>
            </div>
          </div>

          <div className="bg-[#F9F8F6] p-4 rounded-lg border border-[#E2DDD5] text-xs space-y-2 leading-relaxed font-traditional font-light text-gray-700">
            <h4 className="font-bold text-[#A3845B]">💡 오행 에너지 종합 총평</h4>
            <p className="text-[#2C2C2C] font-light whitespace-pre-line">
              {personalizedText.analysis}
            </p>
          </div>
        </div>
      );
    }`;

// -------------------------------------------------------------
// [5페이지] case "metrics_chart": -> case "metrics_detail_1":
// -------------------------------------------------------------
const enrichedMetricsChart = `case "metrics_chart": {
      const chartItems = [
        { label: "독립성 (Independence)", val: metrics.scores.independence, color: "bg-emerald-600", stroke: "#059669" },
        { label: "승부욕 (Competitiveness)", val: metrics.scores.competitiveness, color: "bg-red-600", stroke: "#DC2626" },
        { label: "기회포착 (Opportunity)", val: metrics.scores.opportunity, color: "bg-blue-600", stroke: "#2563EB" },
        { label: "사업감각 (Business Sense)", val: metrics.scores.business, color: "bg-amber-600", stroke: "#D97706" },
        { label: "통찰력 (Insight)", val: metrics.scores.insight, color: "bg-purple-600", stroke: "#7C3AED" },
        { label: "추진력 (Drive)", val: metrics.scores.drive, color: "bg-indigo-600", stroke: "#4F46E5" },
        { label: "인내력 (Patience)", val: metrics.scores.patience, color: "bg-teal-600", stroke: "#0D9488" },
        { label: "대인협상 (Negotiation)", val: metrics.scores.negotiation, color: "bg-pink-600", stroke: "#DB2777" }
      ];

      // 방사형 레이더 차트 다이어그램용 좌표 계산 (중심 100, 100, 최대 반지름 70)
      const radarPoints = chartItems.map((item, idx) => {
        const angle = idx * 45;
        const rad = (angle - 90) * Math.PI / 180;
        const radius = (item.val / 100) * 65;
        return {
          x: 100 + radius * Math.cos(rad),
          y: 100 + radius * Math.sin(rad)
        };
      });

      const radarPointsStr = radarPoints.map(p => \`\${p.x},\${p.y}\`).join(" ");

      const getGuidePoints = (ratio) => {
        const radius = ratio * 65;
        return chartItems.map((_, idx) => {
          const angle = idx * 45;
          const rad = (angle - 90) * Math.PI / 180;
          return \`\${100 + radius * Math.cos(rad)},\${100 + radius * Math.sin(rad)}\`;
        }).join(" ");
      };

      const topTalents = [...chartItems]
        .sort((a, b) => b.val - a.val)
        .slice(0, 3);

      const talentIcons = {
        "독립성 (Independence)": "🌱 자립",
        "승부욕 (Competitiveness)": "🔥 극복",
        "기회포착 (Opportunity)": "🎯 포착",
        "사업감각 (Business Sense)": "💼 설계",
        "통찰력 (Insight)": "👁️ 통찰",
        "추진력 (Drive)": "⚡ 실행",
        "인내력 (Patience)": "🛡️ 인내",
        "대인협상 (Negotiation)": "🤝 협상"
      };

      return (
        <div className="space-y-6">
          <h3 className="font-myeongjo text-lg font-bold text-[#1A1A1A] border-b border-[#E2DDD5] pb-2">
            📈 사주 8대 성향 수치표
          </h3>
          <p className="text-xs text-[#5F5F5F] leading-relaxed">
            사주에 담긴 잠재력을 현대 사회에서 가장 직관적으로 이해할 수 있는 <strong>8가지 성향 지표(능력치)</strong>로 수치화한 것입니다. 내가 직장이나 사업, 대인관계에서 발휘하는 숨은 지능지수(IQ) 및 감성지수(EQ)의 강도를 뜻합니다.
          </p>

          {/* 프리미엄 시각화 1: 커스텀 SVG 방사형 레이더 차트 */}
          <div className="bg-white border border-[#E2DDD5] rounded-xl p-5 shadow-sm flex flex-col items-center">
            <span className="font-bold text-xs text-[#8A6F4C] mb-4">🕸️ 내 사주 성향 오행 밸런스 레이더 맵</span>
            <div className="relative w-[210px] h-[210px] flex items-center justify-center">
              <svg viewBox="0 0 200 200" className="w-[190px] h-[190px]">
                <polygon points={getGuidePoints(1.0)} fill="none" stroke="#F3F4F6" strokeWidth="1" />
                <polygon points={getGuidePoints(0.75)} fill="none" stroke="#E5E7EB" strokeWidth="1" />
                <polygon points={getGuidePoints(0.5)} fill="none" stroke="#E5E7EB" strokeWidth="1" strokeDasharray="2,2" />
                <polygon points={getGuidePoints(0.25)} fill="none" stroke="#F3F4F6" strokeWidth="1" />

                {chartItems.map((_, idx) => {
                  const angle = idx * 45;
                  const rad = (angle - 90) * Math.PI / 180;
                  return (
                    <line key={idx} x1="100" y1="100" x2={100 + 65 * Math.cos(rad)} y2={100 + 65 * Math.sin(rad)} stroke="#E5E7EB" strokeWidth="1" />
                  );
                })}

                <polygon points={radarPointsStr} fill="rgba(163, 132, 91, 0.25)" stroke="#A3845B" strokeWidth="2" />

                {radarPoints.map((p, idx) => (
                  <circle key={idx} cx={p.x} cy={p.y} r="3" fill={chartItems[idx].stroke} stroke="#FFFFFF" strokeWidth="1" />
                ))}

                {chartItems.map((item, idx) => {
                  const angle = idx * 45;
                  const rad = (angle - 90) * Math.PI / 180;
                  const labelRadius = 78;
                  const x = 100 + labelRadius * Math.cos(rad);
                  const y = 100 + labelRadius * Math.sin(rad) + 3;
                  const anchor = Math.abs(x - 100) < 10 ? "middle" : x > 100 ? "start" : "end";
                  const labelName = item.label.split(" ")[0];
                  return (
                    <text key={idx} x={x} y={y} textAnchor={anchor} fontSize="7" fontWeight="bold" fill="#4B5563">{labelName}</text>
                  );
                })}
              </svg>
            </div>
          </div>

          {/* 프리미엄 시각화 2: 3대 핵심 재능 보드 */}
          <div className="bg-[#FAF8F5] border border-[#E2DDD5] rounded-xl p-5 space-y-3">
            <span className="font-bold text-xs text-[#8A6F4C] block">🏆 귀하의 사주 3대 핵심 기질 (Top Talents)</span>
            <div className="grid grid-cols-3 gap-2">
              {topTalents.map((item, idx) => (
                <div key={idx} className="bg-white border border-[#E2DDD5]/70 p-3 rounded-lg shadow-sm text-center space-y-1">
                  <span className="text-lg block">{talentIcons[item.label]}</span>
                  <span className="text-[10px] text-[#1A1A1A] font-bold block truncate">{item.label.split(" ")[0]}</span>
                  <span className="text-xs text-[#8B221E] font-bold block">{item.val}점</span>
                </div>
              ))}
            </div>
            <p className="text-[10px] text-gray-500 font-light text-justify pt-1 leading-relaxed">
              위 3가지 능력은 귀하의 사주 원국에서 식상생재 혹은 관인상생의 생조(生助) 기류를 직간접적으로 받아 가장 강력하게 깨어있는 달란트입니다. 직무 결단이나 투자 시 위 3대 무기를 주축으로 삼을 때 가장 승률이 높습니다.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {chartItems.map((item, idx) => (
              <div key={idx} className="bg-white border border-[#E2DDD5] rounded-lg p-4 shadow-sm space-y-2">
                <div className="flex justify-between text-xs font-semibold text-[#1A1A1A]">
                  <span>{item.label}</span>
                  <span className="text-[#8B221E] font-bold">{item.val}점</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className={\`h-full \${item.color}\`} style={{ width: \`\${item.val}%\` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }`;

// -------------------------------------------------------------
// [6페이지] case "metrics_detail_1": -> case "metrics_detail_2":
// -------------------------------------------------------------
const enrichedDetail1 = `case "metrics_detail_1": {
      const indVal = metrics.scores.independence;
      const compVal = metrics.scores.competitiveness;
      
      const ratio = indVal / (indVal + compVal || 1);
      const pointerPos = 30 + ratio * 140;

      let synergyTitle = "주도적 성과 개척형";
      let synergyDesc = "독립적으로 일하면서도 성과 지표가 뚜렷한 환경에서 활약할 때 양쪽 시너지가 극대화됩니다. 남의 지시에 기대지 않으면서도 한계를 돌파하는 추진력이 장점입니다.";
      if (indVal > 80 && compVal > 80) {
        synergyTitle = "독보적 혁신가 (스타트업 창업가형)";
        synergyDesc = "매우 강한 자아와 집념이 융합되어 난공불락의 문제를 무조건 해결하려는 극강의 기질을 보입니다. 단, 주변과의 극단적인 독선 마찰을 강력하게 주의하셔야 합니다.";
      } else if (indVal > compVal + 15) {
        synergyTitle = "마이웨이 연구 / 전문가형";
        synergyDesc = "경쟁을 통한 승리보다는 나만의 속도로 독창적인 성과를 쌓아올릴 때 기운이 편안해집니다. 외부 간섭을 배제할 수 있는 권한을 얻는 것이 좋습니다.";
      } else if (compVal > indVal + 15) {
        synergyTitle = "성과추구형 전투 리더십";
        synergyDesc = "협업 및 팀워크를 통해서라도 공동의 적이나 뚜렷한 목표치를 격파해 나갈 때 열정이 폭발합니다. 경쟁이 활성화된 필드에 자신을 던져야 활발해집니다.";
      }

      return (
        <div className="space-y-6 flex flex-col justify-between h-full">
          <div>
            <h3 className="font-myeongjo text-lg font-bold text-[#1A1A1A] border-b border-[#E2DDD5] pb-2 mb-4">
              🔍 8대 성향 수치 심층 풀이 (독립성 / 승부욕)
            </h3>
            <p className="text-xs text-[#5F5F5F] leading-relaxed mb-6 font-light">
              나를 상징하는 8가지 성향 중 자아의 핵심이 되는 독립성과 목표 달성의 불꽃인 승부욕을 명리론과 현대 행동 심리학 관점에서 종합적으로 분석한 심층 진단 보고서입니다.
            </p>

            {/* 프리미엄 시각화: 두 기질의 시너지 에너지 스펙트럼 */}
            <div className="bg-white border border-[#E2DDD5] rounded-xl p-5 shadow-sm mb-6 space-y-4">
              <span className="font-bold text-xs text-[#8A6F4C] block">⚖️ 독립성 vs 승부욕 시너지 에너지 밸런스</span>
              <div className="relative h-12 bg-gray-50 rounded-lg flex items-center px-4 border border-gray-100">
                <div className="w-full flex justify-between text-[10px] text-gray-400 font-semibold px-2">
                  <span>독립성 중심 ({indVal}점)</span>
                  <span>승부욕 중심 ({compVal}점)</span>
                </div>
                <div className="absolute left-6 right-6 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-emerald-500 via-amber-400 to-red-500 w-full" />
                </div>
                <svg className="absolute left-0 w-full h-full pointer-events-none" viewBox="0 0 200 48">
                  <polygon points={\`\${pointerPos},26 \${pointerPos - 6},15 \${pointerPos + 6},15\`} fill="#1A1A1A" />
                  <circle cx={pointerPos} cy="14" r="3" fill="#A3845B" />
                </svg>
              </div>

              <div className="bg-[#FAF8F5] p-4 rounded-lg border border-[#E2DDD5]/70 space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-gray-800">
                  <span>🌟 두 기질의 시너지 지향점:</span>
                  <span className="text-[#8B221E]">{synergyTitle}</span>
                </div>
                <p className="text-[10px] text-gray-600 font-light leading-relaxed text-justify">
                  {synergyDesc}
                </p>
              </div>
            </div>

            <div className="space-y-6 text-xs text-[#2C2C2C] leading-relaxed">
              <div className="bg-white border border-[#E2DDD5] rounded-xl p-6 shadow-sm space-y-4">
                <div className="flex justify-between items-center border-b border-[#E2DDD5]/60 pb-2">
                  <h4 className="font-myeongjo text-[14px] font-bold text-[#5F7A68]">
                    • 독립성 지표 ({indVal}점) 심층 진단
                  </h4>
                  <span className="text-xs font-bold text-[#5F7A68] bg-[#5F7A68]/10 px-2.5 py-0.5 rounded-full">주체적 개척</span>
                </div>
                <p className={\`font-light font-traditional text-justify leading-relaxed text-[#2C2C2C] \${blurClass}\`}>
                  귀하의 독립성 점수는 **{indVal}점**으로, 이는 타인의 원조에 기대지 않고 자신의 운명을 주도적으로 개척해 가려는 강인한 자립심과 자아 강도를 의미합니다. 사주 원국 내에 독립성을 관장하는 기운이 잘 조율되어 있어, 집단이나 조직의 획일화된 규칙에 무조건 순응하기보다는 본인이 직접 의사결정의 주체가 되어 주도적으로 판을 이끌어갈 때 지치지 않고 최고의 퍼포먼스를 발휘하게 됩니다. 역경 속에서도 흔들리지 않는 자수성가형 인물의 표본이라 할 수 있습니다. 다만, 자존심이 다소 강해 타인의 이성적이고 진심 어린 조언마저 귀찮은 간섭이나 침해로 오해하여 밀어내는 고집(독선)으로 발현될 수 있으니, 유연한 경청의 태도를 의식적으로 기르는 것이 개운의 핵심입니다.
                </p>
                <div className="bg-[#F9F8F6] p-3 rounded-lg border border-[#E2DDD5]/40 text-[11px] text-gray-600">
                  📌 <strong>독립성 극대화 가이드라인:</strong> 의존적인 협업 구도보다는 나만의 고유 권한이 확보된 R&D, 독자 프로젝트, 혹은 1인 전담 업무처럼 책임 소재가 명확한 포지션에서 업무 생산성이 수 배 이상 폭발합니다. 중대한 결정 시에는 신뢰할 수 있는 멘토들의 조언을 최소 2개 이상 비교 검증하는 프로세스를 거치십시오.
                </div>
              </div>

              <div className="bg-white border border-[#E2DDD5] rounded-xl p-6 shadow-sm space-y-4">
                <div className="flex justify-between items-center border-b border-[#E2DDD5]/60 pb-2">
                  <h4 className="font-myeongjo text-[14px] font-bold text-red-700">
                    • 승부욕 지표 ({compVal}점) 심층 진단
                  </h4>
                  <span className="text-xs font-bold text-red-700 bg-red-50 px-2.5 py-0.5 rounded-full">성과 창출</span>
                </div>
                <p className={\`font-light font-traditional text-justify leading-relaxed text-[#2C2C2C] \${blurClass}\`}>
                  귀하의 승부욕 지표는 **{compVal}점**으로 매우 뜨겁고 활기찬 목표 지향적 본능을 보여줍니다. 단순히 남을 이기려는 심리적 지배욕을 넘어, 장애물을 만나거나 남들이 포기하는 한계 상황일 때 승부욕이 자극되어 오히려 성취 속도와 에너지가 강력하게 활성화됩니다. 불리한 조건 속에서도 상황을 반전시켜 기필코 목표를 쟁취해 내는 돌파력이 우수합니다. 하지만 이 뜨거운 에너지는 감정의 조급증이나 작은 패배에도 크게 흔들리는 급격한 감정 냉각을 야기할 수 있습니다. 겉으로는 과열된 승부 본능을 유지하되, 내적으로는 냉철한 페이스 조절을 통해 장기 레이스에서 방전되지 않도록 제어 장치를 심어야 합니다.
                </p>
                <div className="bg-[#F9F8F6] p-3 rounded-lg border border-[#E2DDD5]/40 text-[11px] text-gray-600">
                  📌 <strong>승부욕 극대화 가이드라인:</strong> 정량화된 실적 평가 시스템이 존재하거나 경쟁적 자극이 주어지는 환경에 자신을 배치하면 잠재능력이 120% 각성됩니다. 다만, 과열된 날카로움이 주변인과의 불필요한 마찰로 번지지 않도록 하루 일과 후 호흡을 가다듬는 휴식을 꼭 습관화하십시오.
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }`;

// -------------------------------------------------------------
// [7페이지] case "metrics_detail_2": -> case "metrics_detail_3":
// -------------------------------------------------------------
const enrichedDetail2 = `case "metrics_detail_2": {
      const oppVal = metrics.scores.opportunity;
      const bizVal = metrics.scores.business;
      
      const ratio = oppVal / (oppVal + bizVal || 1);
      const pointerPos = 30 + ratio * 140;

      let synergyTitle = "현실적 투자 실리파";
      let synergyDesc = "투자처를 명확히 판별하고 사업적 위험 요소가 닥치기 전에 기민하게 빠져나오는 뛰어난 실리추구형입니다. 타이밍 선점 능력이 최대 무기입니다.";
      if (oppVal > 80 && bizVal > 80) {
        synergyTitle = "자산 가치 극대화 설계자";
        synergyDesc = "부가가치를 창출하는 비즈니스 안목과 그것을 현금화하는 투자 판단력이 결합하여 금융 자산 및 실물 자산을 극적으로 굴려나갈 융합형 인재입니다.";
      } else if (oppVal > bizVal + 15) {
        synergyTitle = "트렌드 리스크 테이커";
        synergyDesc = "새로운 아이템이나 흐름이 왔을 때 가장 먼저 올라타는 얼리어답터형 투자 성향입니다. 단, 사기나 장기 보유 시 손실 리스크를 분산하십시오.";
      } else if (bizVal > oppVal + 15) {
        synergyTitle = "보수적 시스템 빌더";
        synergyDesc = "빠른 단기 마진보다는 장기적이고 견고한 오프라인/온라인 시스템 수익을 설계하려는 경향입니다. 느리지만 매우 안정적인 자산 형성을 지향합니다.";
      }

      return (
        <div className="space-y-6 flex flex-col justify-between h-full">
          <div>
            <h3 className="font-myeongjo text-lg font-bold text-[#1A1A1A] border-b border-[#E2DDD5] pb-2 mb-4">
              🔍 8대 성향 수치 심층 풀이 (기회포착 / 사업감각)
            </h3>
            <p className="text-xs text-[#5F5F5F] leading-relaxed mb-6 font-light">
              내 운명의 재물적 흐름을 관장하는 기회포착 능력과 시장의 부가가치를 창출해내는 사업적 본능을 다각도로 분석하여 실제 자산 축적에 적용 가능한 전략적 해설을 담았습니다.
            </p>

            {/* 프리미엄 시각화: 두 기질의 시너지 에너지 스펙트럼 */}
            <div className="bg-white border border-[#E2DDD5] rounded-xl p-5 shadow-sm mb-6 space-y-4">
              <span className="font-bold text-xs text-[#8A6F4C] block">⚖️ 기회포착 vs 사업감각 시너지 에너지 밸런스</span>
              <div className="relative h-12 bg-gray-50 rounded-lg flex items-center px-4 border border-gray-100">
                <div className="w-full flex justify-between text-[10px] text-gray-400 font-semibold px-2">
                  <span>기회포착 중심 ({oppVal}점)</span>
                  <span>사업감각 중심 ({bizVal}점)</span>
                </div>
                <div className="absolute left-6 right-6 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-blue-500 via-amber-400 to-amber-600 w-full" />
                </div>
                <svg className="absolute left-0 w-full h-full pointer-events-none" viewBox="0 0 200 48">
                  <polygon points={\`\${pointerPos},26 \${pointerPos - 6},15 \${pointerPos + 6},15\`} fill="#1A1A1A" />
                  <circle cx={pointerPos} cy="14" r="3" fill="#A3845B" />
                </svg>
              </div>

              <div className="bg-[#FAF8F5] p-4 rounded-lg border border-[#E2DDD5]/70 space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-gray-800">
                  <span>💼 두 기질의 자산 운용 방식:</span>
                  <span className="text-[#8B221E]">{synergyTitle}</span>
                </div>
                <p className="text-[10px] text-gray-600 font-light leading-relaxed text-justify">
                  {synergyDesc}
                </p>
              </div>
            </div>

            <div className="space-y-6 text-xs text-[#2C2C2C] leading-relaxed font-traditional text-gray-700">
              <div className="bg-white border border-[#E2DDD5] rounded-xl p-6 shadow-sm space-y-4">
                <div className="flex justify-between items-center border-b border-[#E2DDD5]/60 pb-2">
                  <h4 className="font-myeongjo text-[14px] font-bold text-blue-700">
                    • 기회포착 지표 ({oppVal}점) 심층 진단
                  </h4>
                  <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full">직관적 안목</span>
                </div>
                <p className={\`font-light text-justify leading-relaxed text-[#2C2C2C] \${blurClass}\`}>
                  귀하의 기회포착 지표는 **{oppVal}점**입니다. 이는 외부 시장의 트렌드 변화나 흐름 속에서 유무형의 가치와 기회를 남들보다 빠르게 인지해 내는 직관력과 안목의 강도를 의미합니다. 이 기운이 발달한 사람은 계약 구조상의 빈틈, 유망한 투자처, 혹은 사업적 제휴 관계에서 본인에게 유리한 결정적인 타이밍을 기막히게 맞추는 동물적 본능을 소유하고 있습니다. 위기를 기회로 치환하는 센스가 대단히 뛰어난 사주입니다. 다만, 단기적인 타이밍 싸움에만 몰두하면 거시적인 큰 판의 흐름을 놓칠 수 있으므로 성급한 진입보다는 관망과 검증을 병행하는 호흡의 정돈이 요구됩니다.
                </p>
                <div className="bg-[#F9F8F6] p-3 rounded-lg border border-[#E2DDD5]/40 text-[11px] text-gray-600">
                  📌 <strong>기회포착 극대화 가이드라인:</strong> 시장 동향을 선점해야 하는 신규 기획, 트렌드 분석가, 투자 파트너십 조율 직무에서 활약할 때 이익을 최대화합니다. 결정을 내리기 직전, 단순한 본인의 촉에만 의존하기보다는 객관적 통계 데이터 검증 과정을 거쳐 기회포착의 정밀도를 200% 보강하십시오.
                </div>
              </div>

              <div className="bg-white border border-[#E2DDD5] rounded-xl p-6 shadow-sm space-y-4">
                <div className="flex justify-between items-center border-b border-[#E2DDD5]/60 pb-2">
                  <h4 className="font-myeongjo text-[14px] font-bold text-amber-700">
                    • 사업감각 지표 ({bizVal}점) 심층 진단
                  </h4>
                  <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full">시스템 설계</span>
                </div>
                <p className={\`font-light text-justify leading-relaxed text-[#2C2C2C] \${blurClass}\`}>
                  귀하의 사업감각 지표는 **{bizVal}점**을 기록하고 있습니다. 이는 정해진 월급 체계의 안정적 울타리에 안주하기보다는, 유동적인 자본의 흐름을 설계하고 자원과 인력을 구조화하여 새로운 수익을 창출하려는 시스템 구축 본능입니다. 플랫폼 비즈니스나 중간 유통, 기술의 상용화 등 시장의 부가가치 구조를 머릿속으로 시뮬레이션하는 능력이 남다릅니다. 설령 지금 직장생활을 하고 계시더라도 마음 깊은 곳에서는 언제든 자신의 브랜드를 내걸고 독자적인 사업체를 경영하고 싶어 하는 불씨가 항상 불타고 있습니다. 다만 세밀한 재무 설계와 내실 관리 없이 확장성만 쫓아가면 유동성 위기를 맞이할 수 있으니 튼튼한 기초 체력이 우선입니다.
                </p>
                <div className="bg-[#F9F8F6] p-3 rounded-lg border border-[#E2DDD5]/40 text-[11px] text-gray-600">
                  📌 <strong>사업감각 극대화 가이드라인:</strong> 나의 직접적인 육체적 노동력 투입을 배제하더라도 수익이 순환하도록 만드는 무형 자산(지적 재산권, 자동화 중개 시스템, 대리인 체제 등) 구축에 흥미를 가지고 체계적인 비즈니스 구조를 중점 설계해 나가야 합니다.
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }`;

// -------------------------------------------------------------
// [8페이지] case "metrics_detail_3": -> case "metrics_detail_4":
// -------------------------------------------------------------
const enrichedDetail3 = `case "metrics_detail_3": {
      const driVal = metrics.scores.drive;
      const patVal = metrics.scores.patience;
      
      const ratio = driVal / (driVal + patVal || 1);
      const pointerPos = 30 + ratio * 140;

      let synergyTitle = "속도 조절형 실행가";
      let synergyDesc = "상황에 따라 빠르게 달리는 추진력과 필요한 때 견뎌내는 인내력이 잘 조화되어 있습니다. 다만 추진 시점과 인내 시점을 혼동하여 생기는 비효율을 줄여야 합니다.";
      if (driVal > 80 && patVal > 80) {
        synergyTitle = "불도저형 대기만성 리더";
        synergyDesc = "매우 과감하게 계획을 밀고 나가면서도 아무리 모진 시련이 와도 포기하지 않고 견디는 철옹성 같은 결합입니다. 궁극적인 자수성가형 사업가 자질입니다.";
      } else if (driVal > patVal + 15) {
        synergyTitle = "기동형 프런티어";
        synergyDesc = "장기적인 수비보다는 빠르게 판을 벌리고 영역을 확장하는 기획 실행에 압도적인 강점을 보입니다. 지지부진한 관리 단계는 타인에게 양도하는 것이 이롭습니다.";
      } else if (patVal > driVal + 15) {
        synergyTitle = "장기 내실 수비대장";
        synergyDesc = "성급하게 판을 키워 위험을 초래하기보다는 돌다리도 두들겨 보고 건너며 리스크가 완전히 소거될 때까지 우직하게 대기하는 장기 전략가형입니다.";
      }

      return (
        <div className="space-y-6 flex flex-col justify-between h-full">
          <div>
            <h3 className="font-myeongjo text-lg font-bold text-[#1A1A1A] border-b border-[#E2DDD5] pb-2 mb-4">
              🔍 8대 성향 수치 심층 풀이 (추진력 / 인내력)
            </h3>
            <p className="text-xs text-[#5F5F5F] leading-relaxed mb-6 font-light">
              행동의 속도를 조절하는 돌파구인 추진력과 난관을 견뎌내어 마침내 결실을 얻어내는 우직한 인내력의 조화를 상세 진단합니다.
            </p>

            {/* 프리미엄 시각화: 두 기질의 시너지 에너지 스펙트럼 */}
            <div className="bg-white border border-[#E2DDD5] rounded-xl p-5 shadow-sm mb-6 space-y-4">
              <span className="font-bold text-xs text-[#8A6F4C] block">⚖️ 추진력 vs 인내력 시너지 에너지 밸런스</span>
              <div className="relative h-12 bg-gray-50 rounded-lg flex items-center px-4 border border-gray-100">
                <div className="w-full flex justify-between text-[10px] text-gray-400 font-semibold px-2">
                  <span>추진력 중심 ({driVal}점)</span>
                  <span>인내력 중심 ({patVal}점)</span>
                </div>
                <div className="absolute left-6 right-6 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-indigo-500 via-amber-400 to-teal-500 w-full" />
                </div>
                <svg className="absolute left-0 w-full h-full pointer-events-none" viewBox="0 0 200 48">
                  <polygon points={\`\${pointerPos},26 \${pointerPos - 6},15 \${pointerPos + 6},15\`} fill="#1A1A1A" />
                  <circle cx={pointerPos} cy="14" r="3" fill="#A3845B" />
                </svg>
              </div>

              <div className="bg-[#FAF8F5] p-4 rounded-lg border border-[#E2DDD5]/70 space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-gray-800">
                  <span>🏃 두 기질의 결합 속도:</span>
                  <span className="text-[#8B221E]">{synergyTitle}</span>
                </div>
                <p className="text-[10px] text-gray-600 font-light leading-relaxed text-justify">
                  {synergyDesc}
                </p>
              </div>
            </div>

            <div className="space-y-6 text-xs text-[#2C2C2C] leading-relaxed font-traditional text-gray-700">
              <div className="bg-white border border-[#E2DDD5] rounded-xl p-6 shadow-sm space-y-4">
                <div className="flex justify-between items-center border-b border-[#E2DDD5]/60 pb-2">
                  <h4 className="font-myeongjo text-[14px] font-bold text-indigo-700">
                    • 추진력 지표 ({driVal}점) 심층 진단
                  </h4>
                  <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-full">과감한 실행</span>
                </div>
                <p className={\`font-light text-justify leading-relaxed text-[#2C2C2C] \${blurClass}\`}>
                  귀하의 추진력 지표는 **{driVal}점**으로, 계획한 바를 즉각적이고 과감한 행동력으로 변환하는 리더십의 세기와 관계가 깊습니다. 머뭇거리는 모호함을 싫어하며 일단 부딪쳐 가며 문제점을 실시간으로 교정해 나가는 과감함이 특징입니다. 침체된 조직의 분위기를 쇄신하거나 완전히 새로운 영역의 프로젝트를 선두 지휘할 때 빛을 발하는 개척의 아이콘이 됩니다. 다만, 정밀한 사전 검토가 생략된 지나친 과속은 불필요한 비용 낭비나 예기치 않은 위험을 초래할 수 있으니 속도 조율이 필요합니다.
                </p>
                <div className="bg-[#F9F8F6] p-3 rounded-lg border border-[#E2DDD5]/40 text-[11px] text-gray-600">
                  📌 <strong>추진력 극대화 가이드라인:</strong> 초기 스타트업 단계나, 시장이 급변하여 빠른 판단력과 과감한 실행이 생명인 기동 타격대 성격의 환경에서 가치가 무한히 확장됩니다. 결정을 내린 직후 최종 실행 개시 전에 리스크를 방어할 수 있는 신중한 기획자나 장치를 곁에 두십시오.
                </div>
              </div>

              <div className="bg-white border border-[#E2DDD5] rounded-xl p-6 shadow-sm space-y-4">
                <div className="flex justify-between items-center border-b border-[#E2DDD5]/60 pb-2">
                  <h4 className="font-myeongjo text-[14px] font-bold text-teal-700">
                    • 인내력 지표 ({patVal}점) 심층 진단
                  </h4>
                  <span className="text-xs font-bold text-teal-700 bg-teal-50 px-2.5 py-0.5 rounded-full">대기만성</span>
                </div>
                <p className={\`font-light text-justify leading-relaxed text-[#2C2C2C] \${blurClass}\`}>
                  귀하의 인내력 지표는 **{patVal}점**으로, 이는 거센 시련과 방해 요소 속에서도 목표를 포기하지 않고 우직하게 밀고 나가는 지속성과 뚝심의 크기입니다. 세상의 빠른 유행 변화에 일희일비하여 방향을 바꾸지 않으며, 시간이 지날수록 본인의 진가를 더해가는 전형적인 대기만성형 자산 형성 사주의 버팀목입니다. 주변인들에게 신뢰감을 심어주는 뿌리 깊은 나무와 같습니다. 그러나 흐름이 다하여 정리해야 할 타이밍에도 단순한 자존심이나 집착으로 일을 무작정 붙잡고 있는 아집을 반드시 경계해야 실속을 챙깁니다.
                </p>
                <div className="bg-[#F9F8F6] p-3 rounded-lg border border-[#E2DDD5]/40 text-[11px] text-gray-600">
                  📌 <strong>인내력 극대화 가이드라인:</strong> 중장기 연구 개발, 정교한 라이선스 취득을 필요로 하는 전문 자격 영역, 혹은 부동산 및 주식 장기 가치 투자가 필요한 구조에서 결국 압도적인 결실을 거두게 됩니다. 사업이나 투자 전 최악의 한계선(손절 라인)을 설정해 고집으로 인한 낭비를 예방하십시오.
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }`;

// 3. Apply page modifications
try {
  replaceCase("elements", "character", enrichedElements);
  replaceCase("metrics_chart", "metrics_detail_1", enrichedMetricsChart);
  replaceCase("metrics_detail_1", "metrics_detail_2", enrichedDetail1);
  replaceCase("metrics_detail_2", "metrics_detail_3", enrichedDetail2);
  replaceCase("metrics_detail_3", "metrics_detail_4", enrichedDetail3);

  // Write changes back to file
  fs.writeFileSync(filePath, content, 'utf8');
  console.log("=== Pages 4 ~ 8 successfully enriched and visual elements integrated! ===");
} catch (error) {
  console.error("Error patching pages 4 ~ 8 in page.js:", error.message);
  process.exit(1);
}
