import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis;

const dbUrl = "file:d:/인터그리비티/saju/prisma/dev.db";

export const db = new Proxy({}, {
  get(target, prop) {
    if (!globalForPrisma.prisma) {
      globalForPrisma.prisma = new PrismaClient({
        datasources: {
          db: {
            url: dbUrl
          }
        }
      });
    }
    return globalForPrisma.prisma[prop];
  }
});
