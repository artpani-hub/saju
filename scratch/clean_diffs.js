const fs = require('fs');
const path = require('path');

const diffs = require('./diffs_output.json');

console.log('Total differing lines:', diffs.length);

// We want to print clean, readable diffs.
// Since pdf-parse sometimes outputs text mapping with character codes that look like unicode escapes,
// let's filter out lines that have actual Korean readable differences, or print the text where the names differ.
// Let's decode the unicode sequences to see if we can read them.
// Let's write a script that decodes the diffs and prints the ones that contain readable characters (length > 2 and not just control characters).

function cleanText(str) {
    // replace non-printable characters or weird control bytes
    return str.replace(/[\x00-\x1F\x7F-\x9F]/g, ' ').replace(/\s+/g, ' ').trim();
}

const cleanDiffs = diffs.map(d => {
    return {
        lineNum: d.lineNum,
        file1: cleanText(d.file1),
        file2: cleanText(d.file2)
    };
}).filter(d => d.file1 !== d.file2 && (d.file1.length > 5 || d.file2.length > 5));

console.log('Cleaned differing lines count:', cleanDiffs.length);

// Let's write the first 100 cleaned differences to check what is going on
cleanDiffs.slice(0, 100).forEach(d => {
    console.log(`Line ${d.lineNum}:`);
    console.log(`  File 1: ${d.file1}`);
    console.log(`  File 2: ${d.file2}`);
});

fs.writeFileSync(path.join(__dirname, 'clean_diffs.json'), JSON.stringify(cleanDiffs, null, 2));
