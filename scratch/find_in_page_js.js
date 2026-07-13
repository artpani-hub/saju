const fs = require('fs');
const content = fs.readFileSync('d:/인터그리비티/saju/src/app/result/page.js', 'utf8');
const lines = content.split('\n');

console.log('Total lines:', lines.length);

lines.forEach((line, idx) => {
  if (line.includes('renderPageContent') || line.includes('renderNewYearPageContent') || line.includes('newyear')) {
    console.log(`${idx + 1}: ${line.trim()}`);
  }
});
