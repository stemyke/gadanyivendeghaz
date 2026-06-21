'use client';

import React, { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { createAdminBooking } from '../../../actions/bookings';
import { Rooms } from '../../../../data/rooms';
import { Calendar, Lock, X, Loader, User, Mail, Users } from 'lucide-react';

export default function CreateClosureButton() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isOpen, setIsOpen] = useState(false);
  const [roomId, setRoomId] = useState(1);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [status, setStatus] = useState<'closed' | 'accepted'>('closed');
  
  // Guest details for accepted booking
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [guestsCount, setGuestsCount] = useState(2);
  const [error, setError] = useState<string | null>(null);

  const selectedRoom = Rooms.find(r => r.id === roomId);
  const maxGuests = selectedRoom ? selectedRoom.capacity : 15;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!startDate || !endDate) {
      setError('Kérjük, adja meg a kezdő és záró dátumokat!');
      return;
    }

    if (new Date(startDate) >= new Date(endDate)) {
      setError('A távozás dátumának későbbinek kell lennie az érkezésnél!');
      return;
    }

    if (status === 'accepted' && !guestName.trim()) {
      setError('Manuális foglaláshoz meg kell adni a vendég nevét!');
      return;
    }

    startTransition(async () => {
      const res = await createAdminBooking({
        roomId,
        startDate,
        endDate,
        status,
        name: status === 'accepted' ? guestName : undefined,
        email: status === 'accepted' ? (guestEmail || '-') : undefined,
        guests: status === 'accepted' ? guestsCount : undefined,
      });

      if (res.success) {
        setIsOpen(false);
        setStartDate('');
        setEndDate('');
        setGuestName('');
        setGuestEmail('');
        setGuestsCount(2);
        setStatus('closed');
        router.refresh();
      } else {
        setError(res.error || 'Hiba történt a rögzítés során.');
      }
    });
  };

  return (
    <>
      <button
        onClick={() => { setError(null); setIsOpen(true); }}
        className="bg-stone-900 hover:bg-stone-800 text-white px-5 py-2.5 rounded-xl font-medium text-sm transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5 active:translate-y-0 flex items-center gap-2 cursor-pointer border border-stone-950 font-sans"
      >
        <Lock size={16} />
        Zárás / Manuális foglalás
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in text-left">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-6 border border-stone-200 flex flex-col space-y-4 max-h-[90vh] overflow-y-auto">
            
            {/* Modal Header */}
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-bold font-serif text-stone-800">
                  Szoba lezárása vagy manuális rögzítése
                </h3>
                <p className="text-xs text-stone-500 mt-1">
                  Válassza ki a szobát, a dátumokat, valamint a bejegyzés típusát (lezárás vagy foglalás).
                </p>
              </div>
              <button 
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-stone-400 hover:text-stone-600 p-1.5 rounded-lg hover:bg-stone-100 transition cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Error message */}
            {error && (
              <div className="bg-red-50 text-red-800 border border-red-100 p-3.5 rounded-xl flex items-start gap-2.5 text-xs animate-fade-in">
                <X size={16} className="shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Modal Body Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="closureRoom" className="block text-xs font-medium text-stone-500 mb-1">Szoba</label>
                  <select
                    id="closureRoom"
                    value={roomId}
                    onChange={(e) => setRoomId(Number(e.target.value))}
                    className="w-full p-2.5 bg-stone-50 rounded-xl border border-stone-200 text-sm focus:border-stone-500 focus:bg-white outline-none text-stone-800 cursor-pointer font-sans"
                  >
                    {Rooms.map(r => (
                      <option key={r.id} value={r.id}>{r.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="closureStatus" className="block text-xs font-medium text-stone-500 mb-1">Típus</label>
                  <select
                    id="closureStatus"
                    value={status}
                    onChange={(e) => setStatus(e.target.value as 'closed' | 'accepted')}
                    className="w-full p-2.5 bg-stone-50 rounded-xl border border-stone-200 text-sm focus:border-stone-500 focus:bg-white outline-none text-stone-800 cursor-pointer font-sans"
                  >
                    <option value="closed">Szoba lezárása (Zárás)</option>
                    <option value="accepted">Közvetlen foglalás (Aktív)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="closureStart" className="block text-xs font-medium text-stone-500 mb-1">Kezdő dátum</label>
                  <div className="relative">
                    <input
                      id="closureStart"
                      type="date"
                      required
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full p-2.5 pl-8 bg-stone-50 rounded-xl border border-stone-200 text-sm focus:border-stone-500 focus:bg-white outline-none text-stone-850 font-sans"
                    />
                    <Calendar size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-stone-400" />
                  </div>
                </div>

                <div>
                  <label htmlFor="closureEnd" className="block text-xs font-medium text-stone-500 mb-1">Záró dátum</label>
                  <div className="relative">
                    <input
                      id="closureEnd"
                      type="date"
                      required
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full p-2.5 pl-8 bg-stone-50 rounded-xl border border-stone-200 text-sm focus:border-stone-500 focus:bg-white outline-none text-stone-850 font-sans"
                    />
                    <Calendar size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-stone-400" />
                  </div>
                </div>
              </div>

              {/* Dynamic guest details fields */}
              {status === 'accepted' && (
                <div className="space-y-3 p-4 bg-emerald-50/40 border border-emerald-100 rounded-2xl animate-fade-in">
                  <h4 className="text-xs font-bold text-emerald-900 uppercase tracking-wider mb-2">Vendég adatai</h4>
                  
                  <div>
                    <label htmlFor="guestName" className="block text-xs font-medium text-stone-500 mb-1">Vendég teljes neve</label>
                    <div className="relative">
                      <input
                        id="guestName"
                        type="text"
                        required
                        value={guestName}
                        onChange={(e) => setGuestName(e.target.value)}
                        placeholder="Pl. Szabó Péter"
                        className="w-full p-2.5 pl-8 bg-white rounded-xl border border-stone-200 text-sm focus:border-emerald-500 outline-none text-stone-850 font-sans"
                      />
                      <User size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-stone-450" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label htmlFor="guestEmail" className="block text-xs font-medium text-stone-500 mb-1">E-mail cím (opcionális)</label>
                      <div className="relative">
                        <input
                          id="guestEmail"
                          type="email"
                          value={guestEmail}
                          onChange={(e) => setGuestEmail(e.target.value)}
                          placeholder="szabo@example.com"
                          className="w-full p-2.5 pl-8 bg-white rounded-xl border border-stone-200 text-sm focus:border-emerald-500 outline-none text-stone-850 font-sans"
                        />
                        <Mail size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-stone-450" />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="guestsCount" className="block text-xs font-medium text-stone-500 mb-1">Vendégek száma (Max: {maxGuests})</label>
                      <div className="relative">
                        <input
                          id="guestsCount"
                          type="number"
                          required
                          min={1}
                          max={maxGuests}
                          value={guestsCount}
                          onChange={(e) => setGuestsCount(Math.max(1, Math.min(maxGuests, Number(e.target.value))))}
                          className="w-full p-2.5 pl-8 bg-white rounded-xl border border-stone-200 text-sm focus:border-emerald-500 outline-none text-stone-850 font-sans"
                        />
                        <Users size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-stone-450" />
                      </div>
                    </div>
                  </div>
                  
                  {startDate && endDate && (
                    <div className="bg-emerald-50 border border-emerald-100/60 p-2.5 rounded-xl text-xs space-y-1 text-stone-600 font-sans">
                      <div className="flex justify-between"><span>Eltöltött éjszakák:</span><span className="font-bold text-emerald-900">{Math.max(0, Math.round((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24)))} éj</span></div>
                      <div className="flex justify-between"><span>Kalkulált végösszeg:</span><span className="font-bold text-emerald-900">{((Math.max(0, Math.round((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24))) * guestsCount * 8000)).toLocaleString()} Ft</span></div>
                    </div>
                  )}
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 border border-stone-200 rounded-xl text-stone-500 hover:bg-stone-50 text-sm font-semibold cursor-pointer"
                >
                  Mégse
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-sm font-semibold flex items-center gap-1.5 cursor-pointer disabled:bg-stone-300 disabled:cursor-not-allowed font-sans"
                >
                  {isPending ? <Loader className="animate-spin" size={14} /> : null}
                  Mentés
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
