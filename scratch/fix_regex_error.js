const fs = require('fs');
const path = require('path');

const pageFilePath = path.join(__dirname, '..', 'src', 'app', 'result', 'page.js');
const extFilePath = path.join(__dirname, '..', 'src', 'app', 'result', 'components', 'renderNewYearPageContent.js');

const targetLine = 'const cleanedText = text ? decodeURIComponent(text).replace(/<\\/?[^>]+(>|$)/g, "") : "";';
const replacementLine = "const cleanedText = text ? decodeURIComponent(text).replace(new RegExp('</?[^>]+(>|$)', 'g'), '') : '';";

const fixRegex = (filePath) => {
  let content = fs.readFileSync(filePath, 'utf8');
  if (content.includes(targetLine)) {
    content = content.split(targetLine).join(replacementLine);
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Fixed regex in ${path.basename(filePath)} via split/join`);
  } else {
    // If double backslashes in replacement chunk generated slightly different escaping
    console.log(`Direct line match not found in ${path.basename(filePath)}, trying line-by-line replace`);
    const lines = content.split('\n');
    let fixedCount = 0;
    const regexPattern = /replace\(\/\\<\/\\\?\[\^>\]\+\(>\|\$\)\/g,\s*["']["']\)/;
    
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes('replace(/') && lines[i].includes('text ? decodeURIComponent')) {
        lines[i] = lines[i].replace(/replace\(\/.*?\/g,\s*["']["']\)/, "replace(new RegExp('</?[^>]+(>|$)', 'g'), '')");
        fixedCount++;
      }
    }
    if (fixedCount > 0) {
      fs.writeFileSync(filePath, lines.join('\n'), 'utf8');
      console.log(`Fixed ${fixedCount} occurrences in ${path.basename(filePath)}`);
    } else {
      console.log(`No match at all in ${path.basename(filePath)}`);
    }
  }
};

fixRegex(pageFilePath);
fixRegex(extFilePath);
