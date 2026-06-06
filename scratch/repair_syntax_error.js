const fs = require('fs');
const path = require('path');

const pagePath = path.join(__dirname, '..', 'src', 'app', 'result', 'page.js');
const backupPath = path.join(__dirname, '..', 'src', 'app', 'result', 'page_backup.js');

let pageContent = fs.readFileSync(pagePath, 'utf8');
let backupContent = fs.readFileSync(backupPath, 'utf8');

console.log("=== Repairing Syntax Error ===");

// 1. page_backup.js에서 daeun_roadmap_1 케이스 전체 추출
// case "daeun_roadmap_1": 에서 시작하여 case "daeun_roadmap_2": 전까지
const backupStartKey = 'case "daeun_roadmap_1":';
const backupEndKey = 'case "daeun_roadmap_2":';

const backupStartIdx = backupContent.indexOf(backupStartKey);
const backupEndIdx = backupContent.indexOf(backupEndKey);

if (backupStartIdx === -1 || backupEndIdx === -1) {
  console.error("Failed to find daeun_roadmap keys in backup file!");
  process.exit(1);
}

const originalDaeunRoadmap1 = backupContent.substring(backupStartIdx, backupEndIdx);
console.log("Original daeun_roadmap_1 code extracted successfully.");

// 2. 파손된 page.js에서 daeun_roadmap_1 시작지점 찾기
const pageStartIdx = pageContent.indexOf(backupStartKey);
if (pageStartIdx === -1) {
  console.error("Failed to find daeun_roadmap_1 key in page.js!");
  process.exit(1);
}

// 3. 파손된 page.js에서 진짜 renderSmsNewYearContent가 시작하는 경계 찾기.
// 이전에 이 함수가 중복 삽입된 첫 번째 위치는 2775라인 부근(daeun_roadmap_1 내부)이었다.
// 진짜 정상적인 renderSmsNewYearContent의 시작 위치는 원래 4253라인 근처였으며, 
// 그 위에 `// ----------------------------------------------------` 주석이 달려 있었다.
// 따라서 첫 번째 난입한 const renderSmsNewYearContent 문자열 이후에 나오는 
// 진짜 두 번째 const renderSmsNewYearContent 지점을 찾는다.

const searchString = 'const renderSmsNewYearContent = () => {';
const firstSmsIdx = pageContent.indexOf(searchString);
if (firstSmsIdx === -1) {
  console.error("Failed to find first renderSmsNewYearContent!");
  process.exit(1);
}

const secondSmsIdx = pageContent.indexOf(searchString, firstSmsIdx + searchString.length);
if (secondSmsIdx === -1) {
  console.error("Failed to find second renderSmsNewYearContent (the genuine one)!");
  process.exit(1);
}

// 진짜 Sms 함수의 시작을 위해 그 위에 주석까지 포함해 자르자.
// secondSmsIdx 바로 위 줄들의 주석을 찾거나, secondSmsIdx 바로 직전까지를 교체 경계로 삼음.
// page.js의 pageStartIdx부터 secondSmsIdx 직전까지를 originalDaeunRoadmap1 + 기타 정상 코드로 치환.
// page_backup.js에서 daeun_roadmap_1 시작부터 renderSmsNewYearContent 직전까지의 코드도 추출하자.
// backupContent에서 case "daeun_roadmap_1": 부터 const renderSmsNewYearContent = () => { 직전까지의 정상 코드를 추출

const backupSmsIdx = backupContent.indexOf(searchString);
if (backupSmsIdx === -1) {
  console.error("Failed to find renderSmsNewYearContent in backup!");
  process.exit(1);
}

// backupContent에서 daeun_roadmap_1부터 renderSmsNewYearContent 직전까지의 코드
const normalMiddleContent = backupContent.substring(backupStartIdx, backupSmsIdx);

// 치환 작업
const pageBefore = pageContent.substring(0, pageStartIdx);
const pageAfter = pageContent.substring(secondSmsIdx); // 진짜 renderSmsNewYearContent 시작지점부터 끝까지

const fixedContent = pageBefore + normalMiddleContent + pageAfter;

fs.writeFileSync(pagePath, fixedContent, 'utf8');
console.log("=== Syntax Error Repaired and Normal Code Restored Successfully! ===");
