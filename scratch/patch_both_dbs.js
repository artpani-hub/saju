const { PrismaClient } = require('@prisma/client');

async function patchDb(dbUrl) {
  console.log(`Patching database at ${dbUrl}...`);
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: dbUrl
      }
    }
  });

  const sqls = [
    'ALTER TABLE Product ADD COLUMN key TEXT',
    'ALTER TABLE Product ADD COLUMN category TEXT',
    'ALTER TABLE Product ADD COLUMN badge TEXT',
    'ALTER TABLE Product ADD COLUMN tag TEXT',
    'ALTER TABLE Product ADD COLUMN originalPrice INTEGER',
    'ALTER TABLE Product ADD COLUMN parentKey TEXT',
    'CREATE UNIQUE INDEX IF NOT EXISTS Product_key_key ON Product("key")'
  ];

  for (const sql of sqls) {
    try {
      await prisma.$executeRawUnsafe(sql);
      console.log(`[${dbUrl}] OK: ${sql}`);
    } catch (e) {
      console.log(`[${dbUrl}] Note: ${e.message}`);
    }
  }
  await prisma.$disconnect();
}

async function run() {
  await patchDb("file:d:/인터그리비티/saju/dev.db");
  await patchDb("file:d:/인터그리비티/saju/prisma/dev.db");
  await patchDb("file:./dev.db");
  await patchDb("file:./prisma/dev.db");
  console.log("ALL DATABASES PATCHED!");
}

run().catch(console.error);
