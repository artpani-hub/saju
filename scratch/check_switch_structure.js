const fs = require('fs');
const path = require('path');

const pageJsPath = path.join('d:', '인터그리비티', 'saju', 'src', 'app', 'result', 'page.js');
const content = fs.readFileSync(pageJsPath, 'utf8');
const lines = content.split('\n');

console.log("=== Checking switches in renderNewYearPageContent inside page.js ===");
let braceLevel = 0;
let inFunc = false;
let funcStart = -1;

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  if (line.includes('const renderNewYearPageContent =')) {
    inFunc = true;
    funcStart = i + 1;
    console.log(`renderNewYearPageContent starts at Line ${funcStart}`);
  }
  
  if (inFunc) {
    for (let c of line) {
      if (c === '{') braceLevel++;
      if (c === '}') braceLevel--;
    }
    
    if (braceLevel === 0 && line.includes('}')) {
      console.log(`renderNewYearPageContent ends at Line ${i + 1}`);
      inFunc = false;
    }
  }
}
