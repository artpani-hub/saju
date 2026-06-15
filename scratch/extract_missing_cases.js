const fs = require('fs');
const path = require('path');

const filePath = path.join('d:', '인터그리비티', 'saju', 'src', 'app', 'result', 'backup', 'page_backup.js');
const content = fs.readFileSync(filePath, 'utf8');
const lines = content.split('\n');

function findCaseBoundaries(caseName) {
  let startIdx = -1;
  let endIdx = -1;
  let braceCount = 0;
  let inCase = false;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.includes(`case "${caseName}":`)) {
      startIdx = i;
      inCase = true;
      braceCount = 0;
      continue;
    }
    
    if (inCase) {
      // open/close braces counting
      const opens = (line.match(/\{/g) || []).length;
      const closes = (line.match(/\}/g) || []).length;
      braceCount += opens - closes;
      
      // case 가 끝나는 시점은 braceCount 가 0 또는 음수가 되거나 다음 case를 만날 때
      if (braceCount <= 0 && (line.trim() === '}' || line.includes(');') || line.includes('return wrapLock('))) {
        // Look ahead to find end of return block or brace
        if (lines[i+1] && (lines[i+1].includes('case ') || lines[i+1].includes('default:'))) {
          endIdx = i + 1;
          break;
        }
      }
      if (line.includes('case "') && braceCount <= 1) {
        endIdx = i;
        break;
      }
    }
  }
  return { startIdx, endIdx };
}

['ny_roadmap_2030', 'ny_lucky_fashion'].forEach(c => {
  const { startIdx, endIdx } = findCaseBoundaries(c);
  console.log(`Case ${c}: Start Line ${startIdx + 1}, End Line ${endIdx}`);
  if (startIdx !== -1 && endIdx !== -1) {
    const caseBlock = lines.slice(startIdx, endIdx).join('\n');
    console.log(`--- CASE BLOCK SNIPPET ---`);
    console.log(caseBlock.substring(0, 300) + '...\n');
  }
});
