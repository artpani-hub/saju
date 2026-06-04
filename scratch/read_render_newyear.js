const fs = require('fs');
const path = require('path');

const filePath = path.join('d:', '인터그리비티', 'saju', 'src', 'app', 'result', 'page.js');
const content = fs.readFileSync(filePath, 'utf8');

const lines = content.split('\n');
console.log("=== Printing lines around renderNewYearContent ===");
for (let i = 7167; i < 7167 + 80 && i < lines.length; i++) {
  console.log(`${i + 1}: ${lines[i]}`);
}
