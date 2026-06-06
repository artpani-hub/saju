const { execSync } = require('child_process');
const fs = require('fs');

try {
  const stdout = execSync('git diff src/app/result/page.js', { encoding: 'utf8' });
  fs.writeFileSync('d:/인터그리비티/saju/scratch/git_diff_utf8.txt', stdout, 'utf8');
  console.log('Saved git diff as UTF-8 successfully.');
} catch (err) {
  console.error('Error running git diff:', err);
}
