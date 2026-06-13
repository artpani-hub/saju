const fs = require('fs');
const path = require('path');

const targetPath = path.join(__dirname, '../src/app/result/page.js');
let content = fs.readFileSync(targetPath, 'utf8');

// 개행 파싱 문제로 주석처리된 currentGrade 선언부를 정확히 정규식으로 복구
const badPattern = /const reportGrade = searchParams\.get\("reportGrade"\) \|\| "premium"; \/\/ premium\(고급\), deep\(심화\)\s*const currentGrade = reportGrade;/;

if (badPattern.test(content)) {
  console.log("Found bad pattern. Replacing...");
  content = content.replace(badPattern, `const reportGrade = searchParams.get("reportGrade") || "premium"; // premium(고급), deep(심화)\n  const currentGrade = reportGrade;`);
  fs.writeFileSync(targetPath, content, 'utf8');
  console.log("Replacement successful!");
} else {
  console.log("Bad pattern not found! Trying alternate search...");
  // 혹시 다르게 매칭되는지 다른 형태로 변경 시도
  const searchStr = 'const reportGrade = searchParams.get("reportGrade") || "premium"; // premium(고급), deep(심화)';
  if (content.includes(searchStr)) {
    console.log("Found substring. Replacing inline currentGrade...");
    // currentGrade = reportGrade 부분을 강제로 두 줄로 분할
    content = content.replace(searchStr + '  const currentGrade = reportGrade;', searchStr + '\n  const currentGrade = reportGrade;');
    fs.writeFileSync(targetPath, content, 'utf8');
    console.log("Substring replacement successful!");
  } else {
    console.log("Could not find the target string.");
  }
}
