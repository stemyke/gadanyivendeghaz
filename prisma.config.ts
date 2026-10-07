import { defineConfig } from "@prisma/config";

const dbUser = process.env.DB_USER || '';
const dbPassword = process.env.DB_PASSWORD || '';
const dbHost = process.env.DB_HOST || 'localhost';
const dbName = process.env.DB_NAME || '';
const computedUrl = dbUser && dbName ? `mysql://${dbUser}:${dbPassword}@${dbHost}:3306/${dbName}` : '';

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: process.env.DATABASE_URL || computedUrl,
  },
});
