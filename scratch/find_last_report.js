process.env.DATABASE_URL = "file:d:/인터그리비티/saju/prisma/dev.db";
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany();
  console.log("Users count in prisma/dev.db:", users.length);
}

main()
  .catch(e => console.error("Prisma error:", e))
  .finally(() => prisma.$disconnect());
