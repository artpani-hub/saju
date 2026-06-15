const fs = require('fs');
const path = require('path');

const filePath = path.join('d:', '인터그리비티', 'saju', 'src', 'app', 'result', 'components', 'renderNewYearPageContent.js');
let content = fs.readFileSync(filePath, 'utf8');

// LF/CRLF 개행 문자 정규화
const originalLines = content.split(/\r?\n/);

console.log(`Original lines count: ${originalLines.length}`);

// 잘못 삽입된 블록의 시작과 끝 라인 번호 찾기 (1-based index)
// Line 8: const getElementColor = (el) => {
// Line 16: case "ny_wealth_portfolio": {
// Line 820: case "ny_diet_presc"가 끝나는 820라인 부근
// Line 821: default: return "bg-gray-100 text-gray-500";
// Line 822: }

let startIdx = -1;
let endIdx = -1;

for (let i = 0; i < originalLines.length; i++) {
  if (originalLines[i].includes('case "ny_wealth_portfolio":')) {
    startIdx = i;
  }
  if (originalLines[i].includes('default: return "bg-gray-100 text-gray-500";')) {
    endIdx = i;
  }
}

if (startIdx === -1 || endIdx === -1) {
  console.error(`Could not locate start or end of misplaced cases. startIdx: ${startIdx}, endIdx: ${endIdx}`);
  process.exit(1);
}

console.log(`Misplaced cases block starts at line ${startIdx + 1} and ends before line ${endIdx + 1}`);

// 추출할 케이스 블록
const misplacedCasesLines = originalLines.slice(startIdx, endIdx);
const misplacedCasesBlock = misplacedCasesLines.join('\n');

// getElementColor를 원상복구
const cleanGetElementColor = `const getElementColor = (el) => {
  switch (el) {
    case "목": return "bg-[#5F7A68] text-white";
    case "화": return "bg-red-600 text-white";
    case "토": return "bg-[#A3845B] text-white";
    case "금": return "bg-gray-400 text-gray-900";
    case "수": return "bg-gray-800 text-white";
    default: return "bg-gray-100 text-gray-500";
  }
};`;

// originalLines에서 8번 라인 부근부터 823번 라인 부근까지를 cleanGetElementColor로 대체
// getElementColor 시작 부분 인덱스 찾기
let getElementColorStart = -1;
for (let i = 0; i < originalLines.length; i++) {
  if (originalLines[i].includes('const getElementColor = (el) =>')) {
    getElementColorStart = i;
    break;
  }
}

if (getElementColorStart === -1) {
  console.error("Could not find getElementColor start!");
  process.exit(1);
}

// getElementColor 함수 블록 전체 삭제하고 복구된 버전 삽입
// endIdx + 2 는 getElementColor 함수의 닫는 중괄호 } 가 위치한 부분 (line 823 부근)
// 이를 슬라이싱으로 안전하게 조립
const beforeGetElementColor = originalLines.slice(0, getElementColorStart).join('\n');
const afterGetElementColor = originalLines.slice(endIdx + 2).join('\n');

// 1차 조립
let intermediateContent = beforeGetElementColor + '\n' + cleanGetElementColor + '\n' + afterGetElementColor;

// 2차 조립: switch (page.type) 문 내부로 추출된 케이스들 삽입
// 실제 switch (page.type) 문 찾기
const targetSwitchStr = '    switch (page.type) {\n      // ----------------------------------------------------\n      // [NEW] 토정비결 전용 30페이지 렌더링 케이스\n      // ----------------------------------------------------';

if (!intermediateContent.includes(targetSwitchStr)) {
  console.log("Could not find target switch string with exact indentation. Trying relaxed match.");
  const targetSwitchStrRelaxed = 'switch (page.type) {';
  if (intermediateContent.includes(targetSwitchStrRelaxed)) {
    const replacement = 'switch (page.type) {\n' + misplacedCasesBlock + '\n';
    intermediateContent = intermediateContent.replace(targetSwitchStrRelaxed, replacement);
    console.log("Inserted misplaced cases into switch (page.type) using relaxed match!");
  } else {
    console.error("Could not find switch (page.type) at all!");
    process.exit(1);
  }
} else {
  const replacement = '    switch (page.type) {\n' + misplacedCasesBlock + '\n      // ----------------------------------------------------\n      // [NEW] 토정비결 전용 30페이지 렌더링 케이스\n      // ----------------------------------------------------';
  intermediateContent = intermediateContent.replace(targetSwitchStr, replacement);
  console.log("Inserted misplaced cases into switch (page.type) using exact match!");
}

fs.writeFileSync(filePath, intermediateContent, 'utf8');
console.log("=== Misplaced Page Cases successfully relocated to switch(page.type)! ===");
