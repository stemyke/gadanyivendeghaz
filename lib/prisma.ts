import { PrismaClient } from '@prisma/client';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';

// Dinamikusan felépítjük a kapcsolódást a különálló környezeti változókból
const dbUser = process.env.DB_USER || '';
const dbPassword = process.env.DB_PASSWORD || '';
const dbHost = process.env.DB_HOST || 'localhost';
const dbName = process.env.DB_NAME || '';

const prismaClientSingleton = () => {
  const adapter = new PrismaMariaDb({
    host: dbHost,
    port: 3306,
    user: dbUser,
    password: dbPassword,
    database: dbName,
  });

  return new PrismaClient({ adapter });
};

declare global {
  var prismaGlobal: undefined | ReturnType<typeof prismaClientSingleton>;
}

const prisma = globalThis.prismaGlobal ?? prismaClientSingleton();

export default prisma;

if (process.env.NODE_ENV !== 'production') globalThis.prismaGlobal = prisma;
