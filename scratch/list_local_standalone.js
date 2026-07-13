const fs = require("fs");
const path = require("path");

const root = "d:/인터그리비티/saju";
const files = [];
function walk(dir) {
  if (!fs.existsSync(dir)) return;
  const list = fs.readdirSync(dir);
  for (const f of list) {
    const full = path.join(dir, f);
    const s = fs.statSync(full);
    if (s.isDirectory()) {
      walk(full);
    } else {
      files.push(full);
    }
  }
}
walk(path.join(root, ".next/standalone"));
console.log("Standalone files:", files.slice(0, 30));
console.log("Total standalone files:", files.length);
