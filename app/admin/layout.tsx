'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  CalendarRange, 
  Image as ImageIcon, 
  Settings, 
  LogOut, 
  Menu, 
  X, 
  User,
  Home
} from 'lucide-react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const navItems = [
    { name: 'Áttekintés', href: '/admin', icon: LayoutDashboard },
    { name: 'Foglalások', href: '/admin/bookings', icon: CalendarRange },
    { name: 'Galéria', href: '/admin/gallery', icon: ImageIcon },
    { name: 'Beállítások', href: '/admin/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-stone-100 flex flex-col md:flex-row text-stone-800">
      {/* Mobile Top Navbar */}
      <header className="md:hidden flex items-center justify-between bg-emerald-950 text-white px-6 py-4 shadow-md sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <span className="font-serif font-bold text-lg tracking-tight">Gadányi <span className="text-emerald-400">Admin</span></span>
        </div>
        <button 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)} 
          className="text-stone-300 hover:text-white focus:outline-none"
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </header>

      {/* Sidebar (Desktop) / Mobile Drawer */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-emerald-950 text-stone-200 transform transition-transform duration-300 ease-in-out flex flex-col justify-between
        md:translate-x-0 md:static md:h-screen
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Top Branding */}
        <div>
          <div className="h-20 flex items-center px-6 border-b border-emerald-900 justify-between">
            <span className="font-serif font-bold text-xl tracking-tight text-white">
              Gadányi <span className="text-emerald-400">Admin</span>
            </span>
            <button 
              onClick={() => setMobileMenuOpen(false)}
              className="md:hidden text-stone-400 hover:text-white"
            >
              <X size={20} />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="mt-6 px-4 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all
                    ${isActive 
                      ? 'bg-emerald-700 text-white shadow-md' 
                      : 'hover:bg-emerald-900/50 hover:text-white text-stone-300'}
                  `}
                >
                  <Icon size={18} />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Actions */}
        <div className="p-4 border-t border-emerald-900 space-y-2">
          <Link
            href="/"
            className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-emerald-900/50 hover:text-white text-stone-300 transition-colors"
          >
            <Home size={18} />
            Vissza a főoldalra
          </Link>
          <button
            onClick={() => alert('Kijelentkezés...')}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-red-950/40 hover:text-red-400 text-stone-300 transition-colors text-left"
          >
            <LogOut size={18} />
            Kijelentkezés
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top header (Desktop only) */}
        <header className="hidden md:flex items-center justify-between h-20 bg-white border-b border-stone-200 px-8 shadow-sm">
          <h1 className="text-xl font-semibold text-stone-800">
            {navItems.find(item => item.href === pathname)?.name || 'Adminisztráció'}
          </h1>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-800 font-semibold border border-emerald-200">
              <User size={18} />
            </div>
            <span className="text-sm font-medium text-stone-600">Adminisztrátor</span>
          </div>
        </header>

        {/* Content Wrapper */}
        <main className="flex-1 p-6 md:p-8 bg-stone-50 overflow-y-auto">
          {children}
        </main>
      </div>

      {/* Backdrop for mobile menu */}
      {mobileMenuOpen && (
        <div 
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 bg-black/40 z-30 md:hidden"
        />
      )}
    </div>
  );
}
