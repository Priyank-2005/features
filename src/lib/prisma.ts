import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma_v3: PrismaClient | undefined;
};

// Next.js caches the global variable. Use prisma_v3 to force instantiation of the newly generated Prisma 6 client.
export const prisma = globalForPrisma.prisma_v3 ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma_v3 = prisma;
