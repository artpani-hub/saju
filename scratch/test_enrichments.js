const fs = require('fs');
const path = require('path');

const files = fs.readdirSync(__dirname).filter(f => f.startsWith('enrich_') && f.endsWith('.js'));
files.forEach(f => {
  const content = fs.readFileSync(path.join(__dirname, f), 'utf8');
  const lines = content.split('\n');
  const targetCases = [];
  lines.forEach(l => {
    const match = l.match(/(replaceSingleCase|replaceDoubleCase)\s*\(\s*['"]([^'"]+)['"]/);
    if (match) {
      targetCases.push(match[2]);
    }
  });
  console.log(`${f} targets: ${targetCases.join(', ')}`);
});
