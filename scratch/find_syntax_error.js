const fs = require('fs');
const path = require('path');

const pageJsPath = path.join(__dirname, '..', 'src', 'app', 'result', 'page.js');
const content = fs.readFileSync(pageJsPath, 'utf8');
const lines = content.split('\n');

// ResultContent의 대략적인 시작 인덱스 찾기
const startIndex = content.indexOf('function ResultContent()');
if (startIndex === -1) {
  console.error("ResultContent not found");
  process.exit(1);
}

console.log(`ResultContent starts at character index: ${startIndex}`);

// 괄호 스택 추적
let stack = [];
let inString = null;
let lineNum = content.slice(0, startIndex).split('\n').length;
let colNum = 1;

for (let i = startIndex; i < content.length; i++) {
  const char = content[i];

  if (char === '\n') {
    lineNum++;
    colNum = 1;
    continue;
  } else {
    colNum++;
  }

  // 문자열 리터럴 처리
  if (inString) {
    if (char === inString && content[i - 1] !== '\\') {
      inString = null;
    }
    continue;
  }

  if (char === '"' || char === "'" || char === '`') {
    inString = char;
    continue;
  }

  // 주석 처리
  if (char === '/' && content[i + 1] === '/') {
    // 다음 줄바꿈까지 건너뜀
    while (i < content.length && content[i] !== '\n') {
      i++;
    }
    lineNum++;
    colNum = 1;
    continue;
  }
  if (char === '/' && content[i + 1] === '*') {
    i += 2;
    while (i < content.length && !(content[i] === '*' && content[i + 1] === '/')) {
      if (content[i] === '\n') {
        lineNum++;
        colNum = 1;
      }
      i++;
    }
    i++;
    continue;
  }

  // 괄호 매칭
  if (char === '{' || char === '(' || char === '[') {
    stack.push({ char, line: lineNum, col: colNum });
  } else if (char === '}' || char === ')' || char === ']') {
    if (stack.length === 0) {
      console.error(`Error: Extra closing character "${char}" at Line ${lineNum}, Col ${colNum}`);
      continue;
    }
    const last = stack.pop();
    const match = (last.char === '{' && char === '}') ||
                  (last.char === '(' && char === ')') ||
                  (last.char === '[' && char === ']');
    if (!match) {
      console.error(`Error: Mismatched bracket. Opened "${last.char}" at Line ${last.line}, Col ${last.col} but closed with "${char}" at Line ${lineNum}, Col ${colNum}`);
      // 복원 시도
      stack.push(last);
    }
  }
}

console.log("Bracket validation finished.");
if (stack.length > 0) {
  console.log(`Unclosed brackets remaining: ${stack.length}`);
  stack.slice(-10).forEach(b => {
    console.log(`  Unclosed "${b.char}" opened at Line ${b.line}, Col ${b.col}`);
  });
} else {
  console.log("No unclosed brackets found!");
}
