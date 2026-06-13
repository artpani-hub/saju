const fs = require('fs');
const path = require('path');

const filePath = path.join('d:', '인터그리비티', 'saju', 'src', 'app', 'result', 'page.js');
const content = fs.readFileSync(filePath, 'utf8');
const lines = content.split('\n');

console.log("=== Finding case 'ny_monthly' ===");
for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  if (line.includes('case "ny_monthly":') || line.includes("case 'ny_monthly':")) {
    console.log(`Found exactly at line ${i + 1}`);
    // 다음 20라인만 출력해봅시다.
    for (let j = i; j < Math.min(lines.length, i + 20); j++) {
      console.log(`  ${j + 1}: ${lines[j]}`);
    }
  }
}
