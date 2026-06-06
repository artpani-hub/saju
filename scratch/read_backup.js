const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'src', 'app', 'result', 'page_backup.js');
if (!fs.existsSync(filePath)) {
  console.log("page_backup.js does not exist");
  process.exit(1);
}
const content = fs.readFileSync(filePath, 'utf8');

const lines = content.split('\n');
console.log("=== Printing lines 2750-2790 of page_backup.js ===");
for (let i = 2749; i < 2789 && i < lines.length; i++) {
  console.log(`${i + 1}: ${lines[i]}`);
}
