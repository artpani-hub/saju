const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'src', 'app', 'result', 'page.js');
let content = fs.readFileSync(filePath, 'utf-8');

// Loose marker matching to avoid CRLF mismatch issues
const startPattern = 'renderNewYearPageContent =';
const endPattern = 'default:';

const startIndex = content.indexOf(startPattern);
const endIndex = content.indexOf(endPattern, startIndex);

if (startIndex === -1 || endIndex === -1) {
  console.error("Markers not found!");
  process.exit(1);
}

let switchContent = content.substring(startIndex, endIndex);

// Replace JSX dollar signs
switchContent = switchContent.replace(/\$\{/g, '{');

content = content.substring(0, startIndex) + switchContent + content.substring(endIndex);

fs.writeFileSync(filePath, content, 'utf-8');
console.log("Successfully removed dollars using loose markers!");
