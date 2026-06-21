import React from 'react';
import { getGalleryImages } from './actions/gallery';
import Navigation from '../components/Navigation';
import Hero from '../components/Hero';
import Introduction from '../components/Introduction';
import Features from '../components/Features';
import RoomsSection from '../components/RoomsSection';
import BookingSection from '../components/BookingSection';
import Gallery from '../components/Gallery';
import Footer from '../components/Footer';

export default async function Home() {
  const images = await getGalleryImages();

  return (
    <div className="font-sans text-stone-800 bg-stone-50 min-h-screen selection:bg-emerald-200">
      <Navigation />
      <Hero />
      <Introduction />
      <Features />
      <Gallery images={images} />
      <RoomsSection />
      <BookingSection />
      <Footer />
    </div>
  );
}
