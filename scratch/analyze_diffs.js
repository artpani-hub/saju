const fs = require('fs');
const path = require('path');

const text1 = fs.readFileSync(path.join(__dirname, 'text1.txt'), 'utf8');
const text2 = fs.readFileSync(path.join(__dirname, 'text2.txt'), 'utf8');

// We want to analyze differences.
// Let's split them into lines and find exact matches, or compare their contents page by page or block by block.
const lines1 = text1.split('\n').map(l => l.trim()).filter(Boolean);
const lines2 = text2.split('\n').map(l => l.trim()).filter(Boolean);

console.log('Comparing files line by line...');
console.log('Total non-empty lines: File 1 =', lines1.length, 'vs File 2 =', lines2.length);

// Let's find common lines and unique lines
const set1 = new Set(lines1);
const set2 = new Set(lines2);

const common = lines1.filter(l => set2.has(l));
const onlyIn1 = lines1.filter(l => !set2.has(l));
const onlyIn2 = lines2.filter(l => !set1.has(l));

console.log('Common lines count:', common.length);
console.log('Only in File 1 (2001.9.15.pdf) count:', onlyIn1.length);
console.log('Only in File 2 (김사링 신년운세.pdf) count:', onlyIn2.length);

console.log('\n--- SAMPLE ONLY IN FILE 1 ---');
console.log(onlyIn1.slice(0, 30).join('\n'));

console.log('\n--- SAMPLE ONLY IN FILE 2 ---');
console.log(onlyIn2.slice(0, 30).join('\n'));

// Let's write a detailed comparison report
let report = `## PDF 비교 분석 결과\n\n`;
report += `* **파일 1**: 2001.9.15.pdf (양력 2001년 9월 15일생 추정)\n`;
report += `* **파일 2**: 김사링 신년운세.pdf (김사랑 고객 추정)\n\n`;
report += `### 1. 텍스트 크기 비교\n`;
report += `* 파일 1 글자수: ${text1.length}자 / 행 수: ${lines1.length}행\n`;
report += `* 파일 2 글자수: ${text2.length}자 / 행 수: ${lines2.length}행\n`;
report += `* 두 파일의 텍스트 양은 매우 유사하나 미세한 차이가 존재합니다.\n\n`;

report += `### 2. 파일 1(2001.9.15.pdf)에만 존재하는 독자적 텍스트 샘플\n\`\`\`text\n`;
report += onlyIn1.slice(0, 40).join('\n') + `\n\`\`\`\n\n`;

report += `### 3. 파일 2(김사링 신년운세.pdf)에만 존재하는 독자적 텍스트 샘플\n\`\`\`text\n`;
report += onlyIn2.slice(0, 40).join('\n') + `\n\`\`\`\n\n`;

fs.writeFileSync(path.join(__dirname, 'pdf_comparison_report.md'), report);
console.log('Report generated.');
