import { PrismaClient } from '@prisma/client';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';

const prismaClientSingleton = () => {
  const dbUser = process.env.DB_USER || '';
  const dbPassword = process.env.DB_PASSWORD || '';
  const dbHost = process.env.DB_HOST || '127.0.0.1';
  const dbName = process.env.DB_NAME || '';

  if (!dbUser || !dbName) {
    console.error(`[PRISMA CONFIG ERROR] Missing credentials: DB_USER='${dbUser}', DB_HOST='${dbHost}', DB_NAME='${dbName}'`);
  }

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
