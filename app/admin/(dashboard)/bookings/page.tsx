import React from 'react';
import { getBookingsList } from '../../../actions/bookings';
import BookingRow from './BookingRow';
import { Calendar, Inbox, CheckCircle, XCircle } from 'lucide-react';

export default async function BookingsAdmin() {
  const bookings = await getBookingsList();

  const pendingBookings = bookings.filter(b => b.status === 'pending');
  const acceptedBookings = bookings.filter(b => b.status === 'accepted');
  const rejectedBookings = bookings.filter(b => b.status === 'rejected');

  const renderTable = (list: typeof bookings, title: string, icon: React.ReactNode, emptyMessage: string) => {
    return (
      <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden space-y-4 p-6">
        <div className="flex items-center gap-2 pb-3 border-b border-stone-100">
          {icon}
          <h3 className="text-lg font-semibold text-stone-800">{title}</h3>
          <span className="text-xs bg-stone-100 text-stone-600 px-2 py-0.5 rounded-full font-bold">
            {list.length} db
          </span>
        </div>

        {list.length === 0 ? (
          <div className="py-12 text-center text-stone-400 text-sm flex flex-col items-center justify-center gap-2 bg-stone-50/50 rounded-xl border border-dashed border-stone-200">
            {emptyMessage}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-stone-50 text-stone-500 text-xs font-semibold uppercase border-b border-stone-200">
                  <th className="px-6 py-4">Vendég</th>
                  <th className="px-6 py-4">Szoba</th>
                  <th className="px-6 py-4">Dátumok</th>
                  <th className="px-6 py-4">Létszám</th>
                  <th className="px-6 py-4">Kalkulált ár</th>
                  <th className="px-6 py-4">Státusz</th>
                  <th className="px-6 py-4 text-right">Műveletek</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 text-sm text-stone-700">
                {list.map(b => (
                  <BookingRow key={b.id} booking={b} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm">
        <h2 className="text-xl font-serif font-bold text-stone-800 flex items-center gap-2">
          <Calendar className="text-emerald-800" />
          Foglalások és Ajánlatkérések Kezelése
        </h2>
        <p className="text-stone-500 text-sm mt-1">
          Itt tekintheti meg a vendégek által beküldött ajánlatkéréseket. Elfogadhatja, elutasíthatja, vagy módosíthatja a foglalások paramétereit (dátumok, létszám).
        </p>
      </div>

      {renderTable(
        pendingBookings,
        'Új ajánlatkérések (Válaszra vár)',
        <Inbox className="text-amber-600" size={20} />,
        'Nincs várakozó ajánlatkérés.'
      )}

      {renderTable(
        acceptedBookings,
        'Elfogadott foglalások (Aktív)',
        <CheckCircle className="text-emerald-600" size={20} />,
        'Nincs elfogadott foglalás.'
      )}

      {renderTable(
        rejectedBookings,
        'Elutasított ajánlatkérések',
        <XCircle className="text-red-600" size={20} />,
        'Nincs elutasított ajánlatkérés.'
      )}
    </div>
  );
}
