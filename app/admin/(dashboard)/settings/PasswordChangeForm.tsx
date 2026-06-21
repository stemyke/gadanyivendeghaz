'use client';

import React, { useState, useTransition } from 'react';
import { changePassword } from '../../../actions/auth';
import { KeyRound, Lock, CheckCircle2, AlertCircle, Loader } from 'lucide-react';

export default function PasswordChangeForm() {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    const formData = new FormData(e.currentTarget);
    const oldPassword = formData.get('oldPassword') as string;
    const newPassword = formData.get('newPassword') as string;
    const confirmPassword = formData.get('confirmPassword') as string;

    if (newPassword !== confirmPassword) {
      setError('A két új jelszó nem egyezik!');
      return;
    }

    if (newPassword.length < 6) {
      setError('Az új jelszónak legalább 6 karakterből kell állnia!');
      return;
    }

    startTransition(async () => {
      const res = await changePassword(null, formData);
      if (res.success) {
        setSuccess(true);
        // Clear the form
        (e.target as HTMLFormElement).reset();
      } else {
        setError(res.error || 'Hiba történt a jelszómódosítás során.');
      }
    });
  };

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-50 text-red-800 border border-red-100 p-4 rounded-xl flex items-start gap-3 text-sm animate-fade-in">
          <AlertCircle size={18} className="shrink-0 mt-0.5 text-red-600" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="bg-emerald-50 text-emerald-950 border border-emerald-100 p-4 rounded-xl flex items-start gap-3 text-sm animate-fade-in">
          <CheckCircle2 size={18} className="shrink-0 mt-0.5 text-emerald-600" />
          <span>A jelszó sikeresen megváltoztatva!</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
        <div>
          <label htmlFor="oldPassword" className="block text-sm font-medium text-stone-600 mb-1">
            Jelenlegi jelszó
          </label>
          <div className="relative">
            <input
              id="oldPassword"
              name="oldPassword"
              type="password"
              required
              className="w-full p-3 pl-10 bg-stone-50 rounded-xl border border-stone-200 focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100 transition outline-none text-stone-800"
              placeholder="••••••••"
            />
            <KeyRound size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
          </div>
        </div>

        <div>
          <label htmlFor="newPassword" className="block text-sm font-medium text-stone-600 mb-1">
            Új jelszó
          </label>
          <div className="relative">
            <input
              id="newPassword"
              name="newPassword"
              type="password"
              required
              className="w-full p-3 pl-10 bg-stone-50 rounded-xl border border-stone-200 focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100 transition outline-none text-stone-800"
              placeholder="••••••••"
            />
            <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
          </div>
        </div>

        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-stone-600 mb-1">
            Új jelszó megerősítése
          </label>
          <div className="relative">
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              required
              className="w-full p-3 pl-10 bg-stone-50 rounded-xl border border-stone-200 focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100 transition outline-none text-stone-800"
              placeholder="••••••••"
            />
            <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
          </div>
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="w-full sm:w-auto bg-emerald-800 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl font-bold text-sm transition shadow-md hover:shadow-lg transform hover:-translate-y-0.5 active:translate-y-0 disabled:bg-stone-300 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
        >
          {isPending ? (
            <>
              <Loader className="animate-spin" size={16} /> Módosítás...
            </>
          ) : (
            'Jelszó frissítése'
          )}
        </button>
      </form>
    </div>
  );
}
