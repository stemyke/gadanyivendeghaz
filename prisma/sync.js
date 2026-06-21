const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

function loadEnv() {
  const envPath = path.resolve(__dirname, '../.env');
  if (fs.existsSync(envPath)) {
    const envConfig = fs.readFileSync(envPath, 'utf-8');
    envConfig.split(/\r?\n/).forEach(line => {
      // Ignore comments and empty lines
      if (line.trim().startsWith('#') || !line.trim()) return;
      const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
      if (match) {
        const key = match[1];
        let value = match[2] || '';
        // remove quotes if present
        if (value.startsWith('"') && value.endsWith('"')) {
          value = value.slice(1, -1);
        } else if (value.startsWith("'") && value.endsWith("'")) {
          value = value.slice(1, -1);
        }
        if (!process.env[key]) {
          process.env[key] = value.trim();
        }
      }
    });
  }
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
