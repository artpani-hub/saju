const fs = require('fs');
const path = require('path');

const pageJsPath = path.join('d:', '인터그리비티', 'saju', 'src', 'app', 'result', 'page.js');
const compJsPath = path.join('d:', '인터그리비티', 'saju', 'src', 'app', 'result', 'components', 'renderNewYearPageContent.js');

const pageContent = fs.readFileSync(pageJsPath, 'utf8');
const compContent = fs.readFileSync(compJsPath, 'utf8');

// Let's count how many times page.type is checked in each file
// to see if the pages structure is different.
const pageCases = (pageContent.match(/case "ny_/g) || []).length;
const compCases = (compContent.match(/case "ny_/g) || []).length;

console.log(`page.js has ${pageCases} case "ny_" pages`);
console.log(`renderNewYearPageContent.js has ${compCases} case "ny_" pages`);

// Let's see some example cases from page.js
const regex = /case "ny_lucky_fashion":([\s\S]*?)case/g;
const matchPage = regex.exec(pageContent);
if (matchPage) {
  console.log("\n=== Page.js ny_lucky_fashion block ===");
  console.log(matchPage[1].trim().slice(0, 300));
}

regex.lastIndex = 0;
const matchComp = regex.exec(compContent);
if (matchComp) {
  console.log("\n=== renderNewYearPageContent.js ny_lucky_fashion block ===");
  console.log(matchComp[1].trim().slice(0, 300));
}
