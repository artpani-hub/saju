const fs = require('fs');
const path = require('path');
const pdf = require('pdf-parse');

const file1 = path.join(__dirname, '..', 'etc', '0612-1.pdf');
const file2 = path.join(__dirname, '..', 'etc', '0612-2.pdf');

async function parsePdf(filePath) {
    const dataBuffer = fs.readFileSync(filePath);
    const uint8Array = new Uint8Array(dataBuffer);
    const parser = new pdf.PDFParse(uint8Array);
    const result = await parser.getText();
    return result.text;
}

async function run() {
    console.log('Parsing new PDFs...');
    const text1 = await parsePdf(file1);
    console.log('PDF 1 parsed. Length:', text1.length);
    const text2 = await parsePdf(file2);
    console.log('PDF 2 parsed. Length:', text2.length);
    
    fs.writeFileSync(path.join(__dirname, 'text1_new.txt'), text1);
    fs.writeFileSync(path.join(__dirname, 'text2_new.txt'), text2);
    
    console.log('Done parsing new PDFs.');
}

run().catch(console.error);
