const fs = require('fs');
const path = require('path');

const filePath = path.join('d:', '인터그리비티', 'saju', 'src', 'app', 'result', 'page.js');
const content = fs.readFileSync(filePath, 'utf8');

console.log("=== Finding getNewYearPagesConfiguration ===");
const configIdx = content.indexOf('getNewYearPagesConfiguration =');
if (configIdx !== -1) {
  console.log("Found getNewYearPagesConfiguration definition!");
  console.log(content.slice(configIdx, configIdx + 6000));
} else {
  console.log("Not found getNewYearPagesConfiguration!");
}

console.log("\n=== Finding switch cases for tj_ ===");
const lines = content.split('\n');
const cases = [];
for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  if (line.includes('case "tj_') || line.includes("case 'tj_")) {
    cases.push({ lineNum: i + 1, text: line.trim() });
  }
}
console.log(`Found ${cases.length} cases for tj_ prefix:`);
cases.forEach(c => console.log(`Line ${c.lineNum}: ${c.text}`));
