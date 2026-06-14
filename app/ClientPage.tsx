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
      <Gallery images={galleryImages} />
      <RoomsSection />
      <BookingSection />
      <Footer />
    </div>
  );
}
