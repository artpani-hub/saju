const fs = require('fs');
const path = require('path');

const targetPath = path.join(__dirname, '../src/app/result/components/renderNewYearPageContent.js');
let content = fs.readFileSync(targetPath, 'utf8');

const targetStr = '"부족한 오행을 채우는 일상 개운법"\r\n        );\r\n\r\n      case "ny_health_presc":';
const targetStrLF = '"부족한 오행을 채우는 일상 개운법"\n        );\n\n      case "ny_health_presc":';

const replacementStr = '"부족한 오행을 채우는 일상 개운법"\r\n        );\r\n      }\r\n\r\n      case "ny_health_presc":';
const replacementStrLF = '"부족한 오행을 채우는 일상 개운법"\n        );\n      }\n\n      case "ny_health_presc":';

if (content.includes(targetStr)) {
  content = content.replace(targetStr, replacementStr);
  console.log("Successfully added brace (CRLF).");
} else if (content.includes(targetStrLF)) {
  content = content.replace(targetStrLF, replacementStrLF);
  console.log("Successfully added brace (LF).");
} else {
  // Let's try matching with regex for extra safety
  const braceRegex = /"부족한\s+오행을\s+채우는\s+일상\s+개운법"\s*\);\s*case\s+"ny_health_presc":\s*\{/;
  const replacementBrace = '"부족한 오행을 채우는 일상 개운법"\n        );\n      }\n\n      case "ny_health_presc": {';
  if (braceRegex.test(content)) {
    content = content.replace(braceRegex, replacementBrace);
    console.log("Successfully added brace (Regex).");
  } else {
    // Try with simpler match
    const simplerRegex = /"부족한 오행을 채우는 일상 개운법"\s*,\s*"\s*"\s*\)\s*;\s*case "ny_health_presc":/i;
    console.error("Could not find the target string! Trying direct substring check.");
    
    const index = content.indexOf('"부족한 오행을 채우는 일상 개운법"');
    if (index !== -1) {
      console.log("Found substring index: " + index);
      // Let's slice and see what's after it
      const slice = content.substring(index, index + 200);
      console.log("Context slice:\n" + slice);
      
      // Let's do a replace based on the actual slice
      const actualTarget = slice.split('case "ny_health_presc":')[0] + 'case "ny_health_presc":';
      const actualReplacement = slice.split('case "ny_health_presc":')[0] + '}\n\n      case "ny_health_presc":';
      content = content.replace(actualTarget, actualReplacement);
      console.log("Successfully replaced with dynamic slice match!");
    } else {
      console.error("Failed to locate substring at all.");
    }
  }
}

fs.writeFileSync(targetPath, content, 'utf8');
