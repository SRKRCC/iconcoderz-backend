import { PrismaClient } from '../generated/prisma/client.js';
import { config } from '../config/index.js';

export let prisma: PrismaClient;

export const initPrisma = () => {
  if (prisma) return;

  console.log('[Prisma] Initializing client...');

  process.env.DATABASE_URL = config.db.url;
  
  prisma = new PrismaClient({
    log: config.env === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });
};
