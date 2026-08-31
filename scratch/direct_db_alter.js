const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function alterProductTable() {
  console.log("Checking and patching Product table columns directly...");

  const cols = [
    "ALTER TABLE Product ADD COLUMN key TEXT",
    "ALTER TABLE Product ADD COLUMN category TEXT",
    "ALTER TABLE Product ADD COLUMN badge TEXT",
    "ALTER TABLE Product ADD COLUMN tag TEXT",
    "ALTER TABLE Product ADD COLUMN originalPrice INTEGER",
    "ALTER TABLE Product ADD COLUMN parentKey TEXT"
  ];

  for (const sql of cols) {
    try {
      await prisma.$executeRawUnsafe(sql);
      console.log("EXECUTED:", sql);
    } catch (e) {
      console.log("SKIPPED (already exists or error):", e.message);
    }
  }

  try {
    await prisma.$executeRawUnsafe(`CREATE UNIQUE INDEX IF NOT EXISTS Product_key_key ON Product("key")`);
    console.log("Created UNIQUE INDEX on Product.key");
  } catch (e) {
    console.log("Index note:", e.message);
  }

  console.log("PATCH COMPLETE!");
}

alterProductTable()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
