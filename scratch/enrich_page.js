const fs = require('fs');
const path = require('path');

const pageJsPath = path.join(__dirname, '..', 'src', 'app', 'result', 'page.js');
let content = fs.readFileSync(pageJsPath, 'utf8');

// Normalize line endings to LF (\n) to prevent matching issues on Windows
content = content.replace(/\r\n/g, '\n');

console.log("=== Enriching page.js using external text files ===");

// Load replacement texts
const nyMonthlyNew = fs.readFileSync(path.join(__dirname, 'ny_monthly.txt'), 'utf8').replace(/\r\n/g, '\n');
const nyWealthFortuneNew = fs.readFileSync(path.join(__dirname, 'ny_wealth_fortune.txt'), 'utf8').replace(/\r\n/g, '\n');
const nyWealthPortfolioNew = fs.readFileSync(path.join(__dirname, 'ny_wealth_portfolio.txt'), 'utf8').replace(/\r\n/g, '\n');

// 1. ny_monthly case replacement (from case "ny_monthly" to case "ny_wealth_fortune")
const idxMonthly = content.indexOf('      case "ny_monthly":');
const idxFortune = content.indexOf('      case "ny_wealth_fortune":');

if (idxMonthly !== -1 && idxFortune !== -1) {
  console.log("Replacing ny_monthly from character " + idxMonthly + " to character " + idxFortune);
  const before = content.slice(0, idxMonthly);
  const after = content.slice(idxFortune);
  content = before + nyMonthlyNew + "\n\n" + after;
  console.log("SUCCESS: ny_monthly case personalized!");
} else {
  console.log("ERROR: Failed to locate ny_monthly or ny_wealth_fortune!");
}

// 2. ny_wealth_fortune case replacement (from case "ny_wealth_fortune" to case "ny_career_fortune")
const idxFortuneNew = content.indexOf('      case "ny_wealth_fortune":');
const idxCareer = content.indexOf('      case "ny_career_fortune":');

if (idxFortuneNew !== -1 && idxCareer !== -1) {
  console.log("Replacing ny_wealth_fortune from character " + idxFortuneNew + " to character " + idxCareer);
  const before = content.slice(0, idxFortuneNew);
  const after = content.slice(idxCareer);
  content = before + nyWealthFortuneNew + "\n\n" + after;
  console.log("SUCCESS: ny_wealth_fortune personalized!");
} else {
  console.log("ERROR: Failed to locate ny_wealth_fortune or ny_career_fortune!");
}

// 3. ny_wealth_portfolio case replacement
const idxPortfolio = content.indexOf('      case "ny_wealth_portfolio":');
if (idxPortfolio !== -1) {
  console.log("Found case \"ny_wealth_portfolio\": at character " + idxPortfolio);
  const idxCareerDetailed = content.indexOf('      case "ny_career_detailed":', idxPortfolio);
  if (idxCareerDetailed !== -1) {
    console.log("Found ny_career_detailed start marker at character " + idxCareerDetailed);
    const before = content.slice(0, idxPortfolio);
    const after = content.slice(idxCareerDetailed);
    content = before + nyWealthPortfolioNew + after;
    console.log("SUCCESS: ny_wealth_portfolio personalized!");
  } else {
    console.log("ERROR: Failed to find ny_career_detailed marker after portfolio!");
  }
} else {
  console.log("ERROR: Failed to find ny_wealth_portfolio header!");
}

// Write the finalized code back to page.js
fs.writeFileSync(pageJsPath, content, 'utf8');
console.log("=== All Personalizations Saved Successfully! ===");
