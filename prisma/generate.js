const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

function findSchemaPath() {
  const possiblePaths = [
    path.resolve(__dirname, 'schema.prisma'),
    path.resolve(__dirname, '../prisma/schema.prisma'),
    path.resolve(process.cwd(), 'prisma/schema.prisma'),
    path.resolve(process.cwd(), '../../../../app/prisma/schema.prisma'),
  ];

  return possiblePaths.find((p) => fs.existsSync(p));
}

function runGenerate() {
  const schemaPath = findSchemaPath();

  if (!schemaPath) {
    console.warn('Prisma schema not found. Skipping client generation.');
    return;
  }

  console.log(`Generating Prisma Client using schema: ${schemaPath}...`);

  try {
    execSync(`npx prisma generate --schema="${schemaPath}"`, {
      stdio: 'inherit',
    });
    console.log('Prisma Client generated successfully.');
  } catch (error) {
    console.error('Error during Prisma Client generation:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  runGenerate();
}

module.exports = { runGenerate };
