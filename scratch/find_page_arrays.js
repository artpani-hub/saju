const fs = require('fs');
const path = require('path');

const pageJsPath = path.join('d:', '인터그리비티', 'saju', 'src', 'app', 'result', 'page.js');
const pageContent = fs.readFileSync(pageJsPath, 'utf8');

const lines = pageContent.split('\n');

console.log("=== Searching for page configurations (ny_ or tj_ arrays) ===");
for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  if (line.includes('page: 1') || line.includes('type: "ny_') || line.includes('type: "tj_')) {
    if (line.includes('[') || line.includes('const') || line.includes('return')) {
      console.log(`Line ${i + 1}: ${line.trim()}`);
      // Print next 5 lines
      for (let j = i + 1; j < Math.min(lines.length, i + 15); j++) {
        console.log(`  ${j + 1}: ${lines[j]}`);
      }
      i += 10; // skip a bit
    }
  }
}
