import React from 'react';
import { redirect } from 'next/navigation';
import { checkAuth } from '../../actions/auth';
import AdminSidebar from '../../../components/AdminSidebar';
import { User } from 'lucide-react';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, username, hasAnyUsers, role } = await checkAuth();

  // Route guarding: redirect if not authenticated
  if (!isAuthenticated) {
    if (!hasAnyUsers) {
      redirect('/admin/register');
    } else {
      redirect('/admin/login');
    }
  }

  return (
    <div className="min-h-screen md:h-screen md:overflow-hidden bg-stone-100 flex flex-col md:flex-row text-stone-800">
      <AdminSidebar role={role} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-screen md:min-h-0 md:h-screen md:overflow-hidden">
        {/* Top header (Desktop only) */}
        <header className="hidden md:flex items-center justify-between h-20 bg-white border-b border-stone-200 px-8 shadow-sm shrink-0">
          <h1 className="text-xl font-semibold text-stone-800">
            Adminisztráció
          </h1>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-800 font-semibold border border-emerald-200">
              <User size={18} />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                {role === 'super' ? 'SzuperAdmin' : 'Admin'}
              </span>
              <span className="text-sm font-medium text-stone-800">@{username}</span>
            </div>
          </div>
        </header>

        {/* Content Wrapper */}
        <main className="flex-1 p-6 md:p-8 bg-stone-50 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
