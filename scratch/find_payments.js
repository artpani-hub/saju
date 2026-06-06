const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'src', 'app', 'result', 'page.js');
const content = fs.readFileSync(filePath, 'utf8');

const lines = content.split('\n');
lines.forEach((line, index) => {
  if (line.includes('handleUpgradeFromSms("premium", 15000)')) {
    console.log(`--- Context for Line ${index + 1} ---`);
    for (let i = Math.max(0, index - 10); i <= Math.min(lines.length - 1, index + 10); i++) {
      console.log(`${i + 1}: ${lines[i]}`);
    }
  }
});
