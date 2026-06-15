const fs = require('fs');
const path = require('path');

// 1. renderNewYearPageContent.js 수정
const renderFilePath = path.join('d:', '인터그리비티', 'saju', 'src', 'app', 'result', 'components', 'renderNewYearPageContent.js');
let renderContent = fs.readFileSync(renderFilePath, 'utf8');

// premiumOnlyPages에서 "ny_ilju_harmony" 제거
// 원래 코드 형태:
//       const premiumOnlyPages = [
//         "ny_ilju_harmony",
//         "ny_sinsal_active",
// 혹은 다른 줄바꿈 형식 대응
const target1 = '"ny_ilju_harmony",';
if (renderContent.includes(target1)) {
  renderContent = renderContent.replace(target1, '');
  console.log('Removed ny_ilju_harmony from premiumOnlyPages in renderNewYearPageContent.js');
} else {
  console.log('ny_ilju_harmony not found in premiumOnlyPages of renderNewYearPageContent.js (or already removed)');
}

fs.writeFileSync(renderFilePath, renderContent, 'utf8');

// 2. page.js 수정
const pageFilePath = path.join('d:', '인터그리비티', 'saju', 'src', 'app', 'result', 'page.js');
let pageContent = fs.readFileSync(pageFilePath, 'utf8');

// deepExcludeTypes에서 "ny_ilju_harmony" 제거
if (pageContent.includes(target1)) {
  pageContent = pageContent.replace(target1, '');
  console.log('Removed ny_ilju_harmony from deepExcludeTypes in page.js');
} else {
  console.log('ny_ilju_harmony not found in deepExcludeTypes of page.js (or already removed)');
}

fs.writeFileSync(pageFilePath, pageContent, 'utf8');

console.log('=== Page 7 Unlock process completed! ===');
