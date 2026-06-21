'use client';

import React, { useTransition } from 'react';
import { deleteBooking } from '../../../actions/bookings';
import { Trash2, Loader } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface DeleteBookingButtonProps {
  bookingId: number;
  guestName: string;
}

export default function DeleteBookingButton({ bookingId, guestName }: DeleteBookingButtonProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleDelete = () => {
    if (confirm(`Biztosan törölni szeretné ${guestName} foglalását?`)) {
      startTransition(async () => {
        const res = await deleteBooking(bookingId);
        if (res.success) {
          router.refresh();
        } else {
          alert(res.error || 'Hiba történt a törlés során.');
        }
      });
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={isPending}
      className="p-2 text-stone-400 hover:text-red-600 disabled:text-stone-300 rounded-lg hover:bg-red-50/50 hover:border-red-100 border border-transparent transition-all flex items-center justify-center cursor-pointer"
      title="Foglalás törlése"
    >
      {isPending ? <Loader className="animate-spin" size={16} /> : <Trash2 size={16} />}
    </button>
  );
}
