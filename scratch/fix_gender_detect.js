const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'src', 'app', 'result', 'page.js');
let content = fs.readFileSync(filePath, 'utf8');

console.log("=== Fixing gender detection logic ===");

const targetStr = 'const gender = searchParams.get("gender") === "male" ? "남성" : "여성";';
const replacementStr = 'const genderVal = searchParams.get("gender");\n  const gender = (genderVal === "male" || genderVal === "남" || genderVal === "남성") ? "남성" : "여성";';

if (!content.includes(targetStr)) {
  console.error("Target gender assignment not found!");
  process.exit(1);
}

content = content.replace(targetStr, replacementStr);
fs.writeFileSync(filePath, content, 'utf8');
console.log("=== Gender detection logic fixed successfully! ===");
