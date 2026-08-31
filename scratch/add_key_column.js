const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Run prisma db push with absolute env DATABASE_URL
const dbPaths = [
  "file:d:/인터그리비티/saju/dev.db",
  "file:d:/인터그리비티/saju/prisma/dev.db"
];

for (const dbUrl of dbPaths) {
  console.log(`Pushing schema to ${dbUrl}...`);
  try {
    const out = execSync(`cmd /c "set DATABASE_URL=${dbUrl} && npx prisma db push --accept-data-loss"`, {
      cwd: "d:\\인터그리비티\\saju",
      encoding: "utf8"
    });
    console.log(out);
  } catch (err) {
    console.error(`Push to ${dbUrl} error:`, err.stdout || err.message);
  }
}
