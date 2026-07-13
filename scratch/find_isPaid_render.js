const fs = require('fs');
const path = require('path');

const filePath = path.join('d:', '인터그리비티', 'saju', 'src', 'app', 'result', 'page.js');
const content = fs.readFileSync(filePath, 'utf8');

const lines = content.split('\n');
console.log("=== Finding isPaid condition in JSX ===");
lines.forEach((line, idx) => {
  if (idx >= 5000 && (line.includes('isPaid') || line.includes('isFree') || line.includes('isSmsLocked'))) {
    console.log(`Line ${idx + 1}: ${line.trim()}`);
  }
});
