const fs = require('fs');
const buffer = fs.readFileSync('d:/인터그리비티/saju/src/app/result/page.js');

let lineNum = 1;
let lineStart = 0;
let targetLine = -1;

for (let i = 0; i < buffer.length; i++) {
  if (i === 189035) {
    targetLine = lineNum;
  }
  if (buffer[i] === 10) { // \n
    lineNum++;
  }
}

console.log(`Error index 189035 is at Line: ${targetLine}`);

// targetLine 주변 20줄 출력
lineNum = 1;
lineStart = 0;
for (let i = 0; i < buffer.length; i++) {
  const isEOF = (i === buffer.length - 1);
  if (buffer[i] === 10 || isEOF) {
    if (lineNum >= targetLine - 10 && lineNum <= targetLine + 10) {
      const lineBuf = buffer.slice(lineStart, i + (isEOF ? 1 : 0));
      // 깨진 바이트를 대체문자()로 처리하여 출력
      console.log(`${lineNum}: ${lineBuf.toString('utf8')}`);
    }
    lineStart = i + 1;
    lineNum++;
  }
}
