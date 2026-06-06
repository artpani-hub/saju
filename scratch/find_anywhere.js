const fs = require('fs');
const path = require('path');

const filePath = path.join('d:', '인터그리비티', 'saju', 'src', 'app', 'result', 'page.js');
const content = fs.readFileSync(filePath, 'utf8');

const keywords = ["ResultContent", "renderPageContent", "worryText", "getPersonalizedSolution"];

console.log("=== Checking keywords in page.js ===");
const lines = content.split('\n');

keywords.forEach(kw => {
  console.log(`\nKeyword: "${kw}"`);
  let foundCount = 0;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes(kw)) {
      console.log(`Line ${i + 1}: ${lines[i].trim()}`);
      foundCount++;
      if (foundCount > 15) {
        console.log("... (too many matches, truncated)");
        break;
      }
    }
  }
});
