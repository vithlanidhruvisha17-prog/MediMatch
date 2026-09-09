import { PrismaClient } from '@prisma/client';
import { ENV } from '../config/env';

let prisma: PrismaClient | null = null;
let isPrismaAvailable = false;

try {
  prisma = new PrismaClient({
    datasources: {
      db: {
        url: ENV.DATABASE_URL
      }
    },
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error']
  });
} catch (err) {
  console.warn('Prisma client not initialized. Falling back to memory repository.');
}

export async function checkPrismaConnection(): Promise<boolean> {
  if (!prisma) return false;
  try {
    // Quick test query
    await prisma.$queryRaw`SELECT 1`;
    isPrismaAvailable = true;
    return true;
  } catch (err) {
    isPrismaAvailable = false;
    return false;
  }
}

export { prisma, isPrismaAvailable };

