'use client';

import React, { useState, useEffect } from 'react';
import Navigation from './Navigation';
import Hero from './Hero';
import Introduction from './Introduction';
import Features from './Features';
import RoomsSection from './RoomsSection';
import BookingSection from './BookingSection';
import Gallery from './Gallery';
import Footer from './Footer';

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

    // Futás azonnal mount-kor az induló scrollhelyzet (pl. hash linkek) észleléséhez
    handleScroll();

    // Késleltetett futtatás a böngésző aszinkron hash-re ugrásának lefedéséhez
    const timer = setTimeout(handleScroll, 100);

    window.addEventListener('scroll', handleScroll);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <div className="font-sans text-stone-800 bg-stone-50 min-h-screen selection:bg-emerald-200">
      <Navigation scrolled={scrolled} mobileMenuOpen={mobileMenuOpen} setMobileMenuOpen={setMobileMenuOpen} />
      <Hero offsetY={offsetY} />
      <Introduction />
      <Features />
      <Gallery images={galleryImages} />
      <RoomsSection />
      <BookingSection />
      <Footer />
    </div>
  );
}
