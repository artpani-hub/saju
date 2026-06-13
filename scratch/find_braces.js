const fs = require('fs');
const path = require('path');

const pageJsPath = path.join(__dirname, '..', 'src', 'app', 'result', 'page.js');
const content = fs.readFileSync(pageJsPath, 'utf8');

function findFunctionRange(fnHeader) {
  const startIndex = content.indexOf(fnHeader);
  if (startIndex === -1) {
    console.error(`Not found: ${fnHeader}`);
    return null;
  }

  // 여는 중괄호 '{'의 위치를 찾음
  const firstBraceIndex = content.indexOf('{', startIndex);
  if (firstBraceIndex === -1) {
    console.error(`First brace not found for: ${fnHeader}`);
    return null;
  }

  let openBraces = 1;
  let inString = null; // null, '"', "'", "`"
  let i = firstBraceIndex + 1;

  while (i < content.length && openBraces > 0) {
    const char = content[i];

    // 문자열 무시 처리
    if (inString) {
      if (char === inString && content[i - 1] !== '\\') {
        inString = null;
      }
    } else {
      if (char === '"' || char === "'" || char === '`') {
        inString = char;
      } else if (char === '{') {
        openBraces++;
      } else if (char === '}') {
        openBraces--;
      }
    }
    i++;
  }

  const endIndex = i;
  
  // 줄 번호 계산
  const startLine = content.slice(0, startIndex).split('\n').length;
  const endLine = content.slice(0, endIndex).split('\n').length;

  console.log(`Found function "${fnHeader}":`);
  console.log(`  Starts at Line: ${startLine}`);
  console.log(`  Ends at Line: ${endLine}`);
  console.log(`  First line content: ${content.slice(startIndex, content.indexOf('\n', startIndex))}`);
  console.log(`  Last line content: ${content.slice(content.lastIndexOf('\n', endIndex - 2), endIndex)}`);
  
  return { startLine, endLine };
}

findFunctionRange('const renderPageContent = (page, ctx) =>');
console.log('-----------------------------------');
findFunctionRange('const renderNewYearPageContent = (page, ctx) =>');
