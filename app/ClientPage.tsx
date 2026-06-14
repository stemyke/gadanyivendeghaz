'use client';

import React, { useState, useEffect } from 'react';
import Navigation from '../components/Navigation';
import Hero from '../components/Hero';
import Introduction from '../components/Introduction';
import Features from '../components/Features';
import RoomsSection from '../components/RoomsSection';
import BookingSection from '../components/BookingSection';
import Gallery from '../components/Gallery';
import Footer from '../components/Footer';

interface ClientPageProps {
  galleryImages: string[];
}

export default function ClientPage({ galleryImages }: ClientPageProps) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [offsetY, setOffsetY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
      setOffsetY(window.scrollY);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="font-sans text-stone-800 bg-stone-50 min-h-screen selection:bg-emerald-200">
      <Navigation scrolled={scrolled} mobileMenuOpen={mobileMenuOpen} setMobileMenuOpen={setMobileMenuOpen} />
      <Hero offsetY={offsetY} />
      <Introduction />
      <Features />
      <Gallery images={galleryImages} maxImages={8} />
      <RoomsSection />
      <BookingSection />
      <Footer />

      {/* Styles for simple animations */}
      <style jsx global>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes ken-burns {
          0% { transform: scale(1); }
          50% { transform: scale(1.1); }
          100% { transform: scale(1); }
        }
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0) translateX(-50%); }
          50% { transform: translateY(10px) translateX(-50%); }
        }
        .animate-fade-in {
          animation: fade-in 0.5s ease-out forwards;
        }
        .animate-slide-up {
          opacity: 0;
          animation: slide-up 0.8s ease-out forwards;
        }
        .animate-ken-burns {
          animation: ken-burns 20s infinite alternate ease-in-out;
        }
        .animate-bounce-slow {
          animation: bounce-slow 2s infinite;
        }
      `}</style>
    </div>
  );
}
