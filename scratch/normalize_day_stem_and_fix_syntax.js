const fs = require('fs');
const path = require('path');

const filePath = path.join('d:', '인터그리비티', 'saju', 'src', 'app', 'result', 'components', 'renderNewYearPageContent.js');
let content = fs.readFileSync(filePath, 'utf8');

// 1. 중복 중괄호 18라인의 }; 제거
// "default: return \"bg-gray-100 text-gray-500\";\n  }\n};\n};" 형태를 "default: return \"bg-gray-100 text-gray-500\";\n  }\n};"로 변경
const targetCurly = `    default: return "bg-gray-100 text-gray-500";
  }
};
};`;

const replacedCurly = `    default: return "bg-gray-100 text-gray-500";
  }
};`;

if (content.includes(targetCurly)) {
  content = content.replace(targetCurly, replacedCurly);
  console.log('Fixed the duplicate closing brace at line 18 successfully!');
} else {
  // LF 대응
  const targetCurlyLF = targetCurly.replace(/\r\n/g, '\n');
  const replacedCurlyLF = replacedCurly.replace(/\r\n/g, '\n');
  if (content.includes(targetCurlyLF)) {
    content = content.replace(targetCurlyLF, replacedCurlyLF);
    console.log('Fixed the duplicate closing brace (LF) successfully!');
  } else {
    // 수동 정규식 제거
    content = content.replace(/const getElementColor = \([\s\S]*?\};\s*\n\s*\};\s*\n/, (match) => {
      return match.replace(/\};\s*\n\s*\};\s*\n$/, '};\n');
    });
    console.log('Applied fallback regex to clean duplicate brace.');
  }
}

// 2. getNormalEl 정규화 함수 추가 및 사용
// getElementColor 바로 위에 getNormalEl 정의 추가
const getNormalElDef = `const getNormalEl = (el) => {
  if (!el) return "목";
  const str = String(el).trim();
  if (str === "목" || str === "木" || str.toLowerCase() === "wood") return "목";
  if (str === "화" || str === "火" || str.toLowerCase() === "fire") return "화";
  if (str === "토" || str === "土" || str.toLowerCase() === "earth") return "토";
  if (str === "금" || str === "金" || str.toLowerCase() === "metal") return "금";
  if (str === "수" || str === "水" || str.toLowerCase() === "water") return "수";
  return "목"; // 기본값
};\n\n`;

if (!content.includes('const getNormalEl =')) {
  content = content.replace('const getElementColor =', getNormalElDef + 'const getElementColor =');
  console.log('Injected getNormalEl definition successfully!');
}

// 3. ny_roadmap_2030, ny_lucky_fashion, ny_diet_presc의 dayStemEl 참조에 getNormalEl 적용하기
// ny_roadmap_2030 분석 부분:
//       case "ny_roadmap_2030": {
//         const dayStemEl = sajuInfo?.day?.stemEl || "목";
// ->
//       case "ny_roadmap_2030": {
//         const dayStemEl = getNormalEl(sajuInfo?.day?.stemEl);
content = content.replace(/case "ny_roadmap_2030": \{\s*const dayStemEl = sajuInfo\?\.day\?\.stemEl \|\| "목";/g, 'case "ny_roadmap_2030": {\n        const dayStemEl = getNormalEl(sajuInfo?.day?.stemEl);');

// ny_lucky_fashion 부분:
//       case "ny_lucky_fashion": {
//         const dayStemEl = sajuInfo?.day?.stemEl || "목";
// ->
//       case "ny_lucky_fashion": {
//         const dayStemEl = getNormalEl(sajuInfo?.day?.stemEl);
content = content.replace(/case "ny_lucky_fashion": \{\s*const dayStemEl = sajuInfo\?\.day\?\.stemEl \|\| "목";/g, 'case "ny_lucky_fashion": {\n        const dayStemEl = getNormalEl(sajuInfo?.day?.stemEl);');

// ny_diet_presc 부분:
//       case "ny_diet_presc": {
//         const dayStemEl = sajuInfo.day.stemEl;
// ->
//       case "ny_diet_presc": {
//         const dayStemEl = getNormalEl(sajuInfo?.day?.stemEl);
content = content.replace(/case "ny_diet_presc": \{\s*const dayStemEl = sajuInfo\.day\.stemEl;/g, 'case "ny_diet_presc": {\n        const dayStemEl = getNormalEl(sajuInfo?.day?.stemEl);');

fs.writeFileSync(filePath, content, 'utf8');
console.log('=== Normalization & Syntax Fix script completed! ===');
