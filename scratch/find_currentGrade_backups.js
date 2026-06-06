const fs = require('fs');
const path = require('path');

const dirPath = path.join(__dirname, '..', 'src', 'app', 'result');
const files = fs.readdirSync(dirPath);

console.log("=== Checking backups for currentGrade ===");
files.forEach(file => {
  if (file.includes('.js.bak') || file === 'page_backup.js') {
    const filePath = path.join(dirPath, file);
    const content = fs.readFileSync(filePath, 'utf8');
    const count = (content.split('currentGrade').length - 1);
    const hasSetState = content.includes('setCurrentGrade');
    console.log(`File: ${file} | count of currentGrade: ${count} | has setCurrentGrade: ${hasSetState}`);
  }
});
