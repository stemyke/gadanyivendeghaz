import React from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { checkAuth } from '../../../actions/auth';
import { UserModel } from '../../../../lib/models/User';
import DeleteUserButton from './DeleteUserButton';
import { UserPlus, User, Mail, Calendar, Key, Shield } from 'lucide-react';

export default async function UsersAdmin() {
  const { username: loggedInUsername, role } = await checkAuth();

  // Only super admin can access this page
  if (role !== 'super') {
    redirect('/admin');
  }

  const users = await UserModel.getUsers();

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-stone-200 shadow-sm">
        <div>
          <h2 className="text-xl font-serif font-bold text-stone-800">Felhasználók kezelése</h2>
          <p className="text-stone-500 text-sm mt-1">Itt listázhatja az adminisztrátori hozzáféréseket és új felhasználókat regisztrálhat.</p>
        </div>
        <Link
          href="/admin/register"
          className="bg-emerald-800 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl font-medium text-sm transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5 active:translate-y-0 flex items-center gap-2 cursor-pointer"
        >
          <UserPlus size={16} />
          Új felhasználó regisztrációja
        </Link>
      </div>

      <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-stone-50 text-stone-500 text-xs font-semibold uppercase border-b border-stone-200">
                <th className="px-6 py-4">Név</th>
                <th className="px-6 py-4">Felhasználónév</th>
                <th className="px-6 py-4">E-mail cím</th>
                <th className="px-6 py-4">Szerepkör</th>
                <th className="px-6 py-4">Regisztráció dátuma</th>
                <th className="px-6 py-4 text-right">Művelet</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 text-sm text-stone-700">
              {users.map((user) => {
                const isSelf = user.username === loggedInUsername;
                const formattedDate = user.createdAt
                  ? new Date(user.createdAt).toLocaleDateString('hu-HU', {
                      year: 'numeric',
                      month: '2-digit',
                      day: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit'
                    })
                  : 'Nincs adat';

                return (
                  <tr key={user.id} className="hover:bg-stone-50/60 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-medium ${isSelf ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' : 'bg-stone-100 text-stone-700 border border-stone-200'}`}>
                          <User size={14} />
                        </div>
                        <span className="font-medium text-stone-800">{user.fullname}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-mono text-xs bg-stone-100 text-stone-600 px-2 py-1 rounded-md">@{user.username}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-stone-500">
                        <Mail size={14} />
                        <span>{user.email}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {user.role === 'super' ? (
                        <span className="inline-flex items-center gap-1 text-xs bg-amber-50 text-amber-800 border border-amber-200 px-2.5 py-1 rounded-full font-medium">
                          <Shield size={10} className="text-amber-600" />
                          Szuperadmin
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs bg-stone-100 text-stone-700 border border-stone-200 px-2.5 py-1 rounded-full font-medium">
                          Adminisztrátor
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-stone-500">
                        <Calendar size={14} />
                        <span>{formattedDate}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {isSelf ? (
                        <span className="inline-flex items-center gap-1 text-xs bg-emerald-50 text-emerald-800 border border-emerald-100 px-2.5 py-1 rounded-full font-medium">
                          <Key size={10} />
                          Saját fiók
                        </span>
                      ) : (
                        <div className="flex justify-end">
                          <DeleteUserButton userId={user.id!} username={user.username} />
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
