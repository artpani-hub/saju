const fs = require('fs');
const path = require('path');

const pageJsPath = path.join('d:', '인터그리비티', 'saju', 'src', 'app', 'result', 'page.js');
const pageContent = fs.readFileSync(pageJsPath, 'utf8');

const regex = /case "ny_roadmap_2027":([\s\S]*?)case "ny_roadmap_2028":/g;
const match = regex.exec(pageContent);
if (match) {
  console.log("=== ny_roadmap_2027 in page.js ===");
  console.log(match[1].trim());
} else {
  console.log("ny_roadmap_2027 not found");
}
