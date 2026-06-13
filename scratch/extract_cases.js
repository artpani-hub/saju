const fs = require('fs');
const path = require('path');

const pageFilePath = path.join(__dirname, '..', 'src', 'app', 'result', 'page.js');
const outputDir = __dirname;

const pageLines = fs.readFileSync(pageFilePath, 'utf8').split('\n');

const ranges = {
  ny_wealth_portfolio: [10483, 10566],
  ny_career_detailed: [10566, 10687],
  ny_social_life: [10687, 10807],
  ny_roadmap_2030: [10807, 10880],
  ny_roadmap_2031: [10880, 10959],
  ny_lucky_fashion: [10959, 10992],
  ny_diet_presc: [10992, 11219]
};

Object.entries(ranges).forEach(([caseName, [start, end]]) => {
  const content = pageLines.slice(start, end).join('\n');
  const outPath = path.join(outputDir, `${caseName}.txt`);
  fs.writeFileSync(outPath, content, 'utf8');
  console.log(`Extracted ${caseName}: ${end - start} lines to ${outPath}`);
});
