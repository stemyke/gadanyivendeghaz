'use client';

import React, { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { register } from '../../actions/auth';
import { Loader, AlertCircle, KeyRound, User, Mail, ArrowLeft, Shield } from 'lucide-react';
import Link from 'next/link';

interface RegisterFormClientProps {
  isAuthenticated: boolean;
  showRoleSelect: boolean;
}

export default function RegisterFormClient({ isAuthenticated, showRoleSelect }: RegisterFormClientProps) {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const res = await register(null, formData);
      if (res.success) {
        setSuccess(true);
        setTimeout(() => {
          router.push(isAuthenticated ? '/admin/users' : '/admin');
          router.refresh();
        }, 1500);
      } else {
        setError(res.error || 'Regisztrációs hiba');
      }
    });
  };

  return (
    <div className="min-h-screen bg-stone-100 flex items-center justify-center p-6 select-none">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8 border border-stone-200 space-y-6 animate-fade-in">
        {isAuthenticated && (
          <Link 
            href="/admin" 
            className="inline-flex items-center gap-1 text-xs text-stone-400 hover:text-stone-700 transition"
          >
            <ArrowLeft size={12} /> Vissza az irányítópultra
          </Link>
        )}

        <div className="text-center space-y-2">
          <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-3 py-1 rounded-full uppercase tracking-wider">
            {isAuthenticated ? 'Adminisztrációs felület' : 'Kezdeti beállítás'}
          </span>
          <h1 className="text-2xl font-serif font-bold text-stone-800">
            {isAuthenticated ? 'Új Admin Regisztrációja' : 'Első Admin Fiók'}
          </h1>
          <p className="text-sm text-stone-500">
            {isAuthenticated 
              ? 'Hozzon létre egy új adminisztrátori hozzáférést.' 
              : 'Regisztrálja a legelső adminisztrátort a rendszer beállításához.'}
          </p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-800 border border-red-100 p-4 rounded-xl flex items-start gap-3 text-sm animate-fade-in">
            <AlertCircle size={18} className="shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {success ? (
          <div className="bg-emerald-50 text-emerald-950 border border-emerald-100 p-6 rounded-2xl text-center space-y-3 animate-fade-in">
            <div className="text-lg font-bold">Sikeres regisztráció! 🎉</div>
            <p className="text-sm text-emerald-800">A felhasználói fiók elkészült. Átirányítás az irányítópultra...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="fullname" className="block text-sm font-medium text-stone-600 mb-1">
                Teljes név
              </label>
              <div className="relative">
                <input
                  id="fullname"
                  name="fullname"
                  type="text"
                  required
                  className="w-full p-3 pl-10 bg-stone-50 rounded-xl border border-stone-200 focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100 transition outline-none text-stone-800"
                  placeholder="Kovács János"
                />
                <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-stone-600 mb-1">
                E-mail cím
              </label>
              <div className="relative">
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="w-full p-3 pl-10 bg-stone-50 rounded-xl border border-stone-200 focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100 transition outline-none text-stone-800"
                  placeholder="janos@example.com"
                />
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
              </div>
            </div>

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
                  placeholder="kovacsjanos"
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

            {showRoleSelect && (
              <div>
                <label htmlFor="role" className="block text-sm font-medium text-stone-600 mb-1">
                  Szerepkör
                </label>
                <div className="relative">
                  <select
                    id="role"
                    name="role"
                    required
                    className="w-full p-3 pl-10 bg-stone-50 rounded-xl border border-stone-200 focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100 transition outline-none text-stone-800 appearance-none cursor-pointer"
                  >
                    <option value="admin">Adminisztrátor</option>
                    <option value="super">Szuperadminisztrátor</option>
                  </select>
                  <Shield size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isPending}
              className="w-full bg-emerald-800 hover:bg-emerald-700 text-white py-3.5 rounded-xl font-bold text-base transition shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 active:translate-y-0 disabled:bg-stone-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isPending ? <><Loader className="animate-spin" size={18} /> Regisztráció...</> : 'Fiók létrehozása'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
