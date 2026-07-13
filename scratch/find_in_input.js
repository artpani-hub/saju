const fs = require('fs');
const path = require('path');

const filePath = 'd:/인터그리비티/saju/src/app/input/page.js';
const content = fs.readFileSync(filePath, 'utf8');
const lines = content.split('\n');

console.log('Searching for setStep and paying inside input/page.js:');
lines.forEach((line, idx) => {
  if (line.includes('setStep') || line.includes('step') || line.includes('paying')) {
    console.log(`${idx + 1}: ${line.trim()}`);
  }
});
