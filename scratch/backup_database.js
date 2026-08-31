const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function performBackup() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupDir = path.join(__dirname, '..', 'backups', `backup_${timestamp}`);
  
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }

  console.log(`Starting backup to directory: ${backupDir}`);

  // 1. Copy SQLite binary DB files
  const rootDb = path.join(__dirname, '..', 'dev.db');
  const prismaDb = path.join(__dirname, '..', 'prisma', 'dev.db');
  const envFile = path.join(__dirname, '..', '.env');

  if (fs.existsSync(rootDb)) {
    fs.copyFileSync(rootDb, path.join(backupDir, 'dev.db'));
    console.log('✔ Copied root dev.db');
  }

  if (fs.existsSync(prismaDb)) {
    fs.copyFileSync(prismaDb, path.join(backupDir, 'prisma_dev.db'));
    console.log('✔ Copied prisma/dev.db');
  }

  if (fs.existsSync(envFile)) {
    fs.copyFileSync(envFile, path.join(backupDir, '.env.backup'));
    console.log('✔ Copied .env');
  }

  // 2. Raw JSON Export for all tables
  const tables = ['User', 'Order', 'Product', 'Promotion', 'Inquiry', 'ReportTemplate', 'SystemSetting'];
  const dumpData = { timestamp: new Date().toISOString() };

  for (const table of tables) {
    try {
      const records = await prisma.$queryRawUnsafe(`SELECT * FROM "${table}"`);
      dumpData[table] = records;
      console.log(`✔ Dumped table ${table}: ${records.length} records`);
    } catch (err) {
      console.log(`- Table ${table} raw dump note: ${err.message}`);
    }
  }

  const dumpPath = path.join(backupDir, 'raw_db_dump.json');
  fs.writeFileSync(dumpPath, JSON.stringify(dumpData, null, 2), 'utf8');
  console.log(`✔ Saved raw JSON DB dump to: ${dumpPath}`);
  console.log(`🎉 Backup completed successfully in: ${backupDir}`);
}

performBackup()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
