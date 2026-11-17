import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const globalForPrisma = globalThis;

function getDatabaseUrl() {
  const realDbPath = path.resolve(process.cwd(), 'prisma', 'dev_real.db');
  if (process.platform !== 'win32' && fs.existsSync(realDbPath)) {
    return `file:${realDbPath.replace(/\\/g, '/')}`;
  }

  const envUrl = process.env.DATABASE_URL;
  // If envUrl starts with Windows drive letter on non-Windows (Docker Linux), do not use it
  if (envUrl && !(process.platform !== 'win32' && /^[a-zA-Z]:/i.test(envUrl.replace(/^file:/i, '')))) {
    return envUrl;
  }
  const dbPath = (fs.existsSync(realDbPath) ? realDbPath : path.resolve(process.cwd(), 'prisma', 'dev.db')).replace(/\\/g, '/');
  return `file:${dbPath}`;
}

const dbUrl = getDatabaseUrl();

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

