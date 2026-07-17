import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis;

// Use Proxy for Lazy Initialization to prevent PrismaClient from being instantiated
// during Next.js build-time module evaluation when DATABASE_URL is missing.
export const db = new Proxy({}, {
  get(target, prop) {
    if (!globalForPrisma.prisma) {
      globalForPrisma.prisma = new PrismaClient();
    }
    return globalForPrisma.prisma[prop];
  }
});
