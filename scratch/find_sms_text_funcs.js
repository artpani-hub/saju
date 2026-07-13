const fs = require('fs');
const content = fs.readFileSync('d:/인터그리비티/saju/src/app/input/page.js', 'utf8');
const lines = content.split('\n');

lines.forEach((line, idx) => {
  if (line.includes('buildGeneralSmsText') || line.includes('buildTodaySmsText')) {
    console.log(`${idx + 1}: ${line.trim()}`);
  }
});
