const fs = require('fs');
const path = require('path');

const pageJsPath = path.join('d:', '인터그리비티', 'saju', 'src', 'app', 'result', 'page.js');
const pageContent = fs.readFileSync(pageJsPath, 'utf8');

const regex = /case "ny_wealth_portfolio":([\s\S]*?)case "ny_career_fortune":/g;
const match = regex.exec(pageContent);
if (match) {
  console.log("=== ny_wealth_portfolio block ===");
  console.log(match[1].trim());
} else {
  console.log("ny_wealth_portfolio not found");
}
