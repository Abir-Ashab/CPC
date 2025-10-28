'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

interface Photo {
  id: string;
  name: string;
  url: string;
  uploadedAt: string;
}

interface PhotoGalleryProps {
  refreshTrigger: number;
}

export default function PhotoGallery({ refreshTrigger }: PhotoGalleryProps) {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPhotos = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/photos');
      if (response.ok) {
        const data = await response.json();
        setPhotos(data.photos);
      }
    } catch (error) {
      console.error('Error fetching photos:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPhotos();
  }, [refreshTrigger]);

  const deletePhoto = async (photoId: string) => {
    if (!confirm('Are you sure you want to delete this photo?')) return;

    try {
      const response = await fetch(`/api/photos/${photoId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setPhotos(photos.filter(photo => photo.id !== photoId));
      } else {
        alert('Failed to delete photo');
      }
    } catch (error) {
      console.error('Error deleting photo:', error);
      alert('Failed to delete photo');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (photos.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No photos uploaded yet.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4">
      {photos.map((photo) => (
        <div key={photo.id} className="relative group">
          <div className="aspect-square relative overflow-hidden rounded-lg bg-gray-100">
            <Image
              src={photo.url}
              alt={photo.name}
              fill
              className="object-cover transition-transform group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
            />
          </div>
          
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-opacity flex items-center justify-center">
            <div className="opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => deletePhoto(photo.id)}
                className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm"
              >
                Delete
              </button>
            </div>
          </div>
          
          <div className="mt-2">
            <p className="text-sm text-gray-600 truncate">{photo.name}</p>
            <p className="text-xs text-gray-400">
              {new Date(photo.uploadedAt).toLocaleDateString()}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}