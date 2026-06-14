import React, { useState } from 'react';
import { Check, ArrowRight } from 'lucide-react';
import Calendar from './Calendar'; // Feltételezve, hogy a Calendar komponens külön fájlban van

export default function BookingSection() {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [guests, setGuests] = useState(2);
  const [bookingStep, setBookingStep] = useState(1);

  const handleDateSelect = (date: Date) => {
    if (!selectedDate || (selectedDate && endDate)) {
      setSelectedDate(date);
      setEndDate(null);
    } else if (date > selectedDate) {
      setEndDate(date);
    } else {
      setSelectedDate(date);
    }
  };

  const nights = selectedDate && endDate ? Math.round((endDate.getTime() - selectedDate.getTime()) / (1000 * 60 * 60 * 24)) : 0;
  const accommodationFee = nights * guests * 7500;
  const ifa = nights * guests * 500;
  const total = accommodationFee + ifa;

  return (
    <section id="booking" className="py-24 bg-white relative overflow-hidden">
      <div className="absolute inset-0">
         <img src="https://i.szalas.hu/hotels/742565/original/20802920.webp" className="w-full h-full object-cover opacity-10 blur-sm scale-110" alt="" />
         <div className="absolute inset-0 bg-white/60"></div>
      </div>
      
      <div className="max-w-6xl mx-auto px-6 relative z-10">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          
          <div>
            <span className="text-emerald-600 font-bold tracking-wider uppercase text-sm">Kapcsolatfelvétel</span>
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-stone-900 mt-3 mb-6">Várjuk szeretettel Komlón!</h2>
            <p className="text-stone-600 mb-8 text-lg leading-relaxed font-medium">
              Kérjen ajánlatot közvetlenül tőlünk! Garantáljuk a legjobb árat és a személyes odafigyelést. 
              Csoportoknak és vadászoknak egyedi ajánlatot biztosítunk.
            </p>
            
            <div className="space-y-6">
              <div className="flex items-start gap-4 p-4 bg-white/80 backdrop-blur rounded-xl border border-stone-100 shadow-sm">
                <div className="p-3 bg-emerald-100 rounded-full text-emerald-700 shadow-sm"><Check size={20} /></div>
                <div>
                  <h4 className="font-bold text-stone-800">NTAK Regisztrált</h4>
                  <p className="text-sm text-stone-500">Hivatalos szálláshely: MA19005093</p>
                </div>
              </div>
              <div className="flex items-start gap-4 p-4 bg-white/80 backdrop-blur rounded-xl border border-stone-100 shadow-sm">
                <div className="p-3 bg-emerald-100 rounded-full text-emerald-700 shadow-sm"><Check size={20} /></div>
                <div>
                  <h4 className="font-bold text-stone-800">Fizetés a helyszínen</h4>
                  <p className="text-sm text-stone-500">Csak készpénzt vagy helyszíni azonnali utalást fogadunk el.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl shadow-2xl p-8 border border-stone-100 relative">
            {bookingStep === 1 && (
              <div className="animate-fade-in">
                <h3 className="text-xl font-bold mb-4 text-stone-800">Mikor érkezne?</h3>
                <Calendar 
                  selectedDate={selectedDate}
                  endDate={endDate}
                  onDateClick={handleDateSelect}
                />
                <div className="mt-6 pt-4 border-t border-stone-100">
                    <div className="flex justify-between items-center">
                        <div className="text-sm text-stone-500">
                        {selectedDate ? (
                            <span>
                            {selectedDate.toLocaleDateString('hu-HU')} 
                            {endDate ? ` - ${endDate.toLocaleDateString('hu-HU')}` : ''}
                            </span>
                        ) : 'Válasszon időpontot'}
                        </div>
                        {selectedDate && endDate && (
                        <button 
                            onClick={() => setBookingStep(2)}
                            className="bg-emerald-900 text-white px-4 py-2 rounded-lg text-sm hover:bg-emerald-950 transition-colors flex items-center gap-2"
                        >
                            Tovább <ArrowRight size={14} />
                        </button>
                        )}
                    </div>
                </div>
              </div>
            )}

            {bookingStep === 2 && (
              <div className="animate-fade-in">
                <button onClick={() => setBookingStep(1)} className="text-sm text-stone-400 hover:text-stone-800 mb-4 flex items-center gap-1">← Vissza a naptárhoz</button>
                <h3 className="text-2xl font-serif font-bold mb-6 text-emerald-900">Ajánlatkérés</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-stone-600 mb-1">Vendégek száma</label>
                    <div className="flex items-center gap-4 bg-stone-50 p-3 rounded-xl border border-stone-200">
                      <button onClick={() => setGuests(Math.max(1, guests - 1))} className="w-8 h-8 rounded-full bg-white shadow flex items-center justify-center text-emerald-700 hover:bg-emerald-50">-</button>
                      <span className="font-bold w-6 text-center">{guests}</span>
                      <button onClick={() => setGuests(Math.min(15, guests + 1))} className="w-8 h-8 rounded-full bg-white shadow flex items-center justify-center text-emerald-700 hover:bg-emerald-50">+</button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-stone-600 mb-1">Vezetéknév</label>
                      <input type="text" className="w-full p-3 bg-stone-50 rounded-xl border border-stone-200 focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100 transition outline-none" placeholder="Kovács" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-stone-600 mb-1">Keresztnév</label>
                      <input type="text" className="w-full p-3 bg-stone-50 rounded-xl border border-stone-200 focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100 transition outline-none" placeholder="Anna" />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-stone-600 mb-1">Email cím</label>
                    <input type="email" className="w-full p-3 bg-stone-50 rounded-xl border border-stone-200 focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100 transition outline-none" placeholder="anna@example.com" />
                  </div>

                  <div className="bg-emerald-50 p-5 rounded-xl mt-4 border border-emerald-100">
                    <h4 className="font-bold text-emerald-900 mb-3 border-b border-emerald-200 pb-2">Kalkulált ár</h4>
                    
                    <div className="flex justify-between text-sm mb-2 text-stone-600">
                      <span>Időtartam:</span>
                      <span className="font-bold text-emerald-900">{nights} éjszaka</span>
                    </div>
                    
                    <div className="flex justify-between text-sm mb-2 text-stone-600">
                      <span>Vendégek száma:</span>
                      <span className="font-bold text-emerald-900">{guests} fő</span>
                    </div>

                    <div className="flex justify-between text-sm mb-2 text-stone-600">
                      <span>Szállásdíj (7.500 Ft/fő/éj):</span>
                      <span className="font-bold text-emerald-900">{accommodationFee.toLocaleString()} Ft</span>
                    </div>

                    <div className="flex justify-between text-sm mb-4 text-stone-600 border-b border-emerald-200 pb-3">
                      <span>IFA (500 Ft/fő/éj):</span>
                      <span className="font-bold text-emerald-900">{ifa.toLocaleString()} Ft</span>
                    </div>

                    <div className="flex justify-between text-lg font-bold text-emerald-900">
                      <span>Összesen:</span>
                      <span>{total.toLocaleString()} Ft</span>
                    </div>
                  </div>

                  <button 
                    onClick={() => setBookingStep(3)}
                    className="w-full bg-stone-900 text-white py-4 rounded-xl font-bold text-lg hover:bg-emerald-800 transition-all mt-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                  >
                    Ajánlatkérés elküldése
                  </button>
                </div>
              </div>
            )}

            {bookingStep === 3 && (
              <div className="text-center py-10 animate-fade-in">
                <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6 text-emerald-600 shadow-inner">
                  <Check size={48} />
                </div>
                <h3 className="text-2xl font-serif font-bold mb-2 text-emerald-900">Köszönjük megkeresését!</h3>
                <p className="text-stone-500 mb-8 max-w-xs mx-auto">Hamarosan felvesszük Önnel a kapcsolatot a megadott elérhetőségeken.</p>
                <button 
                  onClick={() => {setBookingStep(1); setSelectedDate(null); setEndDate(null);}}
                  className="text-emerald-700 font-bold hover:text-emerald-900 hover:underline transition-all"
                >
                  Új ajánlatkérés indítása
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
