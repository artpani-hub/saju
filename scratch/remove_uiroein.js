const fs = require('fs');
const path = require('path');

const filePaths = [
  path.join(__dirname, '..', 'src', 'app', 'result', 'components', 'renderNewYearPageContent.js'),
  path.join(__dirname, '..', 'src', 'app', 'result', 'page.js')
];

console.log("=== STEP 3: ERADICATING '의뢰인' FROM ALL RESULT PAGES ===");

filePaths.forEach(targetFilePath => {
  if (!fs.existsSync(targetFilePath)) return;
  let content = fs.readFileSync(targetFilePath, 'utf8');
  
  // 1. 구체적인 패턴 치환
  content = content.replace(/의뢰인\s*\$\{name\}님의/g, '${name}님의');
  content = content.replace(/의뢰인\s*\{name\}님의/g, '{name}님의');
  content = content.replace(/의뢰인님의/g, '귀하의');

  content = content.replace(/의뢰인\s*\$\{name\}님/g, '${name}님');
  content = content.replace(/의뢰인\s*\{name\}님/g, '{name}님');
  content = content.replace(/의뢰인님/g, '귀하');

  content = content.replace(/의뢰인\s*\$\{name\}은/g, '${name}은');
  content = content.replace(/의뢰인\s*\{name\}/g, '{name}');
  content = content.replace(/의뢰인을/g, '귀하를');

  content = content.replace(/의뢰인의\s*/g, '귀하의 ');
  content = content.replace(/의뢰인\s*맞춤형\s*고민/g, '맞춤형 고민');
  content = content.replace(/의뢰인\s*입력\s*안건/g, '입력 안건');
  content = content.replace(/솔로\s*의뢰인/g, '솔로 운세');
  content = content.replace(/의뢰인\s*성명/g, '성명');
  content = content.replace(/의뢰인\s*출생\s*정보/g, '출생 정보');
  content = content.replace(/의뢰인\s*명조\s*분석/g, '명조 분석');
  content = content.replace(/의뢰인\s*고민\s*극복/g, '고민 극복');

  // 2. 남은 단독 '의뢰인' 문자열에 대한 추가 보정
  content = content.replace(/의뢰인\s+/g, '');

  fs.writeFileSync(targetFilePath, content, 'utf8');
  console.log(`Cleaned file: ${path.basename(targetFilePath)}`);
});

console.log("SUCCESS: '의뢰인' eradication complete!");
