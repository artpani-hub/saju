const fs = require('fs');
const path = require('path');

const filePath = path.join('d:', '인터그리비티', 'saju', 'src', 'app', 'result', 'page.js');
const content = fs.readFileSync(filePath, 'utf8');

const lines = content.split('\n');
let foundIndex = -1;

lines.forEach((line, index) => {
  if (line.includes('case "ny_fengshui_interior":')) {
    foundIndex = index;
    console.log(`Found case "ny_fengshui_interior": at line ${index + 1}`);
  }
});

if (foundIndex !== -1) {
  console.log("=== Printing context around case ===");
  for (let i = foundIndex - 20; i < foundIndex + 120 && i < lines.length; i++) {
    console.log(`${i + 1}: ${lines[i]}`);
  }
} else {
  console.log("Not found.");
}
