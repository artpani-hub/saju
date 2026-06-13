const fs = require('fs');
const path = require('path');
const pdf = require('pdf-parse');

const file1 = path.join(__dirname, '..', 'etc', '2001.9.15.pdf');
const file2 = path.join(__dirname, '..', 'etc', '김사링 신년운세.pdf');

async function parsePdf(filePath) {
    const dataBuffer = fs.readFileSync(filePath);
    // Convert Buffer to Uint8Array
    const uint8Array = new Uint8Array(dataBuffer);
    const parser = new pdf.PDFParse(uint8Array);
    const result = await parser.getText();
    return result.text;
}

async function run() {
    console.log('Parsing PDFs...');
    const text1 = await parsePdf(file1);
    console.log('PDF 1 parsed. Length:', text1.length);
    const text2 = await parsePdf(file2);
    console.log('PDF 2 parsed. Length:', text2.length);
    
    fs.writeFileSync(path.join(__dirname, 'text1.txt'), text1);
    fs.writeFileSync(path.join(__dirname, 'text2.txt'), text2);
    
    console.log('Done parsing.');
}

run().catch(console.error);
