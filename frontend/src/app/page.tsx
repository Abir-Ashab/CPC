'use client';

import { useState } from 'react';
import PhotoUpload from '../components/PhotoUpload';
import PhotoGallery from '../components/PhotoGallery';

export default function Home() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleUploadSuccess = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <main className="min-h-scree py-8">
      <h2 className='text-2xl text-center font-bold'>Welcome to Cefalo Photography Contest</h2>
    </main>
  );
}

{/* <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
  <div className="text-center mb-8">
    <h1 className="text-3xl font-bold text-gray-900 mb-2">
      Photo Gallery
    </h1>
    <p className="text-gray-600">
      Upload and manage your photos with ease
    </p>
  </div>

  <div className="mb-8">
    <PhotoUpload onUploadSuccess={handleUploadSuccess} />
  </div>

  <div className="bg-white rounded-lg shadow-sm p-6">
    <h2 className="text-xl font-semibold text-gray-900 mb-6">
      Your Photos
    </h2>
    <PhotoGallery refreshTrigger={refreshTrigger} />
  </div>
</div> */}