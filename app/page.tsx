import React from 'react';
import { getGalleryImages } from './actions/gallery';
import ClientPage from './ClientPage';

export default async function Home() {
  const images = await getGalleryImages();

  return (
    <ClientPage galleryImages={images} />
  );
}
