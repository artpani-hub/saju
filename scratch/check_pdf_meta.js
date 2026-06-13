const fs = require('fs');
const path = require('path');

const file1 = path.join(__dirname, '..', 'etc', '0612-1.pdf');
const file2 = path.join(__dirname, '..', 'etc', '0612-2.pdf');

// We need to check the metadata or structural characteristics of these PDF files.
// For example, file size, pages count, text lengths, and why pdf-parse returns mapping index characters (like \x00, \t, etc.) instead of clean Korean text.
// This usually happens when the PDF does not contain embedded CMaps / Font mappings (meaning it's rendered as custom fonts where character codes don't map to standard Unicode), OR pdf-parse is having font-decoding issues.
// Let's check the pdf-parse metadata object (like metadata info, version, etc.) to understand the PDF encoding.
const pdf = require('pdf-parse');

async function checkMetadata(filePath, name) {
    const dataBuffer = fs.readFileSync(filePath);
    const uint8Array = new Uint8Array(dataBuffer);
    const parser = new pdf.PDFParse(uint8Array);
    const doc = await parser.load();
    const metadata = await doc.getMetadata().catch(() => null);
    console.log(`=== ${name} Metadata ===`);
    console.log('Pages:', doc.numPages);
    console.log('Metadata:', metadata);
}

async function run() {
    await checkMetadata(file1, '0612-1.pdf');
    await checkMetadata(file2, '0612-2.pdf');
}

run().catch(console.error);
