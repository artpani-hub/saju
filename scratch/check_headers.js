const fs = require('fs');
const path = require('path');

const text1 = fs.readFileSync(path.join(__dirname, 'text1_new.txt'), 'utf8');
const text2 = fs.readFileSync(path.join(__dirname, 'text2_new.txt'), 'utf8');

// Let's check the first few hundred characters of each file to see what information they contain
// e.g. names, dates.
console.log('=== FILE 1 HEADER ===');
console.log(text1.substring(0, 1000));
console.log('=== FILE 2 HEADER ===');
console.log(text2.substring(0, 1000));
