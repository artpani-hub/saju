const fs = require('fs');
const path = require('path');

const pageJsPath = path.join(__dirname, '..', 'src', 'app', 'result', 'page.js');
const backupJsPath = path.join(__dirname, '..', 'src', 'app', 'result', 'backup', 'page_backup.js');

let pageContent = fs.readFileSync(pageJsPath, 'utf8').replace(/\r\n/g, '\n');
const backupContent = fs.readFileSync(backupJsPath, 'utf8').replace(/\r\n/g, '\n');

console.log("=== Recovering ny_health_presc from page_backup.js ===");

// 1. Get the original ny_health_presc text from backup
const backupStartStr = '      case "ny_health_presc":';
const backupEndStr = '      case "ny_lucky_secrets":';

const backupStartIdx = backupContent.indexOf(backupStartStr);
const backupEndIdx = backupContent.indexOf(backupEndStr, backupStartIdx);

if (backupStartIdx === -1 || backupEndIdx === -1) {
  console.log("ERROR: Could not locate ny_health_presc or ny_lucky_secrets in backup file!");
  process.exit(1);
}

const originalHealthPrescText = backupContent.slice(backupStartIdx, backupEndIdx);
console.log("Successfully extracted original health presc block from backup! Length: " + originalHealthPrescText.length);

// 2. Locate the broken ny_health_presc region in page.js
// It starts from case "ny_health_presc": and ends right before case "ny_lucky_secrets":
const pageStartIdx = pageContent.indexOf('      case "ny_health_presc":');
const pageEndIdx = pageContent.indexOf('      case "ny_lucky_secrets":', pageStartIdx);

if (pageStartIdx === -1 || pageEndIdx === -1) {
  console.log("ERROR: Could not locate ny_health_presc or ny_lucky_secrets in page.js!");
  process.exit(1);
}

console.log(`Replacing broken region in page.js: Char ${pageStartIdx} to Char ${pageEndIdx}`);

const before = pageContent.slice(0, pageStartIdx);
const after = pageContent.slice(pageEndIdx);

pageContent = before + originalHealthPrescText + after;

fs.writeFileSync(pageJsPath, pageContent, 'utf8');
console.log("SUCCESS: ny_health_presc has been perfectly restored!");
