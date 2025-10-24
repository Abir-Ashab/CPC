'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Photo } from '@/services/votingApi';
import { 
    X, 
    ChevronLeft, 
    ChevronRight, 
} from 'lucide-react';

interface PhotoSliderProps {
    photos: Photo[];
    initialPhotoIndex: number;
    isOpen: boolean;
    onClose: () => void;
}

export default function PhotoSlider({
    photos,
    initialPhotoIndex,
    isOpen,
    onClose,
}: PhotoSliderProps) {
    const [currentIndex, setCurrentIndex] = useState(initialPhotoIndex);
    const currentPhoto = photos[currentIndex];

    useEffect(() => {
        setCurrentIndex(initialPhotoIndex);
    }, [initialPhotoIndex]);

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (!isOpen) return;
            
            switch (event.key) {
                case 'Escape':
                    onClose();
                    break;
                case 'ArrowLeft':
                    goToPrevious();
                    break;
                case 'ArrowRight':
                    goToNext();
                    break;
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, currentIndex]);

    const goToNext = () => {
        if (photos.length <= 1) return;
        setCurrentIndex((prev) => (prev + 1) % photos.length);
    };

    const goToPrevious = () => {
        if (photos.length <= 1) return;
        setCurrentIndex((prev) => (prev - 1 + photos.length) % photos.length);
    };

    if (!isOpen || !currentPhoto) return null;

    return (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center">
            <Button
                onClick={onClose}
                variant="ghost"
                size="sm"
                className="absolute top-4 right-4 z-10 text-white hover:bg-white hover:bg-opacity-20"
            >
                <X className="h-6 w-6" />
            </Button>

            <Button
                onClick={goToPrevious}
                variant="ghost"
                size="sm"
                className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 text-white hover:bg-white hover:bg-opacity-20"
                disabled={photos.length <= 1}
            >
                <ChevronLeft className="h-8 w-8" />
            </Button>

            <Button
                onClick={goToNext}
                variant="ghost"
                size="sm"
                className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 text-white hover:bg-white hover:bg-opacity-20"
                disabled={photos.length <= 1}
            >
                <ChevronRight className="h-8 w-8" />
            </Button>

            <div className="max-w-4xl w-full mx-4 flex flex-col items-center">
                <div className="relative">
                    <img
                        src={currentPhoto.url}
                        alt={currentPhoto.name}
                        className="max-h-[80vh] max-w-[90vw] object-contain rounded-lg"
                    />
                </div>
            </div>
        </div>
    );
}