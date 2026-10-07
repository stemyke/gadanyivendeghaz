'use client';

import React, { useTransition } from 'react';
import { RefreshCw } from 'lucide-react';
import { syncExternalCalendars } from '../../../actions/bookings';
import { useRouter } from 'next/navigation';

export default function SyncCalendarsButton() {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleSync = () => {
    startTransition(async () => {
      const res = await syncExternalCalendars();
      if (res.success) {
        alert(`Sikeres naptár szinkronizáció!\nImportálva: ${res.imported} db, Törölve: ${res.deleted} db.`);
        router.refresh();
      } else {
        alert(`Sikertelen szinkronizáció:\n${res.error}`);
      }
    });
  };

  return (
    <button
      onClick={handleSync}
      disabled={isPending}
      className="bg-emerald-800 hover:bg-emerald-700 disabled:bg-stone-300 text-white px-5 py-2.5 rounded-xl font-medium text-sm transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5 active:translate-y-0 flex items-center gap-2 cursor-pointer border border-emerald-900 font-sans disabled:cursor-not-allowed disabled:transform-none"
    >
      <RefreshCw size={16} className={isPending ? 'animate-spin' : ''} />
      {isPending ? 'Szinkronizálás...' : 'Naptárak szinkronizálása'}
    </button>
  );
}
