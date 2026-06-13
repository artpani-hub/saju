const fs = require('fs');
const path = require('path');

const pageFilePath = path.join(__dirname, '..', 'src', 'app', 'result', 'page.js');
let pageLines = fs.readFileSync(pageFilePath, 'utf8').split('\n');

// 1. Remove the inline renderNewYearPageContent function
// 4642행 ~ 11243행 (1-indexed) -> lines 배열 인덱스 4641 ~ 11242
const startIdx = 4641;
const endIdx = 11242;

console.log(`Removing inline function from line ${startIdx + 1} to ${endIdx + 1}...`);
console.log(`Line at start: ${pageLines[startIdx]}`);
console.log(`Line at end: ${pageLines[endIdx]}`);

// Slice out the lines
const beforeLines = pageLines.slice(0, startIdx);
const afterLines = pageLines.slice(endIdx + 1);
let newPageLines = [...beforeLines, ...afterLines];

// 2. Add import renderNewYearPageContent at the top
// Insert at index 1 (right after "use client"; at index 0)
const importStatement = 'import { renderNewYearPageContent } from "./components/renderNewYearPageContent";';
newPageLines.splice(1, 0, importStatement);

fs.writeFileSync(pageFilePath, newPageLines.join('\n'), 'utf8');
console.log('Successfully replaced inline code with external import in page.js');
