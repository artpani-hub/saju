const fs = require('fs');
const path = require('path');

const cleanDiffs = require('./clean_diffs.json');

console.log('Cleaned diffs length:', cleanDiffs.length);

// Let's filter for lines containing real Korean words or numbers and not just single letters or garbled characters.
// We can use a regex to detect typical Korean letters.
const koreanRegex = /[ㄱ-ㅎㅏ-ㅣ가-힣]/;

const readableDiffs = cleanDiffs.filter(d => {
    // Keep diffs that have Korean letters in at least one file.
    return koreanRegex.test(d.file1) || koreanRegex.test(d.file2);
});

console.log('Readable diffs with Korean:', readableDiffs.length);

readableDiffs.forEach((d, idx) => {
    console.log(`[#${idx+1}] Line ${d.lineNum}:`);
    console.log(`  File 1: ${d.file1}`);
    console.log(`  File 2: ${d.file2}`);
});

fs.writeFileSync(path.join(__dirname, 'readable_korean_diffs.json'), JSON.stringify(readableDiffs, null, 2));
