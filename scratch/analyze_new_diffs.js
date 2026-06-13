const fs = require('fs');
const path = require('path');

const text1 = fs.readFileSync(path.join(__dirname, 'text1_new.txt'), 'utf8');
const text2 = fs.readFileSync(path.join(__dirname, 'text2_new.txt'), 'utf8');

// Let's do a more structured page-by-page comparison.
// Standard documents usually have page markers or numbers.
// In pdf-parse, page breaks are often \n\n or contain "혜안당 (慧眼堂) - 지혜로운 눈으로 밝히는 운명" or "페이지" or something.
// Let's search for "혜안당 (慧眼堂)" to split into pages, or look at how page boundaries are formatted.
// Let's split using a common page footer or header.
// Looking at the console outputs earlier, "혜안당 (慧眼堂)" is very common.
// Let's split by page footer/header if possible, or split by line count, or just look at lines.
const lines1 = text1.split('\n').map(l => l.trim()).filter(Boolean);
const lines2 = text2.split('\n').map(l => l.trim()).filter(Boolean);

console.log('Line counts:', lines1.length, 'vs', lines2.length);

// Let's write a script that does a side-by-side comparison of lines to see exactly where they differ.
// Since the layout is identical, they should have matching line structures.
// Let's find index-based differences.
let diffs = [];
const maxLines = Math.max(lines1.length, lines2.length);
for (let i = 0; i < maxLines; i++) {
    const l1 = lines1[i] || '';
    const l2 = lines2[i] || '';
    if (l1 !== l2) {
        diffs.push({
            lineNum: i + 1,
            file1: l1,
            file2: l2
        });
    }
}

console.log('Total differing lines:', diffs.length);
console.log('--- FIRST 50 DIFFERING LINES ---');
diffs.slice(0, 50).forEach(d => {
    console.log(`Line ${d.lineNum}:`);
    console.log(`  File 1: ${d.file1}`);
    console.log(`  File 2: ${d.file2}`);
});

// Let's save all differences to a file for review
fs.writeFileSync(path.join(__dirname, 'diffs_output.json'), JSON.stringify(diffs, null, 2));
