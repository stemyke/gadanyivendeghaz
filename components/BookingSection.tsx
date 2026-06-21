'use client';

import React, { useState, useTransition } from 'react';
import Image from 'next/image';
import { Check, ArrowRight, Loader, AlertTriangle, ShieldCheck } from 'lucide-react';
import Calendar from './Calendar';
import { createBooking, getBookedDates } from '../app/actions/bookings';
import { Rooms } from '../data/rooms';

export default function BookingSection({ tolerance = 0 }: { tolerance?: number }) {
  // Room, date, and guest states
  const [selectedRoomId, setSelectedRoomId] = useState<number | null>(null);
  const [occupiedDates, setOccupiedDates] = useState<{ startDate: string; endDate: string }[]>([]);
  const [loadingDates, setLoadingDates] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [guests, setGuests] = useState(2);

  // Form input states
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');

  // UI states
  const [bookingStep, setBookingStep] = useState(1);
  const [isPending, startTransition] = useTransition();
  const [submissionStatus, setSubmissionStatus] = useState<'success' | 'error' | null>(null);

  const handleRoomSelect = async (roomId: number) => {
    setSelectedRoomId(roomId);
    const room = Rooms.find(r => r.id === roomId);
    if (room && guests > room.capacity) {
      setGuests(room.capacity);
    }
    
    setLoadingDates(true);
    try {
      const dates = await getBookedDates(roomId);
      setOccupiedDates(dates);
      setBookingStep(2);
    } catch (error) {
      console.error('Failed to load room dates:', error);
      alert('Hiba történt a szoba foglalt dátumainak betöltésekor. Kérjük, próbálja újra!');
    } finally {
      setLoadingDates(false);
    }
  };

  const handleBackToRooms = () => {
    setSelectedRoomId(null);
    setOccupiedDates([]);
    setSelectedDate(null);
    setEndDate(null);
    setBookingStep(1);
  };

  const handleDateSelect = (date: Date) => {
    if (!selectedDate || (selectedDate && endDate)) {
      setSelectedDate(date);
      setEndDate(null);
    } else if (date > selectedDate) {
      // Check if there is an occupied range in between
      let hasOverlap = false;
      if (occupiedDates) {
        const startCompare = selectedDate.getTime();
        const endCompare = date.getTime();
        const toleranceOffset = tolerance * 24 * 60 * 60 * 1000;

        for (const range of occupiedDates) {
          const oStart = new Date(range.startDate);
          oStart.setHours(0, 0, 0, 0);
          const oStartTime = oStart.getTime();

          // If there is a booking start date between check-in and checkout (minus tolerance)
          if (oStartTime > startCompare && endCompare > (oStartTime - toleranceOffset)) {
            hasOverlap = true;
            break;
          }
        }
      }

      if (hasOverlap) {
        // If it overlaps, make the clicked date the new check-in date
        setSelectedDate(date);
        setEndDate(null);
      } else {
        setEndDate(date);
      }
    } else {
      setSelectedDate(date);
      setEndDate(null);
    }
  };

  const handleSubmit = () => {
    if (!selectedRoomId || !selectedDate || !endDate || !firstName || !lastName || !email) {
      alert('Kérjük, töltsön ki minden mezőt!');
      return;
    }

    startTransition(async () => {
      const result = await createBooking({
        roomId: selectedRoomId,
        startDate: selectedDate.toISOString(),
        endDate: endDate.toISOString(),
        guests,
        lastName,
        firstName,
        email,
      });

      if (result.success) {
        setSubmissionStatus('success');
      } else {
        setSubmissionStatus('error');
      }
      setBookingStep(4);
    });
  };

  const resetForm = () => {
    setSelectedRoomId(null);
    setOccupiedDates([]);
    setSelectedDate(null);
    setEndDate(null);
    setGuests(2);
    setFirstName('');
    setLastName('');
    setEmail('');
    setSubmissionStatus(null);
    setBookingStep(1);
  };

  const selectedRoom = Rooms.find(r => r.id === selectedRoomId);
  const maxGuests = selectedRoom ? selectedRoom.capacity : 15;

  const nights = selectedDate && endDate ? Math.round((endDate.getTime() - selectedDate.getTime()) / (1000 * 60 * 60 * 24)) : 0;
  const accommodationFee = nights * guests * 7500;
  const ifa = nights * guests * 500;
  const total = accommodationFee + ifa;

  return (
    <section id="booking" className="py-24 bg-white relative overflow-hidden">
      <div className="absolute inset-0">
         <Image 
            src="/images/booking-bg.webp" 
            alt=""
            fill
            className="object-cover opacity-10 blur-sm scale-110" 
          />
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

          <div className="bg-white rounded-3xl shadow-2xl p-8 border border-stone-100 relative min-h-[500px] flex flex-col justify-center">
            
            {loadingDates && (
              <div className="absolute inset-0 bg-white/80 backdrop-blur-sm rounded-3xl flex flex-col items-center justify-center z-20">
                <Loader className="animate-spin text-emerald-700 mb-2" size={32} />
                <span className="text-sm font-semibold text-stone-600">Dátumok betöltése...</span>
              </div>
            )}

            {bookingStep === 1 && (
              <div className="animate-fade-in space-y-4">
                <h3 className="text-xl font-bold mb-4 text-stone-800 flex items-center gap-2">
                  <ShieldCheck className="text-emerald-700" size={20} />
                  Melyik szobát választja?
                </h3>
                <div className="space-y-3">
                  {Rooms.map(room => (
                    <button
                      key={room.id}
                      onClick={() => handleRoomSelect(room.id)}
                      className="w-full text-left p-4 bg-stone-50 hover:bg-emerald-50/40 rounded-2xl border border-stone-200 hover:border-emerald-300 transition-all flex items-center gap-4 cursor-pointer group"
                    >
                      <div className="relative w-16 h-16 rounded-xl overflow-hidden shrink-0 bg-stone-200">
                        <img src={room.image} alt={room.name} className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-stone-800 group-hover:text-emerald-950 transition-colors">{room.name}</h4>
                        <p className="text-xs text-stone-500 mt-1">Kapacitás: legfeljebb {room.capacity} fő</p>
                      </div>
                      <div className="text-stone-300 group-hover:text-emerald-700 transition-colors text-lg font-bold">
                        →
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {bookingStep === 2 && (
              <div className="animate-fade-in">
                <div className="flex justify-between items-center mb-4 pb-2 border-b border-stone-100">
                  <span className="text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-1 rounded-full uppercase tracking-wider">
                    {selectedRoom?.name}
                  </span>
                  <button 
                    onClick={handleBackToRooms} 
                    className="text-xs text-stone-400 hover:text-stone-700 underline cursor-pointer"
                  >
                    Szoba módosítása
                  </button>
                </div>
                <h3 className="text-xl font-bold mb-4 text-stone-800">Mikor érkezne?</h3>
                <Calendar 
                  selectedDate={selectedDate}
                  endDate={endDate}
                  onDateClick={handleDateSelect}
                  occupiedDates={occupiedDates}
                  tolerance={tolerance}
                />
                <div className="mt-6 pt-4 border-t border-stone-100">
                    <div className="flex justify-between items-center">
                        <div className="text-sm text-stone-500 font-medium">
                        {selectedDate ? (
                            <span>
                            {selectedDate.toLocaleDateString('hu-HU')} 
                            {endDate ? ` - ${endDate.toLocaleDateString('hu-HU')}` : ''}
                            </span>
                        ) : 'Válasszon időpontot'}
                        </div>
                        {selectedDate && endDate && (
                        <button 
                            onClick={() => setBookingStep(3)}
                            className="bg-emerald-900 text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-emerald-950 transition-colors flex items-center gap-2 cursor-pointer shadow-md hover:shadow-lg"
                        >
                            Tovább <ArrowRight size={14} />
                        </button>
                        )}
                    </div>
                </div>
              </div>
            )}

            {bookingStep === 3 && (
              <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="animate-fade-in">
                <button type="button" onClick={() => setBookingStep(2)} className="text-sm text-stone-400 hover:text-stone-800 mb-4 flex items-center gap-1 cursor-pointer">← Vissza a naptárhoz</button>
                <div className="flex justify-between items-center mb-4 pb-2 border-b border-stone-100">
                  <span className="text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-1 rounded-full uppercase tracking-wider">
                    {selectedRoom?.name}
                  </span>
                  <span className="text-xs text-stone-500 font-medium">
                    {selectedDate?.toLocaleDateString('hu-HU')} - {endDate?.toLocaleDateString('hu-HU')}
                  </span>
                </div>
                <h3 className="text-2xl font-serif font-bold mb-6 text-emerald-900">Ajánlatkérés</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-stone-600 mb-1">Vendégek száma (Max: {maxGuests} fő)</label>
                    <div className="flex items-center gap-4 bg-stone-50 p-3 rounded-xl border border-stone-200">
                      <button type="button" onClick={() => setGuests(Math.max(1, guests - 1))} className="w-8 h-8 rounded-full bg-white shadow flex items-center justify-center text-emerald-700 hover:bg-emerald-50 font-bold cursor-pointer">-</button>
                      <span className="font-bold w-6 text-center">{guests}</span>
                      <button type="button" onClick={() => setGuests(Math.min(maxGuests, guests + 1))} className="w-8 h-8 rounded-full bg-white shadow flex items-center justify-center text-emerald-700 hover:bg-emerald-50 font-bold cursor-pointer">+</button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="lastName" className="block text-sm font-medium text-stone-600 mb-1">Vezetéknév</label>
                      <input id="lastName" type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} required className="w-full p-3 bg-stone-50 rounded-xl border border-stone-200 focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100 transition outline-none text-stone-800" placeholder="Kovács" />
                    </div>
                    <div>
                      <label htmlFor="firstName" className="block text-sm font-medium text-stone-600 mb-1">Keresztnév</label>
                      <input id="firstName" type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} required className="w-full p-3 bg-stone-50 rounded-xl border border-stone-200 focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100 transition outline-none text-stone-800" placeholder="Anna" />
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-stone-600 mb-1">Email cím</label>
                    <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full p-3 bg-stone-50 rounded-xl border border-stone-200 focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100 transition outline-none text-stone-800" placeholder="anna@example.com" />
                  </div>

                  <div className="bg-emerald-50 p-5 rounded-xl mt-4 border border-emerald-100">
                    <h4 className="font-bold text-emerald-900 mb-3 border-b border-emerald-200 pb-2">Kalkulált ár</h4>
                    <div className="flex justify-between text-sm mb-2 text-stone-600"><span>Időtartam:</span><span className="font-bold text-emerald-900">{nights} éjszaka</span></div>
                    <div className="flex justify-between text-sm mb-2 text-stone-600"><span>Vendégek száma:</span><span className="font-bold text-emerald-900">{guests} fő</span></div>
                    <div className="flex justify-between text-sm mb-2 text-stone-600"><span>Szállásdíj (7.500 Ft/fő/éj):</span><span className="font-bold text-emerald-900">{accommodationFee.toLocaleString()} Ft</span></div>
                    <div className="flex justify-between text-sm mb-4 text-stone-600 border-b border-emerald-200 pb-3"><span>IFA (500 Ft/fő/éj):</span><span className="font-bold text-emerald-900">{ifa.toLocaleString()} Ft</span></div>
                    <div className="flex justify-between text-lg font-bold text-emerald-900"><span>Összesen:</span><span>{total.toLocaleString()} Ft</span></div>
                  </div>

                  <button 
                    type="submit"
                    disabled={isPending}
                    className="w-full bg-stone-900 text-white py-4 rounded-xl font-bold text-lg hover:bg-emerald-800 transition-all mt-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:bg-stone-400 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {isPending ? <><Loader className="animate-spin" size={20} /> Küldés...</> : 'Ajánlatkérés elküldése'}
                  </button>
                </div>
              </form>
            )}

            {bookingStep === 4 && (
              <div className="text-center py-10 animate-fade-in">
                {submissionStatus === 'success' && (
                  <>
                    <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6 text-emerald-600 shadow-inner">
                      <Check size={48} />
                    </div>
                    <h3 className="text-2xl font-serif font-bold mb-2 text-emerald-900">Köszönjük megkeresését!</h3>
                    <p className="text-stone-500 mb-8 max-w-xs mx-auto">Hamarosan felvesszük Önnel a kapcsolatot a megadott elérhetőségeken.</p>
                  </>
                )}
                {submissionStatus === 'error' && (
                  <>
                    <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6 text-red-600 shadow-inner">
                      <AlertTriangle size={48} />
                    </div>
                    <h3 className="text-2xl font-serif font-bold mb-2 text-red-900">Hiba történt!</h3>
                    <p className="text-stone-500 mb-8 max-w-xs mx-auto">Az ajánlatkérés elküldése sikertelen. Kérjük, próbálja újra később, vagy vegye fel velünk a kapcsolatot telefonon.</p>
                  </>
                )}
                <button 
                  onClick={resetForm}
                  className="text-emerald-700 font-bold hover:text-emerald-900 hover:underline transition-all cursor-pointer"
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
