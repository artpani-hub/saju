const fs = require('fs');
const path = require('path');

const filePath = path.join('d:', '인터그리비티', 'saju', 'src', 'app', 'result', 'components', 'renderNewYearPageContent.js');
const content = fs.readFileSync(filePath, 'utf8');

const lines = content.split('\n');
console.log("=== Listing switch(page.type) cases ===");
lines.forEach((line, idx) => {
  if (line.trim().startsWith('case "ny_') && idx < 2000) {
    console.log(`Line ${idx + 1}: ${line.trim()}`);
  }
});
