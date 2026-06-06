const fs = require('fs');
const path = require('path');

const filePath = path.join('d:', '인터그리비티', 'saju', 'src', 'app', 'result', 'page.js');
const content = fs.readFileSync(filePath, 'utf8');

const lines = content.split('\n');
console.log("=== Finding sajuInfo references ===");
lines.forEach((line, idx) => {
  if (line.includes('sajuInfo')) {
    console.log(`Line ${idx + 1}: ${line.trim()}`);
  }
});
