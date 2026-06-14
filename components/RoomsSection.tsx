import React from 'react';
import { Users, Check } from 'lucide-react';
import { Rooms } from '../data/rooms';

export default function RoomsSection() {
  return (
    <section id="rooms" className="py-24 bg-stone-100 relative overflow-hidden">
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-100 rounded-full blur-3xl opacity-40 translate-y-1/2 -translate-x-1/4"></div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="mb-12 w-full">
           <h2 className="text-3xl md:text-4xl font-serif font-bold text-stone-800 mb-4">Szobáink és Áraink</h2>
           <p className="text-stone-600 text-lg mb-2">
             Összesen 15 férőhely, 4 különálló szobában, légkondicionálással.
           </p>
           <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-lg md:text-xl text-stone-700">
              <span className="font-bold text-emerald-900 flex items-center gap-2">
                <Check size={24} className="text-emerald-600" /> Egységes árazás:
              </span>
              <span><strong className="text-stone-900">7.500 Ft</strong> / személy / éjszaka</span>
              <span className="hidden md:inline text-stone-300">|</span>
              <span><strong className="text-stone-900">+ 500 Ft</strong> / személy / éjszaka IFA</span>
           </div>
        </div>

        <div className="grid md:grid-cols-4 sm:grid-cols-2 gap-6">
          {Rooms.map(room => (
            <div key={room.id} className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-500 group border border-stone-100/50">
              <div className="relative h-48 overflow-hidden">
                <img src={room.image} alt={room.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-60"></div>
                <div className="absolute bottom-3 left-3 text-white">
                   <span className="bg-emerald-600 px-2 py-1 rounded text-xs font-bold uppercase tracking-wider">Szoba</span>
                </div>
              </div>
              <div className="p-5">
                <h3 className="text-lg font-bold mb-3 font-serif text-stone-800">{room.name}</h3>
                <div className="flex items-center gap-2 text-sm text-stone-500 mb-4">
                  <Users size={16} className="text-emerald-600" /> <span>Kapacitás: <strong>{room.capacity} fő</strong></span>
                </div>
                <button onClick={() => { document.getElementById('booking')?.scrollIntoView({behavior: 'smooth'}); }} className="w-full text-center text-emerald-700 font-bold text-sm bg-emerald-50 py-2 rounded-lg hover:bg-emerald-100 transition-colors">
                  Lefoglalom
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
