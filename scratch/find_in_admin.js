const fs = require('fs');
const path = require('path');

const filePath = 'd:/인터그리비티/saju/src/app/admin/page.js';
const content = fs.readFileSync(filePath, 'utf8');
const lines = content.split('\n');

console.log('Searching for fetch or interval in admin:');
lines.forEach((line, idx) => {
  if (line.includes('setInterval') || line.includes('fetchOrders') || line.includes('fetch(') || line.includes('refresh') || line.includes('load')) {
    console.log(`${idx + 1}: ${line.trim()}`);
  }
});
