const fs = require('fs');
const path = require('path');

function searchInFile(filePath, query) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    console.log(`\nSearching for "${query}" in ${path.basename(filePath)}...`);
    let matches = 0;
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].toLowerCase().includes(query.toLowerCase())) {
        console.log(`Line ${i + 1}: ${lines[i].trim()}`);
        matches++;
        if (matches >= 20) {
          console.log("... (truncated matches)");
          break;
        }
      }
    }
    if (matches === 0) {
      console.log("No matches found.");
    }
  } catch (err) {
    console.error(`Error reading ${filePath}:`, err.message);
  }
}

const target = process.argv[2] || 'page.js';
const query = process.argv[3] || 'export default';

const baseDir = path.join('d:', '인터그리비티', 'saju', 'src', 'app', 'result');
let fullPath = path.join(baseDir, target);

if (target.includes('/') || target.includes('\\')) {
  fullPath = path.resolve(target);
}

searchInFile(fullPath, query);
