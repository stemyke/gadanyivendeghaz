const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const outputFile = path.join(rootDir, 'deploy.zip');

const candidates = [
  '.next',
  'public',
  'prisma',
  'prisma.config.ts',
  'app.js',
  'next.config.ts',
  'package.json',
  'package-lock.json',
];

const existingFiles = candidates.filter((file) =>
  fs.existsSync(path.join(rootDir, file))
);

console.log('Files and directories to package:');
existingFiles.forEach((f) => console.log(` - ${f}`));

if (fs.existsSync(outputFile)) {
  fs.unlinkSync(outputFile);
}

try {
  // Exclude dev and cache folders from .next to drastically reduce zip size
  execSync(`tar --exclude=".next/dev" --exclude=".next/cache" -a -c -f deploy.zip ${existingFiles.join(' ')}`, {
    cwd: rootDir,
    stdio: 'inherit',
  });
} catch {
  console.warn('tar command failed, falling back to PowerShell Compress-Archive...');
  const paths = existingFiles.map((f) => `'${f}'`).join(', ');
  execSync(`powershell -NoProfile -Command "Compress-Archive -Path ${paths} -DestinationPath 'deploy.zip' -Force"`, {
    cwd: rootDir,
    stdio: 'inherit',
  });
}

if (fs.existsSync(outputFile)) {
  const stats = fs.statSync(outputFile);
  const sizeMb = (stats.size / (1024 * 1024)).toFixed(2);
  console.log(`\nSuccessfully packaged! Created: deploy.zip (${sizeMb} MB)`);
} else {
  console.error('\nFailed to create deploy.zip.');
  process.exit(1);
}
