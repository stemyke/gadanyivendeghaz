'use client';

import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import Lightbox from 'yet-another-react-lightbox';
import 'yet-another-react-lightbox/styles.css';

interface GalleryProps {
  images: string[];
  maxImages?: number;
}

// Segédfüggvény a legnagyobb közös osztóhoz (a rács optimalizálásához)
const gcd = (a: number, b: number): number => b === 0 ? a : gcd(b, a % b);

export default function Gallery({ images, maxImages = 12 }: GalleryProps) {
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);

  // A rács logikája:
  // A képek számát úgy korlátozzuk, hogy az oszlopok számával osztható legyen.
  // Így sosem lesz "csonka" sor.
  const columns = useMemo(() => {
    // Kisebb képernyőn 2, közepesen 3, nagyobbakon 4 oszlop
    if (typeof window !== 'undefined') {
      if (window.innerWidth < 768) return 2;
      if (window.innerWidth < 1024) return 3;
    }
    return 4;
  }, []);

  const displayedImages = useMemo(() => {
    const totalImages = images.length;
    const limit = Math.min(totalImages, maxImages);
    
    // A megjelenített képek számát a legközelebbi, oszlopokkal osztható számra kerekítjük lefelé.
    const displayCount = Math.floor(limit / columns) * columns;
    
    return images.slice(0, displayCount);
  }, [images, maxImages, columns]);

  if (displayedImages.length === 0) {
    return null; // Ne jelenítsünk meg semmit, ha nincs elég kép a teljes sorhoz
  }

  return (
    <section id="gallery" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-stone-800 mb-4">Galéria</h2>
          <p className="text-stone-600 max-w-xl mx-auto">Pillanatképek a vendégház életéből és a környék szépségeiről.</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {displayedImages.map((src, i) => (
            <div
              key={i}
              className="relative aspect-square cursor-pointer overflow-hidden rounded-lg group"
              onClick={() => {
                setIndex(i);
                setOpen(true);
              }}
            >
              <Image
                src={src}
                alt={`Galéria kép ${i + 1}`}
                fill
                sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                className="object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>
          ))}
        </div>
      </div>

      <Lightbox
        open={open}
        close={() => setOpen(false)}
        index={index}
        slides={images.map(src => ({ src }))}
        styles={{ container: { backgroundColor: "rgba(0, 0, 0, .9)" } }}
      />
    </section>
  );
}
