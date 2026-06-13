const fs = require('fs');
const path = require('path');

const pageFilePath = path.join(__dirname, '..', 'src', 'app', 'result', 'page.js');
const extFilePath = path.join(__dirname, '..', 'src', 'app', 'result', 'components', 'renderNewYearPageContent.js');

const pageContent = fs.readFileSync(pageFilePath, 'utf8');
const extContent = fs.readFileSync(extFilePath, 'utf8');

const getCases = (content) => {
  const lines = content.split('\n');
  const cases = [];
  lines.forEach((line) => {
    // Match something like `case "ny_something":` or `case 'ny_something':`
    const match = line.match(/case\s+["'](ny_[a-zA-Z0-9_]+)["']/);
    if (match) {
      cases.push(match[1]);
    }
  });
  return cases;
};

const pageCases = getCases(pageContent);
const uniquePageCases = Array.from(new Set(pageCases));

const extCases = getCases(extContent);
const uniqueExtCases = Array.from(new Set(extCases));

console.log('=== page.js Unique NY Cases (' + uniquePageCases.length + ') ===');
console.log(JSON.stringify(uniquePageCases.sort(), null, 2));
console.log('\n=== renderNewYearPageContent.js Unique NY Cases (' + uniqueExtCases.length + ') ===');
console.log(JSON.stringify(uniqueExtCases.sort(), null, 2));

const missingInExt = uniquePageCases.filter(c => !uniqueExtCases.includes(c));
const extraInExt = uniqueExtCases.filter(c => !uniquePageCases.includes(c));

console.log('\n=== Missing in External File ===');
console.log(missingInExt);

console.log('\n=== Extra in External File ===');
console.log(extraInExt);
