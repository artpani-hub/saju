const fs = require('fs');
const path = require('path');

const filePath = path.join('d:', '인터그리비티', 'saju', 'src', 'app', 'result', 'page.js');
const content = fs.readFileSync(filePath, 'utf8');

console.log("=== Checking substrings in page.js ===");
console.log("ny_lucky_fashion count:", (content.split("ny_lucky_fashion").length - 1));
console.log("ny_diet_presc count:", (content.split("ny_diet_presc").length - 1));
console.log("ny_intro_saju count:", (content.split("ny_intro_saju").length - 1));
