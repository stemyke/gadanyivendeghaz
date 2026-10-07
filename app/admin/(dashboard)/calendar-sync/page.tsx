import React from 'react';
import { redirect } from 'next/navigation';
import { checkAuth } from '../../../actions/auth';
import { getCalendarConfigs } from '../../../actions/bookings';
import CalendarSyncClient from './CalendarSyncClient';
import { RefreshCw } from 'lucide-react';

export default async function CalendarSyncAdminPage() {
  const { isAuthenticated, role } = await checkAuth();

  // Only super admin can access this page
  if (!isAuthenticated || role !== 'super') {
    redirect('/admin');
  }

  const configs = await getCalendarConfigs();

  // Map configs to plain JS objects for the client component
  const plainConfigs = configs.map(c => ({
    id: c.id,
    roomId: c.roomId,
    source: c.source,
    url: c.url,
  }));

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-stone-200 shadow-sm">
        <div>
          <h2 className="text-xl font-serif font-bold text-stone-800 flex items-center gap-2">
            <RefreshCw className="text-emerald-800" size={20} />
            Naptár Szinkronizációs Beállítások
          </h2>
          <p className="text-stone-500 text-sm mt-1">
            Itt kezelheti a szobákhoz tartozó külső értékesítési csatornák (Booking.com, Szallas.hu) iCal szinkronizációs linkjeit.
          </p>
        </div>
      </div>

      <CalendarSyncClient initialConfigs={plainConfigs} />
    </div>
  );
}
