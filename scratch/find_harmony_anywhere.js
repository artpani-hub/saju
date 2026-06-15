const fs = require('fs');
const path = require('path');

function searchDir(dir, keyword) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      if (file !== 'node_modules' && file !== '.next' && file !== '.git') {
        searchDir(fullPath, keyword);
      }
    } else if (file.endsWith('.js') || file.endsWith('.jsx')) {
      const content = fs.readFileSync(fullPath, 'utf8');
      if (content.includes(keyword)) {
        console.log(`Found "${keyword}" in ${fullPath}`);
        const lines = content.split('\n');
        lines.forEach((line, idx) => {
          if (line.includes(keyword)) {
            console.log(`  Line ${idx + 1}: ${line.trim()}`);
          }
        });
      }
    }
  }
}

const srcDir = path.join('d:', '인터그리비티', 'saju', 'src');
console.log("=== Searching for ny_ilju_harmony ===");
searchDir(srcDir, "ny_ilju_harmony");
console.log("=== Searching for ilju_harmony ===");
searchDir(srcDir, "ilju_harmony");
