const fs = require('fs');
const path = require('path');

const filePath = path.join('d:', '인터그리비티', 'saju', 'src', 'app', 'result', 'page.js');
const content = fs.readFileSync(filePath, 'utf8');

const lines = content.split('\n');
console.log("=== Listing functions & key variables in page.js ===");
lines.forEach((line, index) => {
  if (
    line.includes('PagesConfiguration') ||
    line.includes('pages =') ||
    (line.includes('const ') && line.includes('Pages')) ||
    line.trim().startsWith('function ') ||
    (line.trim().startsWith('const ') && line.includes(' = ('))
  ) {
    console.log(`Line ${index + 1}: ${line.trim()}`);
  }
});
