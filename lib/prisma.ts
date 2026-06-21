import { PrismaClient } from '@prisma/client';

// Dinamikusan felépítjük a kapcsolódási URL-t a különálló környezeti változókból
const dbUser = process.env.DB_USER || '';
const dbPassword = process.env.DB_PASSWORD || '';
const dbHost = process.env.DB_HOST || 'localhost';
const dbName = process.env.DB_NAME || '';

const databaseUrl = `mysql://${dbUser}:${dbPassword}@${dbHost}:3306/${dbName}`;

const prismaClientSingleton = () => {
  return new PrismaClient({
    datasources: {
      db: {
        url: databaseUrl,
      },
    },
  });
};

declare global {
  var prismaGlobal: undefined | ReturnType<typeof prismaClientSingleton>;
}

const prisma = globalThis.prismaGlobal ?? prismaClientSingleton();

export default prisma;

if (process.env.NODE_ENV !== 'production') globalThis.prismaGlobal = prisma;
