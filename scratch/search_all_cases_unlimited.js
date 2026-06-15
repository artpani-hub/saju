const fs = require('fs');
const path = require('path');

const filePath = path.join('d:', '인터그리비티', 'saju', 'src', 'app', 'result', 'components', 'renderNewYearPageContent.js');
const content = fs.readFileSync(filePath, 'utf8');

const lines = content.split('\n');
console.log("=== Listing ALL case statements in renderNewYearPageContent.js ===");
lines.forEach((line, idx) => {
  if (line.includes('case "ny_')) {
    console.log(`Line ${idx + 1}: ${line.trim()}`);
  }
});
