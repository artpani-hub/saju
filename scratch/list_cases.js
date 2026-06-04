const fs = require('fs');
const path = require('path');

const filePath = path.join('d:', '인터그리비티', 'saju', 'src', 'app', 'result', 'page.js');
const content = fs.readFileSync(filePath, 'utf8');

const lines = content.split('\n');
console.log("=== Listing all case statements in page.js ===");
lines.forEach((line, index) => {
  if (line.trim().startsWith('case "') && line.includes('":')) {
    console.log(`Line ${index + 1}: ${line.trim()}`);
  }
});
