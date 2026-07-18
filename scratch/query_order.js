const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  console.log("Fetching recent orders...");
  const orders = await prisma.order.findMany({
    orderBy: {
      createdAt: 'desc'
    },
    take: 10,
    include: {
      user: true
    }
  });

  console.log("Found orders count:", orders.length);
  for (const order of orders) {
    console.log("-----------------------------------------");
    console.log("Order ID (id):", order.id);
    console.log("ApplicationNum:", order.applicationNum);
    console.log("Amount:", order.amount);
    console.log("Status:", order.status);
    console.log("CreatedAt (UTC JS Date):", order.createdAt.toISOString());
    console.log("CreatedAt raw:", order.createdAt);
    if (order.user) {
      console.log("User Name:", order.user.name);
      console.log("User Phone:", order.user.phone);
      console.log("User CreatedAt:", order.user.createdAt.toISOString());
    }
  }
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
