const fs = require('fs');
const path = require('path');

const pageJsPath = path.join(__dirname, '..', 'src', 'app', 'result', 'page.js');
const content = fs.readFileSync(pageJsPath, 'utf8');

function findRangeAtLine(startStr, fromLine) {
  const lines = content.split('\n');
  const offset = lines.slice(0, fromLine - 1).join('\n').length + 1;
  const startIndex = content.indexOf(startStr, offset);
  if (startIndex === -1) {
    console.log(`Not found: ${startStr} after line ${fromLine}`);
    return;
  }
  const braceIdx = content.indexOf('{', startIndex);
  let open = 1;
  let i = braceIdx + 1;
  while (i < content.length && open > 0) {
    const c = content[i];
    if (c === '{') open++;
    else if (c === '}') open--;
    i++;
  }
  const startLine = content.slice(0, startIndex).split('\n').length;
  const endLine = content.slice(0, i).split('\n').length;
  console.log(`Pattern "${startStr}" (from line ${fromLine}): Starts at L${startLine}, Ends at L${endLine}`);
}

findRangeAtLine('switch (page.type) {', 4600);
findRangeAtLine('case "ny_wealth_portfolio":', 7300);
findRangeAtLine('case "ny_wealth_portfolio":', 9400);
findRangeAtLine('case "ny_wealth_portfolio":', 10500);
