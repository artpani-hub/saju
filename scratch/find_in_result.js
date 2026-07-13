const fs = require('fs');
const path = require('path');

const filePath = 'd:/인터그리비티/saju/src/app/result/page.js';
const content = fs.readFileSync(filePath, 'utf8');
const lines = content.split('\n');

console.log('Searching for tarot price constants in result/page.js:');
lines.forEach((line, idx) => {
  if (line.includes('10000') || line.includes('10,000') || line.includes('9900')) {
    console.log(`${idx + 1}: ${line.trim()}`);
  }
});
