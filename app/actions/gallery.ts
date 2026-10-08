'use server';

import fs from 'fs';
import path from 'path';

export interface GalleryImageItem {
  src: string;
  thumb: string;
}

export async function getGalleryImages(): Promise<GalleryImageItem[]> {
  const galleryDir = path.join(process.cwd(), 'public', 'images', 'gallery');
  const thumbsDir = path.join(galleryDir, 'thumbs');
  
  try {
    if (!fs.existsSync(galleryDir)) {
      return [];
    }

    const files = fs.readdirSync(galleryDir);
    
    // Csak a valódi fájlokat és a képformátumokat engedjük át (almappákat, mint a thumbs, kizárjuk)
    const imageFiles = files.filter(file => {
      const fullPath = path.join(galleryDir, file);
      try {
        return fs.statSync(fullPath).isFile() && /\.(jpg|jpeg|png|webp|avif|gif)$/i.test(file);
      } catch {
        return false;
      }
    });

    return imageFiles.map(file => {
      const ext = path.extname(file);
      const baseName = path.basename(file, ext);
      const thumbFile = `${baseName}.webp`;
      const hasThumb = fs.existsSync(path.join(thumbsDir, thumbFile));

      return {
        src: `/images/gallery/${file}`,
        thumb: hasThumb ? `/images/gallery/thumbs/${thumbFile}` : `/images/gallery/${file}`,
      };
    });
  } catch (error) {
    console.error('Hiba a galéria képeinek beolvasásakor:', error);
    return [];
  }
}
