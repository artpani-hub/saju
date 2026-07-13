const fs = require('fs');
const path = require('path');

const filePath = 'd:/인터그리비티/saju/src/app/page.js';
const content = fs.readFileSync(filePath, 'utf8');
const lines = content.split('\n');

console.log('Searching for wealth/gunghap related lines in main page.js:');
lines.forEach((line, idx) => {
  if (line.includes('wealth') || line.includes('재물') || line.includes('gunghap') || line.includes('궁합') || line.includes('20,000') || line.includes('26,900')) {
    console.log(`${idx + 1}: ${line.trim()}`);
  }
});
