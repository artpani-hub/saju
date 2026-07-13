const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'src', 'app', 'result', 'page.js');
const content = fs.readFileSync(filePath, 'utf8');
const lines = content.split('\n');

lines.forEach((line, index) => {
  if (line.includes('blurClass') || line.includes('isFree')) {
    console.log(`${index + 1}: ${line.trim()}`);
  }
});
