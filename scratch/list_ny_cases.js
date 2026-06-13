const fs = require('fs');
const lines = fs.readFileSync('d:/인터그리비티/saju/src/app/result/page.js', 'utf8').split('\n');
lines.forEach((line, idx) => {
  if (line.includes('case "ny_') || line.includes('case "tj_')) {
    console.log(idx + 1, line.trim());
  }
});
