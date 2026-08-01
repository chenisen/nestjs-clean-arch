import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

function getDatabaseUrl(): string {
  const databaseUrl = process.env['DATABASE_URL'];

  if (!databaseUrl) {
    throw new Error('DATABASE_URL environment variable is not defined');
  }

  return databaseUrl;
}

export function createPrismaAdapter(): PrismaPg {
  return new PrismaPg({ connectionString: getDatabaseUrl() });
}

export function createPrismaClient(): PrismaClient {
  return new PrismaClient({ adapter: createPrismaAdapter() });
}
