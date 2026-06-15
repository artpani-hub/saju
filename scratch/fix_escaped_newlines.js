const fs = require('fs');
const path = require('path');

const filePath = path.join('d:', '인터그리비티', 'saju', 'src', 'app', 'result', 'components', 'renderNewYearPageContent.js');
let content = fs.readFileSync(filePath, 'utf8');

// 잘못 삽입된 리터럴 "\\n" 또는 "\\n\\n" 을 실제 줄바꿈(LF 또는 CRLF)으로 교체
if (content.includes('\\n')) {
  content = content.replace(/\\n/g, '\n');
  console.log('Successfully replaced literal \\n with actual newlines!');
} else {
  console.log('No literal \\n found in the file.');
}

fs.writeFileSync(filePath, content, 'utf8');
console.log('=== Escaped Newlines Fix completed! ===');
