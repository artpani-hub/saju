const fs = require('fs');
const path = require('path');

const pageJsPath = path.join('d:', '인터그리비티', 'saju', 'src', 'app', 'result', 'page.js');
const compJsPath = path.join('d:', '인터그리비티', 'saju', 'src', 'app', 'result', 'components', 'renderNewYearPageContent.js');

const pageContent = fs.readFileSync(pageJsPath, 'utf8');
const compContent = fs.readFileSync(compJsPath, 'utf8');

function extractCases(content) {
  const cases = [];
  const lines = content.split('\n');
  lines.forEach((line, idx) => {
    const match = line.match(/case\s+["'](ny_[a-zA-Z0-9_]+|tj_[a-zA-Z0-9_]+)["']/);
    if (match) {
      cases.push({ name: match[1], line: idx + 1 });
    }
  });
  return cases;
}

const pageCases = extractCases(pageContent);
const compCases = extractCases(compContent);

console.log("=== Cases in page.js ===");
pageCases.forEach(c => console.log(`  Line ${c.line}: ${c.name}`));

console.log("\n=== Cases in renderNewYearPageContent.js ===");
compCases.forEach(c => console.log(`  Line ${c.line}: ${c.name}`));
