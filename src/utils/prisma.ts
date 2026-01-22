import { PrismaClient } from '../generated/prisma/client.js';
import { PrismaNeon } from '@prisma/adapter-neon';
import { config } from '../config/index.js';

export let prisma: PrismaClient;

export const initPrisma = () => {
  if (prisma) return;

  console.log('[Prisma] Initializing client...');

  const adapter = new PrismaNeon({
    connectionString: config.db.url,
  });
  
  prisma = new PrismaClient({
    adapter,
    log: config.env === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });
};
