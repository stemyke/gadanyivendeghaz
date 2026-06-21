'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Calendar, ChevronDown } from 'lucide-react';

export default function Hero() {
  const [offsetY, setOffsetY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setOffsetY(window.scrollY);
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  return (
    <header id="home" className="relative h-screen flex items-center justify-center overflow-hidden group">
      <div className="absolute inset-0 overflow-hidden bg-stone-900">
        <Image 
          src="/images/hero-bg.webp" 
          alt="Gadányi Vendégház és Lovarda"
          fill
          priority
          className="object-cover opacity-80 animate-ken-burns"
          style={{ transform: `scale(1.1) translateY(${offsetY * 0.5}px)` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/20 to-black/60"></div>
      </div>
      
      <div className="relative z-10 text-center text-white px-4 max-w-4xl mx-auto mt-16">
        <div className="mb-4 text-emerald-300 font-medium tracking-[0.2em] uppercase text-sm animate-slide-up flex items-center justify-center gap-2">
          <span className="w-8 h-[1px] bg-emerald-300"></span>
          Komló, Mecsek
          <span className="w-8 h-[1px] bg-emerald-300"></span>
        </div>
        <h1 className="text-5xl md:text-7xl font-serif font-bold mb-6 leading-tight animate-slide-up drop-shadow-lg" style={{animationDelay: '0.1s'}}>
          Gadányi Vendégház<br/>és Lovarda
        </h1>
        <p className="text-lg md:text-xl text-stone-200 mb-10 max-w-2xl mx-auto animate-slide-up font-light" style={{animationDelay: '0.2s'}}>
          Ébredjen madárcsicsergésre 8 hektáros birtokunkon, közvetlenül az erdő és a halastavak ölelésében.
        </p>
        <div className="flex flex-col md:flex-row gap-4 justify-center animate-slide-up" style={{animationDelay: '0.3s'}}>
          {/*noinspection HtmlUnknownAnchorTarget*/}
          <a href="#booking" className="bg-emerald-700 hover:bg-emerald-600 text-white px-8 py-4 rounded-full font-medium transition-all transform hover:scale-105 flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/20">
            <Calendar size={18} /> Ajánlatkérés
          </a>
          {/*noinspection HtmlUnknownAnchorTarget*/}
          <a href="#services" className="bg-white/10 backdrop-blur-md hover:bg-white/20 text-white border border-white/30 px-8 py-4 rounded-full font-medium transition-all flex items-center justify-center gap-2">
            Szolgáltatásaink
          </a>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 text-white animate-bounce-slow opacity-80 cursor-pointer" onClick={() => window.scrollTo({top: window.innerHeight, behavior: 'smooth'})}>
        <ChevronDown size={32} />
      </div>
    </header>
  );
}
