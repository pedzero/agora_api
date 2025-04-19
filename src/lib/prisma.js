import { PrismaClient } from '@prisma/client';
import { NODE_ENV } from '../config/env.js';

const globalForPrisma = globalThis;

const prisma = globalForPrisma.prisma || new PrismaClient();

if (NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export { prisma };
