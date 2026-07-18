const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  console.log("=== Starting Backfill for Order UserNames ===");
  const orders = await prisma.order.findMany({
    where: {
      OR: [
        { userName: null },
        { userName: "" }
      ]
    },
    include: {
      user: true
    }
  });

  console.log(`Found ${orders.length} orders with empty or null userName.`);

  let updatedCount = 0;
  for (const order of orders) {
    if (order.user && order.user.name) {
      console.log(`Updating Order ID: ${order.id} with Name: ${order.user.name}`);
      await prisma.order.update({
        where: { id: order.id },
        data: { userName: order.user.name }
      });
      updatedCount++;
    }
  }

  console.log(`=== Backfill Completed. Updated ${updatedCount} orders. ===`);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
