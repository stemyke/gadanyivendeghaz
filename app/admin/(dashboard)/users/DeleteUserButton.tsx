'use client';

import React, { useTransition } from 'react';
import { deleteUser } from '../../../actions/auth';
import { Trash2, Loader } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface DeleteUserButtonProps {
  userId: number;
  username: string;
}

export default function DeleteUserButton({ userId, username }: DeleteUserButtonProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleDelete = () => {
    if (confirm(`Biztosan törölni szeretné a(z) @${username} felhasználót?`)) {
      startTransition(async () => {
        const res = await deleteUser(userId);
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
      title="Felhasználó törlése"
    >
      {isPending ? <Loader className="animate-spin" size={16} /> : <Trash2 size={16} />}
    </button>
  );
}
