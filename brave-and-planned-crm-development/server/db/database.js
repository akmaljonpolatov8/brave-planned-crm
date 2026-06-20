// This file now just re-exports prisma for backward compatibility
import prisma from '../lib/prisma.js';

export default prisma;
export { prisma };

// Legacy exports for files that still import these
export function getDatabase() {
  return prisma;
}

export function initializeDatabase() {
  console.log('✅ Database connected via Prisma + Neon PostgreSQL');
}

export function closeDatabase() {
  prisma.$disconnect();
}
