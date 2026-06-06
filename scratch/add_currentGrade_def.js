const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'src', 'app', 'result', 'page.js');
let content = fs.readFileSync(filePath, 'utf8');

console.log("=== Adding currentGrade declaration ===");

const lines = content.split('\n');
let replaced = false;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('const reportGrade = searchParams.get("reportGrade")')) {
    lines[i] = lines[i] + '\r  const currentGrade = reportGrade;';
    replaced = true;
    console.log(`Found and replaced at line ${i + 1}`);
    break;
  }
}

if (!replaced) {
  console.error("Target reportGrade declaration not found!");
  process.exit(1);
}

const updatedContent = lines.join('\n');
fs.writeFileSync(filePath, updatedContent, 'utf8');
console.log("=== currentGrade declaration added successfully! ===");
