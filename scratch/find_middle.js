const fs = require('fs');
const path = require('path');

const filePath = path.join('d:', '인터그리비티', 'saju', 'src', 'app', 'result', 'page.js');
const content = fs.readFileSync(filePath, 'utf8');

const lines = content.split('\n');

console.log("=== Lines 6280 to 6330 ===");
for (let i = 6279; i < 6330; i++) {
  console.log(`${i + 1}: ${lines[i]}`);
}

console.log("=== Lines 7070 to 7120 ===");
for (let i = 7069; i < 7120; i++) {
  console.log(`${i + 1}: ${lines[i]}`);
}
