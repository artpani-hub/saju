const fs = require('fs');
const path = require('path');

const filePath = path.join('d:', '인터그리비티', 'saju', 'src', 'app', 'result', 'components', 'renderNewYearPageContent.js');
const content = fs.readFileSync(filePath, 'utf8');

const lines = content.split('\n');
console.log("=== Finding occurrences of ny_roadmap_2030 or ny_lucky_fashion ===");
lines.forEach((line, idx) => {
  if (line.includes('ny_roadmap_2030') || line.includes('ny_lucky_fashion')) {
    console.log(`Line ${idx + 1}: ${line.trim()}`);
  }
});
