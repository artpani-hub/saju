const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'src', 'app', 'result', 'page.js');
const content = fs.readFileSync(filePath, 'utf8');

const lines = content.split('\n');
console.log("=== Finding reportGrade references ===");
lines.forEach((line, idx) => {
  if (line.includes('reportGrade')) {
    console.log(`Line ${idx + 1}: ${line.trim()}`);
  }
});
