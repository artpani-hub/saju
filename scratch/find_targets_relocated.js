const fs = require('fs');
const path = require('path');

const filePath = path.join('d:', '인터그리비티', 'saju', 'src', 'app', 'result', 'components', 'renderNewYearPageContent.js');
const content = fs.readFileSync(filePath, 'utf8');

const lines = content.split('\n');
console.log("=== Finding relocated cases ===");
lines.forEach((line, idx) => {
  if (line.includes('case "ny_roadmap_2030":') || line.includes('case "ny_lucky_fashion":') || line.includes('case "ny_diet_presc":')) {
    console.log(`Line ${idx + 1}: ${line.trim()}`);
    // 다음 5줄 출력
    for (let i = 1; i <= 5; i++) {
      console.log(`  Line ${idx + 1 + i}: ${lines[idx + i]}`);
    }
  }
});
