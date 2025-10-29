'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Photo } from '@/services/votingApi';
import { useUser } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { 
    X, 
    ChevronLeft, 
    ChevronRight,
    Heart,
    Trophy
} from 'lucide-react';

interface PhotoSliderProps {
    photos: Photo[];
    initialPhotoIndex: number;
    isOpen: boolean;
    onClose: () => void;
    onVote: (photoId: string) => Promise<boolean>;
    canVote: boolean;
    votingActive?: boolean;
    getUserVotedPhotoId?: () => string | null;
}

export default function PhotoSlider({
    photos,
    initialPhotoIndex,
    isOpen,
    onClose,
    onVote,
    canVote,
    votingActive = false,
    getUserVotedPhotoId
}: PhotoSliderProps) {
    const [currentIndex, setCurrentIndex] = useState(initialPhotoIndex);
    const [isVoting, setIsVoting] = useState(false);
    const { user } = useUser();
    const currentPhoto = photos[currentIndex];
    
    const userVotedPhotoId = getUserVotedPhotoId?.();
    const hasUserVoted = !!userVotedPhotoId;
    const isUserVotedPhoto = userVotedPhotoId === currentPhoto?.id;

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

    const handleVote = async () => {
        if (isVoting || !votingActive || !currentPhoto) return;

        setIsVoting(true);
        try {
            const success = await onVote(currentPhoto.id);
            if (success) {
                if (hasUserVoted && !isUserVotedPhoto) {
                    toast.success('Vote changed successfully!');
                } else if (isUserVotedPhoto) {
                    toast.info('You have already voted for this photo');
                } else {
                    toast.success('Vote cast successfully!');
                }
            }
        } finally {
            setIsVoting(false);
        }
    };

    const getWinnerBadge = () => {
        if (!currentPhoto?.isWinner) return null;

        const positions = [
            { label: '1st Place', color: 'bg-gradient-to-r from-yellow-400 to-yellow-600', icon: '🥇' },
            { label: '2nd Place', color: 'bg-gradient-to-r from-gray-300 to-gray-500', icon: '🥈' },
            { label: '3rd Place', color: 'bg-gradient-to-r from-orange-400 to-orange-600', icon: '🥉' }
        ];
        const position = currentPhoto.winnerPosition ? currentPhoto.winnerPosition - 1 : 0;
        const winner = positions[position];

        return (
            <div className={`${winner.color} text-white px-3 py-1 rounded-lg shadow-md flex items-center gap-1 text-xs font-medium`}>
                <Trophy className="h-4 w-4" />
                {winner.label}
            </div>
        );
    };

    if (!isOpen || !currentPhoto) return null;

    return (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-95 flex items-center justify-center">
            {/* Close Button */}
            <Button
                onClick={onClose}
                variant="ghost"
                size="sm"
                className="absolute top-4 right-4 z-10 text-white hover:bg-white hover:bg-opacity-20 transition-all"
            >
                <X className="h-6 w-6" />
            </Button>

            {/* Navigation Buttons */}
            {photos.length > 1 && (
                <>
                    <Button
                        onClick={goToPrevious}
                        variant="ghost"
                        size="sm"
                        className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 text-white hover:bg-white hover:bg-opacity-20 transition-all"
                    >
                        <ChevronLeft className="h-8 w-8" />
                    </Button>

                    <Button
                        onClick={goToNext}
                        variant="ghost"
                        size="sm"
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 text-white hover:bg-white hover:bg-opacity-20 transition-all"
                    >
                        <ChevronRight className="h-8 w-8" />
                    </Button>
                </>
            )}

            {/* Photo Counter */}
            <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10 bg-black bg-opacity-70 text-white px-4 py-2 rounded-full text-sm font-medium">
                {currentIndex + 1} / {photos.length}
            </div>

            {/* Main Content */}
            <div className="max-w-6xl w-full mx-4 flex flex-col items-center gap-6">
                {/* Image Container */}
                <div className="relative">
                    <img
                        src={currentPhoto.url}
                        alt={currentPhoto.name}
                        className="max-h-[70vh] max-w-[90vw] object-contain rounded-lg shadow-2xl"
                    />
                </div>

                {/* Info Section */}
                <div className="flex flex-col items-center text-white gap-3">
                    {/* Winner Badge */}
                    {getWinnerBadge() && (
                        <div className="mb-1">
                            {getWinnerBadge()}
                        </div>
                    )}

                    {/* Title and Category */}
                    <div className="flex items-center gap-2">
                        <h2 className="text-sm font-medium text-gray-200">
                            {currentPhoto.name}
                        </h2>
                        {currentPhoto.category && (
                            <Badge variant="secondary" className="text-xs font-medium bg-white/20 text-white">
                                {currentPhoto.category}
                            </Badge>
                        )}
                    </div>

                    {/* Participant Info (Admin Only) */}
                    {currentPhoto.participantName && user?.role === 'ADMIN' && (
                        <div className="text-xs text-gray-400">
                            {currentPhoto.participantName}
                            {currentPhoto.participantEmail && (
                                <span> ({currentPhoto.participantEmail})</span>
                            )}
                        </div>
                    )}

                    {/* Voting and Vote Count */}
                    <div className="flex items-center gap-6 mt-2">
                        {votingActive ? (
                            <button
                                onClick={handleVote}
                                disabled={isVoting}
                                className="p-2 hover:bg-white/10 rounded-full transition-colors"
                            >
                                <Heart
                                    className={`h-6 w-6 ${isUserVotedPhoto ? 'text-red-500 fill-red-500' : 'text-white'}`}
                                />
                            </button>
                        ) : (
                            <p className="text-sm text-gray-400 font-medium">Voting is closed</p>
                        )}

                        {user?.role === 'ADMIN' && (
                            <div className="flex items-center gap-1 text-sm text-gray-200">
                                <Heart className="h-4 w-4 text-red-500 fill-red-500" />
                                <span>{currentPhoto.voteCount} {currentPhoto.voteCount === 1 ? 'vote' : 'votes'}</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}