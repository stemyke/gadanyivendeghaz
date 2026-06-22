const { execSync } = require('child_process');
const path = require('path');

function loadEnv() {
  require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
}

function runSync() {
  loadEnv();

  const dbUser = process.env.DB_USER || '';
  const dbPassword = process.env.DB_PASSWORD || '';
  const dbHost = process.env.DB_HOST || 'localhost';
  const dbName = process.env.DB_NAME || '';

  if (!dbUser || !dbName) {
    console.warn('Database credentials not fully configured in environment. Skipping sync.');
    return;
  }

  const databaseUrl = `mysql://${dbUser}:${dbPassword}@${dbHost}:3306/${dbName}`;

  try {
    console.log('Synchronizing database schema via Prisma...');
    execSync('npx prisma db push', {
      env: {
        ...process.env,
        DATABASE_URL: databaseUrl,
      },
      stdio: 'inherit',
    });
    console.log('Generating Prisma Client...');
    execSync('npx prisma generate', {
      env: {
        ...process.env,
        DATABASE_URL: databaseUrl,
      },
      stdio: 'inherit',
    });
    console.log('Database synchronization and client generation completed successfully.');
  } catch (error) {
    console.error('Error during database synchronization:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  runSync();
}

module.exports = { runSync };
