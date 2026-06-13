const fs = require('fs');
const path = require('path');

const filePath = path.join('d:', '인터그리비티', 'saju', 'src', 'app', 'result', 'page.js');
const content = fs.readFileSync(filePath, 'utf8');

const lines = content.split('\n');
console.log("=== Finding monthly cases ===");
for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  if (line.includes('_monthly":') || line.includes("_monthly':")) {
    console.log(`Line ${i + 1}: ${line.trim()}`);
    // print next 40 lines
    for (let j = i; j < Math.min(lines.length, i + 40); j++) {
      console.log(`  ${j + 1}: ${lines[j]}`);
    }
  }
}
