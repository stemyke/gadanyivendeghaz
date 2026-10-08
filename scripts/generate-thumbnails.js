const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const galleryDir = path.resolve(__dirname, '../public/images/gallery');
const thumbsDir = path.join(galleryDir, 'thumbs');

const THUMB_SIZE = 300;
const THUMB_QUALITY = 80;
const force = process.argv.includes('--force');

async function generateThumbnails() {
  if (!fs.existsSync(galleryDir)) {
    console.error(`Gallery directory not found: ${galleryDir}`);
    process.exit(1);
  }

  if (!fs.existsSync(thumbsDir)) {
    fs.mkdirSync(thumbsDir, { recursive: true });
  }

  const entries = fs.readdirSync(galleryDir);
  const imageFiles = entries.filter((file) => {
    const fullPath = path.join(galleryDir, file);
    return (
      fs.statSync(fullPath).isFile() &&
      /\.(jpg|jpeg|png|webp|avif)$/i.test(file)
    );
  });

  console.log(`Found ${imageFiles.length} gallery images to process. Target size: ${THUMB_SIZE}x${THUMB_SIZE}px.`);

  let createdCount = 0;
  let skippedCount = 0;

  for (let i = 0; i < imageFiles.length; i++) {
    const file = imageFiles[i];
    const srcPath = path.join(galleryDir, file);
    const baseName = path.basename(file, path.extname(file));
    const destPath = path.join(thumbsDir, `${baseName}.webp`);

    const srcStat = fs.statSync(srcPath);

    // Skip if thumbnail exists, matches size, and is newer than source
    if (!force && fs.existsSync(destPath)) {
      const destStat = fs.statSync(destPath);
      if (destStat.mtimeMs >= srcStat.mtimeMs) {
        try {
          const fileBuffer = fs.readFileSync(destPath);
          const meta = await sharp(fileBuffer).metadata();
          if (meta.width === THUMB_SIZE && meta.height === THUMB_SIZE) {
            skippedCount++;
            continue;
          }
        } catch {
          // If metadata read fails, re-generate
        }
      }
    }

    try {
      const buffer = await sharp(srcPath)
        .rotate() // Auto-orient based on EXIF
        .resize(THUMB_SIZE, THUMB_SIZE, {
          fit: 'cover',
          position: 'center',
        })
        .webp({ quality: THUMB_QUALITY })
        .toBuffer();

      fs.writeFileSync(destPath, buffer);

      const destSizeKb = (buffer.length / 1024).toFixed(1);
      console.log(`[${i + 1}/${imageFiles.length}] Generated: ${baseName}.webp (${destSizeKb} KB)`);
      createdCount++;
    } catch (err) {
      console.error(`Failed to generate thumbnail for ${file}:`, err.message);
    }
  }

  // Clean up orphan thumbnails whose source image was deleted
  const thumbFiles = fs.readdirSync(thumbsDir);
  const sourceBaseNames = new Set(
    imageFiles.map((file) => path.basename(file, path.extname(file)))
  );

  for (const thumbFile of thumbFiles) {
    const thumbBase = path.basename(thumbFile, path.extname(thumbFile));
    if (!sourceBaseNames.has(thumbBase)) {
      fs.unlinkSync(path.join(thumbsDir, thumbFile));
      console.log(`Cleaned up orphaned thumbnail: ${thumbFile}`);
    }
  }

  console.log(
    `\nDone! Created/Updated: ${createdCount}, Already up-to-date: ${skippedCount}, Total in thumbs: ${imageFiles.length}`
  );
}

generateThumbnails().catch((err) => {
  console.error('Fatal error generating thumbnails:', err);
  process.exit(1);
});
