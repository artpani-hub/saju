const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    const dirPath = path.join(dir, f);
    const isDirectory = fs.statSync(dirPath).isDirectory();
    if (isDirectory) {
      walkDir(dirPath, callback);
    } else {
      callback(dirPath);
    }
  });
}

const srcDir = path.join('d:', '인터그리비티', 'saju', 'src');
const query = 'renderNewYearPageContent';

console.log(`Searching for "${query}" references in all files under src/...`);
walkDir(srcDir, (filePath) => {
  if (!filePath.endsWith('.js') && !filePath.endsWith('.jsx')) return;
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  lines.forEach((line, idx) => {
    if (line.includes(query) && !filePath.includes('renderNewYearPageContent.js.bak') && !filePath.includes('page.js.bak')) {
      console.log(`${filePath}:${idx + 1}: ${line.trim()}`);
    }
  });
});
