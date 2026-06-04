const fs = require('fs');
const path = require('path');

const filePath = path.join('d:', '인터그리비티', 'saju', 'src', 'app', 'result', 'page.js');
const content = fs.readFileSync(filePath, 'utf8');

const lines = content.split('\n');
lines.forEach((line, index) => {
  if (line.includes('const render') && (line.includes('Page') || line.includes('Content'))) {
    console.log(`Line ${index + 1}: ${line.trim()}`);
  }
});
