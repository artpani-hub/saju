const fs = require('fs');
const path = require('path');

const filePath = path.join('d:', '인터그리비티', 'saju', 'src', 'app', 'result', 'page.js');
let content = fs.readFileSync(filePath, 'utf8');

console.log("=== Removing duplicate new year page cases from page.js ===");

// "case \"ny_intro_saju\":"가 나타나는 두 개의 인덱스 찾기
const marker = 'case "ny_intro_saju":';
const firstIdx = content.indexOf(marker);
if (firstIdx === -1) {
  console.error("First case ny_intro_saju not found!");
  process.exit(1);
}

const secondIdx = content.indexOf(marker, firstIdx + 10);
if (secondIdx === -1) {
  console.log("No duplicate case ny_intro_saju found. Already clean.");
  process.exit(0);
}

console.log(`First idx: ${firstIdx}, Second idx: ${secondIdx}`);

// 두 번째 세트 시작점부터 뒤에 처음 만나는 case "ny_final_blessing": 찾기
const endMarker = 'case "ny_final_blessing":';
const endIdx = content.indexOf(endMarker, secondIdx);
if (endIdx === -1) {
  console.error("ny_final_blessing marker not found after duplicate start!");
  process.exit(1);
}

console.log(`End idx (ny_final_blessing): ${endIdx}`);

// 두 번째 세트가 들어갈 부분(secondIdx부터 endIdx 직전까지) 제거
// 줄바꿈이나 공백 정렬을 위해 secondIdx 앞의 인덴트 공간을 확인
let cutStart = secondIdx;
while (cutStart > 0 && (content[cutStart - 1] === ' ' || content[cutStart - 1] === '\t' || content[cutStart - 1] === '\n' || content[cutStart - 1] === '\r')) {
  cutStart--;
}

// ny_final_blessing 바로 앞까지 잘라내기
let cutEnd = endIdx;
while (cutEnd > 0 && (content[cutEnd - 1] === ' ' || content[cutEnd - 1] === '\t')) {
  cutEnd--;
}

console.log(`Cutting content from index ${cutStart} to ${cutEnd}`);

const newContent = content.slice(0, cutStart) + "\n\n      " + content.slice(cutEnd);

// 임시 백업을 또 뜨고 저장
fs.writeFileSync(filePath + '.bak_duplicates', content, 'utf8');
fs.writeFileSync(filePath, newContent, 'utf8');

console.log("=== Successfully removed duplicate new year cases! ===");
