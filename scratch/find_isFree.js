const fs = require('fs');
const path = require('path');

const filePath = path.join('d:', '인터그리비티', 'saju', 'src', 'app', 'result', 'page.js');
const content = fs.readFileSync(filePath, 'utf8');

console.log("=== Checking wrapLock in tj_ cases ===");
const lines = content.split('\n');
let inTjBlock = false;
let blockLines = [];

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  if (line.includes('case "tj_') || line.includes("case 'tj_")) {
    inTjBlock = true;
    console.log(`\n--- Case: ${line.trim()} at line ${i+1} ---`);
  }
  if (inTjBlock) {
    blockLines.push(line);
    // case "ny_로 넘어가거나 switch 종료 즈음에 블록 해제
    if (line.includes('case "ny_') || line.includes('case "cover":') || blockLines.length > 300) {
      inTjBlock = false;
      blockLines = [];
    } else {
      if (line.includes('wrapLock') || line.includes('isFree') || line.includes('blur')) {
        console.log(`  Line ${i+1}: ${line.trim()}`);
      }
    }
  }
}
