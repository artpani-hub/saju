const fs = require('fs');
const path = require('path');

const filePath = path.join('d:', '인터그리비티', 'saju', 'src', 'app', 'result', 'page.js');
const content = fs.readFileSync(filePath, 'utf8');

const lines = content.split('\n');
console.log("=== Printing lines around 6316 ===");
for (let i = 6310; i < 6325; i++) {
  console.log(`${i + 1}: ${lines[i]}`);
}

console.log("=== Printing lines around 7112 ===");
for (let i = 7100; i < 7125; i++) {
  console.log(`${i + 1}: ${lines[i]}`);
}
