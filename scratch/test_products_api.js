const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testProductsDb() {
  console.log("Checking DB products...");
  const products = await prisma.product.findMany({
    orderBy: { displayOrder: "asc" }
  });
  console.log(`Found ${products.length} products in DB:`);
  products.forEach(p => {
    console.log(`- [${p.key}] ${p.name}: ${p.price}원 (원가: ${p.originalPrice || '없음'}, 무료여부: ${p.price === 0 ? '무료!' : '유료'})`);
  });
}

testProductsDb()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
