'use server';

import fs from 'fs';
import path from 'path';

export async function getGalleryImages() {
  const galleryDir = path.join(process.cwd(), 'public', 'images', 'gallery');
  
  try {
    if (!fs.existsSync(galleryDir)) {
      return [];
    }

    const files = fs.readdirSync(galleryDir);
    
    // Csak a képformátumokat engedjük át
    const imageFiles = files.filter(file => 
      /\.(jpg|jpeg|png|webp|avif|gif)$/i.test(file)
    );

    // Visszaadjuk a publikus URL elérhetőségeket
    return imageFiles.map(file => `/images/gallery/${file}`);
  } catch (error) {
    console.error('Hiba a galéria képeinek beolvasásakor:', error);
    return [];
  }
}
