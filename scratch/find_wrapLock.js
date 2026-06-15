const fs = require('fs');
const path = require('path');

const file1 = path.join('d:', '인터그리비티', 'saju', 'src', 'app', 'result', 'page.js');
const file2 = path.join('d:', '인터그리비티', 'saju', 'src', 'app', 'result', 'components', 'renderNewYearPageContent.js');

[file1, file2].forEach(filePath => {
  if (fs.existsSync(filePath)) {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    lines.forEach((line, idx) => {
      if (line.includes('wrapLock')) {
        console.log(`${path.basename(filePath)} Line ${idx + 1}: ${line.trim()}`);
      }
    });
  }
});
