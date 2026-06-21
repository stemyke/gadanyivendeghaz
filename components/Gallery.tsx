'use client';

import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import Lightbox from 'yet-another-react-lightbox';
import 'yet-another-react-lightbox/styles.css';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface GalleryProps {
  images: string[];
}

export default function Gallery({ images }: GalleryProps) {
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);
  const [page, setPage] = useState(0);
  const [columns, setColumns] = useState(4);
  const [loadedImages, setLoadedImages] = useState<Record<string, boolean>>({});

  React.useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) setColumns(2);
      else if (window.innerWidth < 1024) setColumns(3);
      else setColumns(4);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // ÚJ LOGIKA: Az egy oldalon lévő képek száma mindig az oszlopok számának kétszerese.
  const imagesPerPage = useMemo(() => columns * 2, [columns]);

  const totalPages = Math.ceil(images.length / imagesPerPage);

  const displayedImages = useMemo(() => {
    const start = page * imagesPerPage;
    const end = start + imagesPerPage;
    return images.slice(start, end);
  }, [images, page, imagesPerPage]);

  // ÚJ LOGIKA: Kiszámoljuk, hány helykitöltőre van szükség az utolsó oldalon.
  const isLastPage = page === totalPages - 1;
  const placeholdersNeeded = isLastPage ? imagesPerPage - displayedImages.length : 0;

  const handleNextPage = () => {
    if (page < totalPages - 1) setPage(page + 1);
  };

  const handlePrevPage = () => {
    if (page > 0) setPage(page - 1);
  };

  if (images.length === 0) {
    return null; 
  }

  return (
    <section id="gallery" className="py-24 bg-white relative">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-stone-800 mb-4">Galéria</h2>
          <p className="text-stone-600 max-w-xl mx-auto">Pillanatképek a vendégház életéből és a környék szépségeiről.</p>
        </div>

        <div className="relative">
            {totalPages > 1 && (
                <>
                    <button 
                        onClick={handlePrevPage}
                        disabled={page === 0}
                        className={`absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 md:-translate-x-8 z-10 w-12 h-12 flex items-center justify-center bg-white border border-stone-200 rounded-full shadow-lg transition-all ${page === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-emerald-50 hover:text-emerald-700 text-stone-600'}`}
                    >
                        <ChevronLeft size={24} />
                    </button>
                    <button 
                        onClick={handleNextPage}
                        disabled={page === totalPages - 1}
                        className={`absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 md:translate-x-8 z-10 w-12 h-12 flex items-center justify-center bg-white border border-stone-200 rounded-full shadow-lg transition-all ${page === totalPages - 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-emerald-50 hover:text-emerald-700 text-stone-600'}`}
                    >
                        <ChevronRight size={24} />
                    </button>
                </>
            )}

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {displayedImages.map((src, i) => (
                  <div
                    key={src}
                    className="relative aspect-square cursor-pointer overflow-hidden rounded-lg group animate-fade-in bg-stone-50 border border-dashed border-stone-200"
                    onClick={() => {
                        const globalIndex = (page * imagesPerPage) + i;
                        setIndex(globalIndex);
                        setOpen(true);
                    }}
                  >
                    <Image
                        src={src}
                        alt={`Galéria kép`}
                        fill
                        sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                        onLoad={() => {
                            setLoadedImages(prev => ({ ...prev, [src]: true }));
                        }}
                    />
                    {!loadedImages[src] && (
                        <div className="absolute inset-0 flex items-center justify-center bg-stone-50">
                            <div className="flex items-end justify-center gap-1.5 h-6">
                                <div className="w-1.5 h-6 bg-emerald-600 rounded-full origin-bottom animate-loading-bar-1" />
                                <div className="w-1.5 h-6 bg-emerald-600 rounded-full origin-bottom animate-loading-bar-2" />
                                <div className="w-1.5 h-6 bg-emerald-600 rounded-full origin-bottom animate-loading-bar-3" />
                            </div>
                        </div>
                    )}
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                        <span className="text-white font-medium tracking-wider opacity-0 group-hover:opacity-100 transition-opacity duration-500 transform translate-y-4 group-hover:translate-y-0">Nagyítás</span>
                    </div>
                  </div>
              ))}
              {/* ÚJ: Helykitöltő elemek renderelése */}
              {placeholdersNeeded > 0 && Array.from({ length: placeholdersNeeded }).map((_, i) => (
                <div key={`placeholder-${i}`} className="aspect-square rounded-lg bg-stone-50 border border-dashed border-stone-200 pointer-events-none"></div>
              ))}
            </div>
            
            {totalPages > 1 && (
                <div className="mt-8 flex justify-center gap-2">
                    {Array.from({ length: totalPages }).map((_, i) => (
                        <button 
                            key={i}
                            onClick={() => setPage(i)}
                            className={`w-2.5 h-2.5 rounded-full transition-all ${i === page ? 'bg-emerald-600 w-8' : 'bg-stone-300 hover:bg-stone-400'}`}
                        />
                    ))}
                </div>
            )}
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
