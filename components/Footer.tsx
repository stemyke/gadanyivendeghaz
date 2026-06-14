import React from 'react';
import { MapPin, Phone, Mail } from 'lucide-react';
import { FaInstagram, FaFacebook } from 'react-icons/fa';

export default function Footer() {
  return (
    <footer className="bg-stone-900 text-white py-16 border-t border-stone-800">
      <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-4 gap-12">
        <div>
          <div className="text-2xl font-serif font-bold tracking-tighter mb-6 leading-none text-white">
            Gadányi<br/><span className="text-emerald-500 text-xl">Vendégház és Lovarda</span>
          </div>
          <p className="text-stone-400 text-sm leading-relaxed">
            Pihenés, lovaglás és természetközeli élmények Komlón. <br/>
            <span className="opacity-50 mt-2 block">NTAK: MA19005093</span>
          </p>
        </div>
        
        <div>
          <h4 className="font-bold mb-6 text-lg text-emerald-50">Elérhetőség</h4>
          <ul className="space-y-4 text-stone-400 text-sm">
            <li className="flex items-start gap-3">
               <MapPin size={16} className="text-emerald-500 mt-1 flex-shrink-0" /> 
               <span>7300 Komló, Batthyány utca 24.</span>
            </li>
            <li className="flex items-start gap-3">
               <Phone size={16} className="text-emerald-500 mt-1 flex-shrink-0" /> 
               <div className="flex flex-col gap-1">
                  <a href="tel:+36703308959" className="hover:text-emerald-400 transition-colors">+36 70 330 8959</a>
                  <a href="tel:+36706290102" className="hover:text-emerald-400 transition-colors">+36 70 629 0102</a>
               </div>
            </li>
            <li className="flex items-center gap-3">
               <Mail size={16} className="text-emerald-500 flex-shrink-0" /> 
               <a href="mailto:info@gadanyilovarda.hu" className="hover:text-emerald-400 transition-colors">info@gadanyilovarda.hu</a>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="font-bold mb-6 text-lg text-emerald-50">Menü</h4>
          <ul className="space-y-4 text-stone-400 text-sm">
            <li><a href="#home" className="hover:text-emerald-500 transition">Kezdőlap</a></li>
            <li><a href="#rooms" className="hover:text-emerald-500 transition">Szobák & Árak</a></li>
            <li><a href="#services" className="hover:text-emerald-500 transition">Lovarda</a></li>
            <li><a href="#" className="hover:text-emerald-500 transition">Adatkezelés</a></li>
          </ul>
        </div>

        <div>
          <h4 className="font-bold mb-6 text-lg text-emerald-50">Közösség</h4>
          <div className="flex gap-4">
            <a href="#" className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-emerald-600 transition-colors group">
              <FaInstagram size={20} className="group-hover:scale-110 transition-transform"/>
            </a>
            <a href="#" className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors group">
              <FaFacebook size={20} className="group-hover:scale-110 transition-transform"/>
            </a>
          </div>
        </div>
      </div>
      <div className="border-t border-white/10 mt-16 pt-8 text-center text-stone-600 text-xs">
        © 2024 Gadányi Vendégház és Lovarda. Minden jog fenntartva.
      </div>
    </footer>
  );
}
