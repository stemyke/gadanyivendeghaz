const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const outputFile = path.join(rootDir, 'deploy.zip');

const candidates = [
  '.next',
  'public',
  'prisma',
  'app.js',
  'next.config.ts',
  'package.json',
  'package-lock.json',
  '.env',
];

const existingFiles = candidates.filter((file) =>
  fs.existsSync(path.join(rootDir, file))
);

console.log('Csomagolandó fájlok és mappák:');
existingFiles.forEach((f) => console.log(` - ${f}`));

if (fs.existsSync(outputFile)) {
  fs.unlinkSync(outputFile);
}

try {
  // Kizárjuk a fejlesztői dev és cache mappákat a .next-ből, így drasztikusan kisebb lesz a zip
  execSync(`tar --exclude=".next/dev" --exclude=".next/cache" -a -c -f deploy.zip ${existingFiles.join(' ')}`, {
    cwd: rootDir,
    stdio: 'inherit',
  });
} catch {
  console.warn('A tar parancs nem sikerült, próbálkozás PowerShell Compress-Archive paranccsal...');
  const paths = existingFiles.map((f) => `'${f}'`).join(', ');
  execSync(`powershell -NoProfile -Command "Compress-Archive -Path ${paths} -DestinationPath 'deploy.zip' -Force"`, {
    cwd: rootDir,
    stdio: 'inherit',
  });
}

if (fs.existsSync(outputFile)) {
  const stats = fs.statSync(outputFile);
  const sizeMb = (stats.size / (1024 * 1024)).toFixed(2);
  console.log(`\nSikeres csomagolás! Elkészült: deploy.zip (${sizeMb} MB)`);
} else {
  console.error('\nNem sikerült létrehozni a deploy.zip fájlt.');
  process.exit(1);
}
