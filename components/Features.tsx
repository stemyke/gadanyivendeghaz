import React from 'react';
import { Tent, Footprints, Fish, Trees, Wifi, Car, Coffee, Snowflake } from 'lucide-react';

const features = [
  { icon: <Tent />, title: "8 Hektáros Birtok", desc: "Hatalmas zöldterület erdővel, réttel" },
  { icon: <Footprints />, title: "Lovak és Alpakkák", desc: "Ismerkedjen meg barátságos lovainkkal és alpakkáinkkal a birtokon" },
  { icon: <Fish />, title: "Horgászat", desc: "Szomszédban napijegyes halastavak" },
  { icon: <Trees />, title: "Erdei Környezet", desc: "Túrázás a Mecsek vadregényes tájain" },
  { icon: <Wifi />, title: "Ingyenes Wifi", desc: "Ha mégis kapcsolódna a világhoz" },
  { icon: <Car />, title: "Kamerázott Parkoló", desc: "Parkolás az udvar előtt, kamerával megfigyelt területen" },
  { icon: <Coffee />, title: "Bográcsozás", desc: "Kerti sütögetés, tárcsán sütés" },
  { icon: <Snowflake />, title: "Klíma (Opcionális)", desc: "1.500 Ft/nap felár ellenében igényelhető" }
];

export default function Features() {
  return (
    <section id="services" className="py-24 bg-white relative">
      <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-50 rounded-full blur-3xl opacity-60 -translate-y-1/2 translate-x-1/2"></div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center mb-16">
          <span className="text-emerald-600 font-bold tracking-wider uppercase text-xs mb-2 block">Miért válasszon minket?</span>
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-stone-800 mb-4">Vidéki Idill a Mecsek Szívében</h2>
          <p className="text-stone-500 max-w-xl mx-auto">Családias hangulat, aktív kikapcsolódás és a természet közelsége egy helyen.</p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {features.map((item, i) => (
            <div key={i} className="p-6 bg-stone-50 rounded-2xl hover:bg-emerald-50 transition-all duration-300 group cursor-default border border-stone-100 hover:shadow-lg hover:-translate-y-1">
              <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-emerald-700 mb-4 shadow-sm group-hover:scale-110 transition-transform duration-500">
                {item.icon}
              </div>
              <h3 className="font-bold text-lg mb-2 text-stone-800">{item.title}</h3>
              <p className="text-sm text-stone-500 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
