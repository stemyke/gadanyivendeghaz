'use client';

import React, { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { login } from '../../actions/auth';
import { Loader, AlertCircle, KeyRound, User } from 'lucide-react';
import Link from 'next/link';

export default function LoginFormClient({ hasAnyUsers }: { hasAnyUsers: boolean }) {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const res = await login(null, formData);
      if (res.success) {
        router.push('/admin');
        router.refresh();
      } else {
        setError(res.error || 'Bejelentkezési hiba');
      }
    });
  };

  return (
    <div className="min-h-screen bg-stone-100 flex items-center justify-center p-6 select-none">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8 border border-stone-200 space-y-6 animate-fade-in">
        <div className="text-center space-y-2">
          <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-3 py-1 rounded-full uppercase tracking-wider">
            Gadányi Vendégház
          </span>
          <h1 className="text-2xl font-serif font-bold text-stone-800">Adminisztráció</h1>
          <p className="text-sm text-stone-500">Kérjük, jelentkezzen be a folytatáshoz.</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-800 border border-red-100 p-4 rounded-xl flex items-start gap-3 text-sm animate-fade-in">
            <AlertCircle size={18} className="shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {!hasAnyUsers && (
          <div className="bg-amber-50 text-amber-900 border border-amber-100 p-4 rounded-xl space-y-3 text-sm animate-fade-in">
            <div className="flex items-start gap-3">
              <AlertCircle size={18} className="shrink-0 mt-0.5 text-amber-700" />
              <span><strong>Még nincs regisztrált felhasználó a rendszerben.</strong> Hozza létre az első adminisztrátori fiókot!</span>
            </div>
            <Link 
              href="/admin/register" 
              className="block w-full text-center bg-amber-600 hover:bg-amber-700 text-white font-bold py-2.5 px-4 rounded-xl transition shadow-sm"
            >
              Első admin regisztrációja
            </Link>
          </div>
        )}

        {hasAnyUsers && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-stone-600 mb-1">
                Felhasználónév
              </label>
              <div className="relative">
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  className="w-full p-3 pl-10 bg-stone-50 rounded-xl border border-stone-200 focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100 transition outline-none text-stone-800"
                  placeholder="admin"
                />
                <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-stone-600 mb-1">
                Jelszó
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className="w-full p-3 pl-10 bg-stone-50 rounded-xl border border-stone-200 focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100 transition outline-none text-stone-800"
                  placeholder="••••••••"
                />
                <KeyRound size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
              </div>
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="w-full bg-emerald-800 hover:bg-emerald-700 text-white py-3.5 rounded-xl font-bold text-base transition shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 active:translate-y-0 disabled:bg-stone-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isPending ? <><Loader className="animate-spin" size={18} /> Bejelentkezés...</> : 'Bejelentkezés'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
