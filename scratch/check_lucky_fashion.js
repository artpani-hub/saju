const fs = require('fs');
const path = require('path');

const pageJsPath = path.join('d:', '인터그리비티', 'saju', 'src', 'app', 'result', 'page.js');
const pageContent = fs.readFileSync(pageJsPath, 'utf8');

const regex = /case "ny_lucky_fashion":([\s\S]*?)case "ny_diet_presc":/g;
const match = regex.exec(pageContent);
if (match) {
  console.log("=== First occurrence of ny_lucky_fashion ===");
  console.log(match[1].trim());
} else {
  console.log("ny_lucky_fashion not found");
}

const match2 = regex.exec(pageContent);
if (match2) {
  console.log("\n=== Second occurrence of ny_lucky_fashion ===");
  console.log(match2[1].trim());
} else {
  console.log("Second ny_lucky_fashion not found");
}
