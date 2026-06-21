import React from 'react';
import PasswordChangeForm from './PasswordChangeForm';

export default function SettingsAdmin() {
  return (
    <div className="bg-white p-6 md:p-8 rounded-2xl border border-stone-200 shadow-sm space-y-6 animate-fade-in">
      <div>
        <h2 className="text-xl font-serif font-bold text-stone-800">Rendszerbeállítások</h2>
        <p className="text-stone-500 text-sm mt-1">
          Itt módosíthatja a bejelentkezett felhasználói fiók jelszavát.
        </p>
      </div>

      <div className="border-t border-stone-100 pt-6">
        <h3 className="text-base font-semibold text-stone-800 mb-4">Adminisztrátori jelszó módosítása</h3>
        <PasswordChangeForm />
      </div>
    </div>
  );
}
