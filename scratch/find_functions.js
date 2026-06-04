const fs = require('fs');
const path = require('path');

const filePath = path.join('d:', '인터그리비티', 'saju', 'src', 'app', 'result', 'page.js');
const content = fs.readFileSync(filePath, 'utf8');

const lines = content.split('\n');

function findParentFunction(targetLineIndex) {
  for (let i = targetLineIndex; i >= 0; i--) {
    const line = lines[i];
    if (line.includes('function ') || line.includes('=>') && (line.includes('const ') || line.includes('let '))) {
      return { lineNum: i + 1, text: line.trim() };
    }
  }
  return null;
}

const targets = [6283, 7079];
targets.forEach(lineNum => {
  const parent = findParentFunction(lineNum - 1);
  console.log(`Line ${lineNum} parent:`, parent);
});
