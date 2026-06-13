const fs = require('fs');
const path = require('path');

const pageJsPath = path.join('d:', '인터그리비티', 'saju', 'src', 'app', 'result', 'page.js');
const compJsPath = path.join('d:', '인터그리비티', 'saju', 'src', 'app', 'result', 'components', 'renderNewYearPageContent.js');

const pageContent = fs.readFileSync(pageJsPath, 'utf8');
const compContent = fs.readFileSync(compJsPath, 'utf8');

console.log("page.js size:", pageContent.length);
console.log("renderNewYearPageContent.js size:", compContent.length);

// Let's check if page.js imports renderNewYearPageContent
const hasImport = pageContent.includes('import { renderNewYearPageContent }') || pageContent.includes('import renderNewYearPageContent');
console.log("Does page.js import renderNewYearPageContent?", hasImport);

// Find the definition in page.js
const defStart = pageContent.indexOf('const renderNewYearPageContent = (page, ctx) => {');
if (defStart !== -1) {
  console.log("Found definition in page.js at index", defStart);
} else {
  console.log("Could not find definition in page.js");
}
