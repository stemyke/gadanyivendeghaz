import React from 'react';

export default function GalleryAdmin() {
  return (
    <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm space-y-4 animate-fade-in">
      <h2 className="text-xl font-serif font-bold text-stone-800">Galéria szerkesztő</h2>
      <p className="text-stone-500 text-sm">Új képeket tölthet fel a galériába, vagy törölheti a meglévőket.</p>
      <div className="h-96 border-2 border-dashed border-stone-200 rounded-2xl flex items-center justify-center text-stone-400 text-sm bg-stone-50/50">
        A képfeltöltési felület hamarosan itt fog megjelenni.
      </div>
    </div>
  );
}
