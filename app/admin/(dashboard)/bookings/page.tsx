import React from 'react';
import { getBookingsList } from '../../../actions/bookings';
import BookingsTableClient from './BookingsTableClient';
import CreateClosureButton from './CreateClosureButton';
import { Calendar } from 'lucide-react';

export default async function BookingsAdmin() {
  const bookings = await getBookingsList();

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-stone-200 shadow-sm">
        <div>
          <h2 className="text-xl font-serif font-bold text-stone-800 flex items-center gap-2">
            <Calendar className="text-emerald-800" />
            Foglalások és Ajánlatkérések Kezelése
          </h2>
          <p className="text-stone-500 text-sm mt-1">
            Itt tekintheti meg a vendégek által beküldött ajánlatkéréseket és zárásokat. Elfogadhatja, elutasíthatja, vagy módosíthatja a foglalások paramétereit.
          </p>
        </div>
        <CreateClosureButton />
      </div>

      <BookingsTableClient bookings={bookings} />
    </div>
  );
}
