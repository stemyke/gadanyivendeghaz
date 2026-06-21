'use client';

import React, { useState, useTransition } from 'react';
import { updateBooking } from '../../../actions/bookings';
import DeleteBookingButton from './DeleteBookingButton';
import { Rooms } from '../../../../data/rooms';
import { useRouter } from 'next/navigation';
import { Edit2, Check, X, Mail, Calendar, User, Users, ShieldAlert, Loader, DollarSign } from 'lucide-react';

interface Booking {
  id: number;
  roomId: number;
  startDate: string;
  endDate: string;
  name: string;
  email: string;
  guests: number;
  totalPrice: string;
  status: string;
  acceptedAt: string | null;
  createdAt: string;
}

interface BookingRowProps {
  booking: Booking;
}

export default function BookingRow({ booking }: BookingRowProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form states for edit modal
  const [editStartDate, setEditStartDate] = useState(booking.startDate.split('T')[0]);
  const [editEndDate, setEditEndDate] = useState(booking.endDate.split('T')[0]);
  const [editGuests, setEditGuests] = useState(booking.guests);
  const [editStatus, setEditStatus] = useState(booking.status);

  const room = Rooms.find(r => r.id === booking.roomId);
  const maxGuests = room?.capacity || 15;

  const formattedCheckIn = new Date(booking.startDate).toLocaleDateString('hu-HU', { year: 'numeric', month: '2-digit', day: '2-digit' });
  const formattedCheckOut = new Date(booking.endDate).toLocaleDateString('hu-HU', { year: 'numeric', month: '2-digit', day: '2-digit' });
  const formattedCreated = new Date(booking.createdAt).toLocaleDateString('hu-HU', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
  
  const nights = Math.round((new Date(booking.endDate).getTime() - new Date(booking.startDate).getTime()) / (1000 * 60 * 60 * 24));

  const handleStatusChange = (status: 'accepted' | 'rejected') => {
    setError(null);
    startTransition(async () => {
      const res = await updateBooking(booking.id, { status });
      if (res.success) {
        router.refresh();
      } else {
        setError(res.error || 'Hiba történt a státusz frissítése során.');
      }
    });
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (new Date(editStartDate) >= new Date(editEndDate)) {
      setError('A távozás dátumának későbbinek kell lennie az érkezésnél!');
      return;
    }

    startTransition(async () => {
      const res = await updateBooking(booking.id, {
        status: editStatus,
        startDate: editStartDate,
        endDate: editEndDate,
        guests: editGuests,
      });

      if (res.success) {
        setIsModalOpen(false);
        router.refresh();
      } else {
        setError(res.error || 'Hiba történt a módosítás mentése során.');
      }
    });
  };

  return (
    <>
      <tr className="hover:bg-stone-50/60 transition-colors">
        <td className="px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center font-medium text-stone-700 border border-stone-200">
              <User size={14} />
            </div>
            <div className="flex flex-col">
              <span className="font-medium text-stone-800">{booking.name}</span>
              <span className="text-xs text-stone-400 flex items-center gap-1"><Mail size={12} /> {booking.email}</span>
            </div>
          </div>
        </td>
        <td className="px-6 py-4">
          <span className="text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-1 rounded-full uppercase tracking-wider">
            {room?.name || `${booking.roomId}. szoba`}
          </span>
        </td>
        <td className="px-6 py-4">
          <div className="flex flex-col text-stone-600">
            <span className="flex items-center gap-1.5"><Calendar size={14} /> {formattedCheckIn} - {formattedCheckOut}</span>
            <span className="text-xs text-stone-400 mt-0.5">{nights} éjszaka</span>
          </div>
        </td>
        <td className="px-6 py-4 font-medium text-stone-700">
          <div className="flex items-center gap-1">
            <Users size={14} className="text-stone-400" />
            {booking.guests} fő
          </div>
        </td>
        <td className="px-6 py-4 font-semibold text-emerald-800">
          {booking.totalPrice}
        </td>
        <td className="px-6 py-4">
          {booking.status === 'pending' && (
            <span className="inline-flex items-center gap-1 text-xs bg-amber-50 text-amber-800 border border-amber-200 px-2.5 py-1 rounded-full font-medium">
              Válaszra vár
            </span>
          )}
          {booking.status === 'accepted' && (
            <span className="inline-flex items-center gap-1 text-xs bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-1 rounded-full font-medium">
              Elfogadva
            </span>
          )}
          {booking.status === 'rejected' && (
            <span className="inline-flex items-center gap-1 text-xs bg-red-50 text-red-800 border border-red-200 px-2.5 py-1 rounded-full font-medium">
              Elutasítva
            </span>
          )}
        </td>
        <td className="px-6 py-4 text-right">
          <div className="flex items-center justify-end gap-1.5">
            {booking.status === 'pending' && (
              <>
                <button
                  onClick={() => handleStatusChange('accepted')}
                  disabled={isPending}
                  className="p-2 text-emerald-600 hover:text-white hover:bg-emerald-600 disabled:opacity-50 rounded-lg border border-transparent hover:border-emerald-700 transition-all flex items-center justify-center cursor-pointer"
                  title="Elfogadás"
                >
                  <Check size={16} />
                </button>
                <button
                  onClick={() => handleStatusChange('rejected')}
                  disabled={isPending}
                  className="p-2 text-red-600 hover:text-white hover:bg-red-600 disabled:opacity-50 rounded-lg border border-transparent hover:border-red-700 transition-all flex items-center justify-center cursor-pointer"
                  title="Elutasítás"
                >
                  <X size={16} />
                </button>
              </>
            )}
            
            <button
              onClick={() => { setError(null); setIsModalOpen(true); }}
              disabled={isPending}
              className="p-2 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-lg border border-transparent transition-all flex items-center justify-center cursor-pointer"
              title="Módosítás / Részletek"
            >
              <Edit2 size={16} />
            </button>

            <DeleteBookingButton bookingId={booking.id} guestName={booking.name} />
          </div>

          {/* Edit Modal */}
          {isModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in text-left">
              <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-6 border border-stone-200 flex flex-col space-y-4">
                
                {/* Modal Header */}
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-xs bg-emerald-50 text-emerald-800 border border-emerald-100 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                      {room?.name}
                    </span>
                    <h3 className="text-lg font-bold font-serif text-stone-800 mt-2">
                      Foglalás módosítása
                    </h3>
                    <p className="text-xs text-stone-500">Vendég: {booking.name}</p>
                  </div>
                  <button 
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="text-stone-400 hover:text-stone-600 p-1.5 rounded-lg hover:bg-stone-100 transition cursor-pointer"
                  >
                    <X size={20} />
                  </button>
                </div>

                {/* Error message */}
                {error && (
                  <div className="bg-red-50 text-red-800 border border-red-100 p-3.5 rounded-xl flex items-start gap-2.5 text-xs animate-fade-in">
                    <ShieldAlert size={16} className="shrink-0 mt-0.5" />
                    <span>{error}</span>
                  </div>
                )}

                {/* Modal Body Form */}
                <form onSubmit={handleSaveEdit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label htmlFor="editStartDate" className="block text-xs font-medium text-stone-500 mb-1">Érkezés</label>
                      <div className="relative">
                        <input
                          id="editStartDate"
                          type="date"
                          required
                          value={editStartDate}
                          onChange={(e) => setEditStartDate(e.target.value)}
                          className="w-full p-2.5 pl-8 bg-stone-50 rounded-xl border border-stone-200 text-sm focus:border-emerald-500 focus:bg-white outline-none text-stone-800 font-sans"
                        />
                        <Calendar size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-stone-400" />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="editEndDate" className="block text-xs font-medium text-stone-500 mb-1">Távozás</label>
                      <div className="relative">
                        <input
                          id="editEndDate"
                          type="date"
                          required
                          value={editEndDate}
                          onChange={(e) => setEditEndDate(e.target.value)}
                          className="w-full p-2.5 pl-8 bg-stone-50 rounded-xl border border-stone-200 text-sm focus:border-emerald-500 focus:bg-white outline-none text-stone-800 font-sans"
                        />
                        <Calendar size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-stone-400" />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label htmlFor="editGuests" className="block text-xs font-medium text-stone-500 mb-1">Vendégek (Max: {maxGuests} fő)</label>
                      <div className="relative">
                        <input
                          id="editGuests"
                          type="number"
                          required
                          min={1}
                          max={maxGuests}
                          value={editGuests}
                          onChange={(e) => setEditGuests(Math.max(1, Math.min(maxGuests, Number(e.target.value))))}
                          className="w-full p-2.5 pl-8 bg-stone-50 rounded-xl border border-stone-200 text-sm focus:border-emerald-500 focus:bg-white outline-none text-stone-800 font-sans"
                        />
                        <Users size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-stone-400" />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="editStatus" className="block text-xs font-medium text-stone-500 mb-1">Státusz</label>
                      <select
                        id="editStatus"
                        value={editStatus}
                        onChange={(e) => setEditStatus(e.target.value)}
                        className="w-full p-2.5 bg-stone-50 rounded-xl border border-stone-200 text-sm focus:border-emerald-500 focus:bg-white outline-none text-stone-800 cursor-pointer font-sans"
                      >
                        <option value="pending">Válaszra vár (Pending)</option>
                        <option value="accepted">Elfogadva (Accepted)</option>
                        <option value="rejected">Elutasítva (Rejected)</option>
                      </select>
                    </div>
                  </div>

                  {/* Informative calculated pricing info */}
                  <div className="bg-emerald-50/50 border border-emerald-100 p-3 rounded-xl text-xs space-y-1 text-stone-600">
                    <div className="flex justify-between"><span>Eltöltött éjszakák száma:</span><span className="font-bold text-emerald-900">{Math.max(0, Math.round((new Date(editEndDate).getTime() - new Date(editStartDate).getTime()) / (1000 * 60 * 60 * 24)))} éj</span></div>
                    <div className="flex justify-between"><span>Becsült új végösszeg:</span><span className="font-bold text-emerald-900">{((Math.max(0, Math.round((new Date(editEndDate).getTime() - new Date(editStartDate).getTime()) / (1000 * 60 * 60 * 24))) * editGuests * 8000)).toLocaleString()} Ft</span></div>
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="px-4 py-2 border border-stone-200 rounded-xl text-stone-500 hover:bg-stone-50 text-sm font-semibold cursor-pointer"
                    >
                      Mégse
                    </button>
                    <button
                      type="submit"
                      disabled={isPending}
                      className="px-4 py-2 bg-emerald-800 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold flex items-center gap-1.5 cursor-pointer disabled:bg-stone-300 disabled:cursor-not-allowed"
                    >
                      {isPending ? <Loader className="animate-spin" size={14} /> : null}
                      Mentés
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </td>
      </tr>

      {/* Global Error Banner */}
      {error && !isModalOpen && (
        <tr>
          <td colSpan={7} className="px-6 py-2.5 bg-red-50 text-red-800 text-xs font-semibold border-b border-red-100">
            <div className="flex items-center gap-2">
              <ShieldAlert size={14} className="shrink-0" />
              <span>{error}</span>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}
