const fs = require('fs');
const path = require('path');

// 1. page.js 복원 및 수정
const pageFilePath = path.join('d:', '인터그리비티', 'saju', 'src', 'app', 'result', 'page.js');
let pageContent = fs.readFileSync(pageFilePath, 'utf8');

// 손상된 부분 복원: { page: 7, type:  title: ...
// -> 원래대로 { page: 7, type: "ny_ilju_harmony", title: "일주(日柱)와 2026 세운의 합·충·형·파·해 진단" }
const brokenLine = '{ page: 7, type:  title: "일주(日柱)와 2026 세운의 합·충·형·파·해 진단" },';
const originalLine = '{ page: 7, type: "ny_ilju_harmony", title: "일주(日柱)와 2026 세운의 합·충·형·파·해 진단" },';

if (pageContent.includes(brokenLine)) {
  pageContent = pageContent.replace(brokenLine, originalLine);
  console.log('Restored broken line in page.js');
} else {
  // 혹시 띄어쓰기 차이 대응
  pageContent = pageContent.replace(/\{\s*page:\s*7,\s*type:\s*title:/, '{ page: 7, type: "ny_ilju_harmony", title:');
  console.log('Applied regex restore for page.js');
}

// 이제 deepExcludeTypes 에서만 ny_ilju_harmony를 지운다.
// 원래의 deepExcludeTypes 블록:
//     const deepExcludeTypes = [
//       "ny_ilju_harmony",
//       "ny_sinsal_active",
//       ...
//     ];
// 이 배열에서 "ny_ilju_harmony", 라인만 골라서 지운다.
const deepExcludeBlock = `    const deepExcludeTypes = [
      "ny_ilju_harmony",`;

const targetDeepExcludeBlock = `    const deepExcludeTypes = [`;

if (pageContent.includes(deepExcludeBlock)) {
  pageContent = pageContent.replace(deepExcludeBlock, targetDeepExcludeBlock);
  console.log('Removed ny_ilju_harmony from deepExcludeTypes array in page.js successfully!');
} else {
  // 혹시라도 LF/CRLF 차이가 있으면
  const deepExcludeBlockLF = deepExcludeBlock.replace(/\r\n/g, '\n');
  const targetDeepExcludeBlockLF = targetDeepExcludeBlock.replace(/\r\n/g, '\n');
  if (pageContent.includes(deepExcludeBlockLF)) {
    pageContent = pageContent.replace(deepExcludeBlockLF, targetDeepExcludeBlockLF);
    console.log('Removed ny_ilju_harmony (LF) from deepExcludeTypes array in page.js successfully!');
  } else {
    console.log('Could not find exact deepExcludeTypes block in page.js');
  }
}

fs.writeFileSync(pageFilePath, pageContent, 'utf8');

// 2. renderNewYearPageContent.js 도 제대로 되어 있는지 확인
const renderFilePath = path.join('d:', '인터그리비티', 'saju', 'src', 'app', 'result', 'components', 'renderNewYearPageContent.js');
let renderContent = fs.readFileSync(renderFilePath, 'utf8');

// 혹시 renderNewYearPageContent.js에서도 case 문 등이 깨지진 않았는지 확인
// "ny_ilju_harmony"가 premiumOnlyPages에서 지워질 때:
//       const premiumOnlyPages = [
//         "ny_ilju_harmony",
// 이 블록에서만 지워졌어야 함.
const premiumOnlyBlock = `      const premiumOnlyPages = [
        "ny_ilju_harmony",`;
const targetPremiumOnlyBlock = `      const premiumOnlyPages = [`;

if (renderContent.includes(premiumOnlyBlock)) {
  renderContent = renderContent.replace(premiumOnlyBlock, targetPremiumOnlyBlock);
  console.log('Removed ny_ilju_harmony from premiumOnlyPages in renderNewYearPageContent.js successfully!');
} else {
  const premiumOnlyBlockLF = premiumOnlyBlock.replace(/\r\n/g, '\n');
  const targetPremiumOnlyBlockLF = targetPremiumOnlyBlock.replace(/\r\n/g, '\n');
  if (renderContent.includes(premiumOnlyBlockLF)) {
    renderContent = renderContent.replace(premiumOnlyBlockLF, targetPremiumOnlyBlockLF);
    console.log('Removed ny_ilju_harmony (LF) from premiumOnlyPages in renderNewYearPageContent.js successfully!');
  } else {
    console.log('Could not find premiumOnlyPages block or already removed.');
  }
}

fs.writeFileSync(renderFilePath, renderContent, 'utf8');
console.log('=== Syntax Fix & Clean Unlock completed! ===');
