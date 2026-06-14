import React from 'react';
import { Menu, X } from 'lucide-react';

interface NavigationProps {
  scrolled: boolean;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
}

export default function Navigation({ scrolled, mobileMenuOpen, setMobileMenuOpen }: NavigationProps) {
  return (
    <>
      <nav className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 ${scrolled ? 'bg-white/90 backdrop-blur-md shadow-sm py-4' : 'bg-transparent py-6'}`}>
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
          <div className={`text-2xl font-serif font-bold tracking-tighter flex items-center gap-2 ${scrolled ? 'text-emerald-900' : 'text-white'}`}>
            Gadányi<span className={`${scrolled ? 'text-emerald-600' : 'text-emerald-400'}`}>Vendégház</span>
          </div>
          
          <div className={`hidden md:flex gap-8 font-medium ${scrolled ? 'text-stone-600' : 'text-white/90'}`}>
            <a href="#home" className="hover:text-emerald-500 transition">Kezdőlap</a>
            <a href="#rooms" className="hover:text-emerald-500 transition">Szobák</a>
            <a href="#services" className="hover:text-emerald-500 transition">Élmények</a>
            <a href="#booking" className="hover:text-emerald-500 transition">Ajánlatkérés</a>
          </div>

          <div 
            className={`hidden lg:flex flex-col items-center px-6 py-2 rounded-xl font-medium transition-all ${
              scrolled ? 'bg-emerald-50 text-emerald-900' : 'bg-black/20 backdrop-blur text-white'
            }`}
          >
            <div className="flex flex-col items-center gap-1">
              <a href="tel:+36703308959" className="text-sm hover:text-emerald-500 transition-colors">
                +36 70 330 8959
              </a>
              <div className="w-full border-t border-current opacity-70"></div>
              <a href="tel:+36706290102" className="text-xs hover:text-emerald-400 transition-colors">
                +36 70 629 0102
              </a>
            </div>
          </div>

          <button 
            className={`md:hidden ${scrolled ? 'text-stone-800' : 'text-white'}`}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </nav>

      {mobileMenuOpen && (
        <div className="fixed inset-0 bg-white z-40 flex flex-col items-center justify-center gap-8 text-xl animate-fade-in text-emerald-900 font-serif">
           <a href="#home" onClick={() => setMobileMenuOpen(false)}>Kezdőlap</a>
           <a href="#rooms" onClick={() => setMobileMenuOpen(false)}>Szobák</a>
           <a href="#services" onClick={() => setMobileMenuOpen(false)}>Szolgáltatások</a>
           <button className="text-stone-400 font-sans text-base" onClick={() => setMobileMenuOpen(false)}>Bezárás</button>
        </div>
      )}
    </>
  );
}
