const fs = require('fs');
const path = require('path');

const filePath = path.join('d:', '인터그리비티', 'saju', 'src', 'app', 'result', 'page.js');
const content = fs.readFileSync(filePath, 'utf8');

const lines = content.split('\n');
lines.forEach((line, index) => {
  if (line.includes('ny_lucky_fashion') || line.includes('ny_diet_presc')) {
    console.log(`Line ${index + 1}: [${line}]`);
  }
});
