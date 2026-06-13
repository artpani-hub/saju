const fs = require('fs');
const path = require('path');

const filePath = path.join('d:', '인터그리비티', 'saju', 'src', 'app', 'result', 'page.js');
const content = fs.readFileSync(filePath, 'utf8');
const lines = content.split('\n');

console.log("Line 4642 around context:");
for (let i = 4630; i < 4655; i++) {
  console.log(`${i + 1}: ${lines[i]}`);
}

console.log("\n=== Checking enclosing block of line 4642 ===");
let stack = [];
for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  if (line.includes('function ResultContent') || line.includes('ResultContent =')) {
    console.log(`ResultContent starts at line ${i + 1}`);
  }
}
