const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  console.log("=== Diagnosing Database ===");
  const users = await prisma.user.findMany({
    include: {
      orders: true
    }
  });

  for (const u of users) {
    console.log(`User: ${u.name} (Phone: ${u.phone}) has ${u.orders.length} orders:`);
    for (const o of u.orders) {
      console.log(`  - Order ID: ${o.id}, userName: "${o.userName}", amount: ${o.amount}, status: ${o.status}`);
    }
  }
}

main().finally(() => prisma.$disconnect());
