'use client';

import React, { useState } from 'react';
import BookingRow from './BookingRow';
import { ArrowUpDown, ArrowUp, ArrowDown, Inbox } from 'lucide-react';

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

interface BookingsTableClientProps {
  bookings: Booking[];
}

export default function BookingsTableClient({ bookings }: BookingsTableClientProps) {
  const [sortField, setSortField] = useState<string>('status');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const statusPriority: Record<string, number> = {
    pending: 1,
    accepted: 2,
    closed: 3,
    rejected: 4,
  };

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedBookings = [...bookings].sort((a, b) => {
    let valA: any = '';
    let valB: any = '';

    if (sortField === 'name') {
      valA = a.name.toLowerCase();
      valB = b.name.toLowerCase();
    } else if (sortField === 'room') {
      valA = a.roomId;
      valB = b.roomId;
    } else if (sortField === 'dates') {
      valA = new Date(a.startDate).getTime();
      valB = new Date(b.startDate).getTime();
    } else if (sortField === 'guests') {
      valA = a.guests;
      valB = b.guests;
    } else if (sortField === 'price') {
      valA = parseInt(a.totalPrice.replace(/\D/g, ''), 10) || 0;
      valB = parseInt(b.totalPrice.replace(/\D/g, ''), 10) || 0;
    } else if (sortField === 'status') {
      valA = statusPriority[a.status] || 99;
      valB = statusPriority[b.status] || 99;
    }

    if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
    if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const renderSortHeader = (label: string, field: string, widthClass: string) => {
    const isActive = sortField === field;
    return (
      <th 
        onClick={() => handleSort(field)}
        className={`px-6 py-4 ${widthClass} cursor-pointer select-none hover:bg-stone-100 border-b border-stone-200 transition-colors group/header`}
      >
        <div className="flex items-center gap-1.5">
          <span>{label}</span>
          <span className="text-stone-400 group-hover/header:text-stone-700 transition-colors">
            {isActive ? (
              sortDirection === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />
            ) : (
              <ArrowUpDown size={14} className="opacity-0 group-hover/header:opacity-100 transition-opacity" />
            )}
          </span>
        </div>
      </th>
    );
  };

  return (
    <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden space-y-4 p-6">
      <div className="flex items-center gap-2 pb-3 border-b border-stone-100">
        <Inbox className="text-emerald-800" size={20} />
        <h3 className="text-lg font-semibold text-stone-800">Foglalások és Ajánlatkérések listája</h3>
        <span className="text-xs bg-stone-100 text-stone-600 px-2 py-0.5 rounded-full font-bold">
          {bookings.length} db
        </span>
      </div>

      {bookings.length === 0 ? (
        <div className="py-12 text-center text-stone-400 text-sm flex flex-col items-center justify-center gap-2 bg-stone-50/50 rounded-xl border border-dashed border-stone-200">
          Nincs rögzített foglalás vagy ajánlatkérés.
        </div>
      ) : (
        <div className="overflow-x-auto">
          {/* A border-separate és border-spacing-0 elengedhetetlen, hogy a sticky oszlop helyesen működjön */}
          <table className="w-full min-w-[1180px] text-left border-separate border-spacing-0 table-fixed">
            <thead>
              <tr className="bg-stone-50 text-stone-500 text-xs font-semibold uppercase">
                {renderSortHeader('Vendég', 'name', 'w-[22%] min-w-[260px]')}
                {renderSortHeader('Szoba', 'room', 'w-[15%] min-w-[180px]')}
                {renderSortHeader('Dátumok', 'dates', 'w-[15%] min-w-[180px]')}
                {renderSortHeader('Létszám', 'guests', 'w-[8%] min-w-[100px]')}
                {renderSortHeader('Kalkulált ár', 'price', 'w-[12%] min-w-[140px]')}
                {renderSortHeader('Státusz', 'status', 'w-[12%] min-w-[140px]')}
                <th className="px-6 py-4 text-right sticky right-0 bg-stone-50 border-b border-stone-200 shadow-[-4px_0_8px_-4px_rgba(0,0,0,0.05)] w-[16%] min-w-[180px] z-10 sticky-actions">
                  Műveletek
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 text-sm text-stone-700">
              {sortedBookings.map(b => (
                <BookingRow key={b.id} booking={b} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
