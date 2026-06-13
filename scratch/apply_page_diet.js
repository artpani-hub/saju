const fs = require('fs');
const path = require('path');

const pageJsPath = path.join(__dirname, '..', 'src', 'app', 'result', 'page.js');

console.log("Reading page.js...");
const content = fs.readFileSync(pageJsPath, 'utf8');
const lines = content.split('\n');

console.log(`Total lines: ${lines.length}`);

// Assertion 1: renderPageContent 시작 체크 (Line 382 -> Index 381)
const pStart = 381;
console.log(`Checking line 382 (index ${pStart}): ${lines[pStart].trim()}`);
if (!lines[pStart].includes('const renderPageContent =')) {
  console.error("Assertion failed: Line 382 does not start renderPageContent!");
  process.exit(1);
}

// Assertion 2: ResultContent 시작 체크 (Line 2992 -> Index 2991)
const rcStart = 2991;
console.log(`Checking line 2992 (index ${rcStart}): ${lines[rcStart].trim()}`);
if (!lines[rcStart].includes('function ResultContent()')) {
  console.error("Assertion failed: Line 2992 does not start ResultContent!");
  process.exit(1);
}

// Assertion 3: renderNewYearPageContent 시작 체크 (Line 4642 -> Index 4641)
const nyStart = 4641;
console.log(`Checking line 4642 (index ${nyStart}): ${lines[nyStart].trim()}`);
if (!lines[nyStart].includes('const renderNewYearPageContent =')) {
  console.error("Assertion failed: Line 4642 does not start renderNewYearPageContent!");
  process.exit(1);
}

// Assertion 4: renderNewYearPageContent의 끝인 11639번째 줄 닫는 괄호 체크 (Line 11639 -> Index 11638)
const nyEnd = 11638;
console.log(`Checking line 11639 (index ${nyEnd}): ${lines[nyEnd].trim()}`);
if (lines[nyEnd].trim() !== '}') {
  console.error("Assertion failed: Line 11639 is not a closing bracket!");
  process.exit(1);
}

console.log("Assertions passed! Slicing and refactoring the file contents...");

// 1. imports 부분에 import 문 추가 (두 번째 줄에 삽입)
const importStatements = [
  'import { renderPageContent } from "./components/renderPageContent";',
  'import { renderNewYearPageContent } from "./components/renderNewYearPageContent";'
];

let finalLines = [];

// 0 ~ 380번 줄까지 (1 ~ 381번째 줄) 그대로 복사
finalLines.push(...lines.slice(0, 381));

// 381 ~ 2990번 줄 (382 ~ 2991번째 줄)은 제거함.

// 2991 ~ 4640번 줄 (2992 ~ 4641번째 줄) 그대로 복사
finalLines.push(...lines.slice(2991, 4641));

// 4641 ~ 11638번 줄 (4642 ~ 11639번째 줄)은 제거함.

// 11639 ~ 끝까지 그대로 복사
finalLines.push(...lines.slice(11639));

// 임포트 추가: 'use client'; 바로 다음에 import 문 삽입
if (finalLines[0].trim() === '"use client";') {
  finalLines.splice(1, 0, ...importStatements);
} else {
  finalLines.unshift(...importStatements);
}

const newFileContent = finalLines.join('\n');

console.log("Writing changes back to page.js...");
fs.writeFileSync(pageJsPath, newFileContent, 'utf8');
console.log("Successfully slimmed page.js down!");
