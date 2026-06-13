const fs = require('fs');
const path = require('path');

const pageJsPath = path.join(__dirname, '..', 'src', 'app', 'result', 'page.js');
let content = fs.readFileSync(pageJsPath, 'utf8');

const targetStr = `              <h2 className="font-myeongjo t      case "ny_wealth_portfolio": {
        const dayStemEl = sajuInfo?.day?.stemEl || "목";
        const waterCount = sajuInfo?.elements?.수 || 0;
        const metalCount = sajuInfo?.elements?.금 || 0;
        
        let safeRatio = 60;   
        let incomeRatio = 30; 
        let equityRatio = 10; 
        
        const dryLevel = (waterCount <= 1 ? 1 : 0) + (metalCount <= 1 ? 1 : 0);
        if (dryLevel === 2) {
          safeRatio = 75;
          incomeRatio = 20;
          equityRatio = 5;
        } else if (dryLevel === 1) {
          safeRatio = 65;
          incomeRatio = 25;
          equityRatio = 10;
        } else {
          safeRatio = 55;
          incomeRatio = 30;
          equityRatio = 15;
        }

        let adviceText = \`의뢰인 \${name}님의 사주 기맥을 보강하는 오행 포트폴리오 제안서입니다. \`;
        if (waterCount === 0) {
          adviceText += "특히 사주 원국에 물(Sub)의 기운이 결핍되어 있으므로 예적금 등 원금 보장이 확실한 저축성 안전자산 비중을 최대한 유지하여 자금의 메마름을 예방하십시오.";
        } else if (metalCount === 0) {
          adviceText += "사주 원국에 금(Gold)의 기운이 부족하여 재물의 마무리를 짓는 결단력이 약할 수 있습니다. 확정 금리를 제공하는 채권이나 연금 자산의 비중을 높여 재정적 안전핀을 마련하십시오.";
        } else {
          adviceText += "전체적인 오행 밸런스가 조화를 이루고 있어, 단기 예적금과 더불어 글로벌 배당 채권을 적절히 분산하는 중용의 투자 방식이 최선입니다.";
        }

        return wrapLock(
          <div className="space-y-6 py-4">
            <div className="text-center space-y-2 mb-8">
              <span className="text-xs text-[#8A6F4C] font-bold block">재무 포트폴리오 (財務 指針)</span>
              <h2 className="font-myeongjo text-2xl font-bold text-[#1A1A1A]">오행 성향 맞춤형 신년 재테크 조언</h2>
              <div className="w-16 h-0.5 bg-[#A3845B]/30 mx-auto my-1" />
            </div>
            <div className="bg-white border border-[#E2DDD5] rounded-lg p-6 space-y-5 shadow-sm text-xs leading-relaxed font-light text-gray-700 font-traditional">`;

// Note: In the actual target code, waterCount and metalCount lines may differ slightly, so we will use dynamic replacement if static string doesn't match perfectly.
// Let's print index check or just run index check first.

console.log("Checking if targetStr matches perfectly...");
if (content.includes(targetStr)) {
  console.log("Perfect match found. Replacing...");
  content = content.replace(targetStr, `              <h2 className="font-myeongjo text-2xl font-bold text-[#1A1A1A]">세운 기류 변화에 따른 신년 건강 처방</h2>
              <div className="w-16 h-0.5 bg-[#A3845B]/30 mx-auto my-1" />
            </div>
            <div className="bg-white border border-[#E2DDD5] rounded-lg p-6 space-y-6 shadow-sm text-xs leading-relaxed font-light text-gray-700 font-traditional">`);
  fs.writeFileSync(pageJsPath, content, 'utf8');
  console.log("SUCCESS: Replaced!");
} else {
  console.log("Perfect match failed. Trying substring match...");
  // Let's locate 'h2 className="font-myeongjo t      case "ny_wealth_portfolio": {'
  const targetHeader = `              <h2 className="font-myeongjo t      case "ny_wealth_portfolio": {`;
  const idx = content.indexOf(targetHeader);
  if (idx !== -1) {
    console.log(`Found header at character index ${idx}`);
    // Find the end of this duplicate case, which is right before "bg-white border border-[#E2DDD5] rounded-lg p-6 space-y-5 shadow-sm text-xs leading-relaxed font-light text-gray-700 font-traditional"
    const targetEnd = `            <div className="bg-white border border-[#E2DDD5] rounded-lg p-6 space-y-5 shadow-sm text-xs leading-relaxed font-light text-gray-700 font-traditional">`;
    const endIdx = content.indexOf(targetEnd, idx);
    if (endIdx !== -1) {
      console.log(`Found end marker at character index ${endIdx}`);
      const before = content.slice(0, idx);
      const after = content.slice(endIdx + targetEnd.length);
      const replacement = `              <h2 className="font-myeongjo text-2xl font-bold text-[#1A1A1A]">세운 기류 변화에 따른 신년 건강 처방</h2>
              <div className="w-16 h-0.5 bg-[#A3845B]/30 mx-auto my-1" />
            </div>
            <div className="bg-white border border-[#E2DDD5] rounded-lg p-6 space-y-6 shadow-sm text-xs leading-relaxed font-light text-gray-700 font-traditional">`;
      content = before + replacement + after;
      fs.writeFileSync(pageJsPath, content, 'utf8');
      console.log("SUCCESS: Substring range replaced successfully!");
    } else {
      console.log("Failed to find end marker after header!");
    }
  } else {
    console.log("Failed to find even the header!");
  }
}
