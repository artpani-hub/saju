const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/app/result/page.js');
const content = fs.readFileSync(filePath, 'utf8');

const lines = content.split('\n');

console.log('--- Searching for payment or upgrade keywords ---');
lines.forEach((line, idx) => {
  if (line.includes('Payment') || line.includes('reportGrade') || line.includes('isFree') || line.includes('upgrade')) {
    console.log(`${idx + 1}: ${line.trim()}`);
  }
});
