'use client';

import { useState } from 'react';
import PhotoCard from '@/components/modules/photo/PhotoCard';
import PhotoSlider from '@/components/modules/photo/PhotoSlider';
import VotingCountdown from '../../components/modules/voting/VotingCountdown';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useVotingState, useVote, usePhotos } from '@/hooks/useVoting';
import { Photo } from '@/services/votingApi';
import {
    Trophy,
    AlertCircle,
    CheckCircle,
    Filter
} from 'lucide-react';
import { withAuth } from '@/utils/withAuth';

function Voting() {
    const {
        photos,
        settings,
        canVote,
        hasVoted,
        votedPhotoId,
        votingActive,
    } = useVotingState();

    const { isLoading, error, refetch } = usePhotos();
    const voteMutation = useVote();
    const [selectedCategory, setSelectedCategory] = useState<string>('All');
    const [sliderOpen, setSliderOpen] = useState(false);
    const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);

    const categories = ['All', 'Cefalo', 'Nature', 'Cityscape'];
    const categoryLabels: { [key: string]: string } = {
        'All': 'All',
        'Cefalo': 'Cefalo',
        'Nature': 'Nature',
        'Cityscape': 'Cityscape'
    };

    const filteredPhotos = selectedCategory === 'All'
        ? photos
        : photos.filter((photo: Photo) => photo.category === selectedCategory);

    const handleVote = async (photoId: string) => {
        try {
            await voteMutation.mutateAsync(photoId);
            await refetch();
            return true;
        } catch (error) {
            return false;
        }
    };

    const handlePhotoClick = (photoIndex: number) => {
        setSelectedPhotoIndex(photoIndex);
        setSliderOpen(true);
    };

    const closeSlider = () => {
        setSliderOpen(false);
    };

    return (
        <div className="max-w-7xl mx-auto">
            <div className="mb-8">
                <VotingCountdown 
                    endTime={settings?.votingEndTime} 
                    isActive={votingActive} 
                />
                <div className="mb-6">
                    <div className="flex flex-wrap gap-2">
                            {categories.map((category) => {
                                const categoryName = category || 'Unknown';
                                return (
                                    <Button
                                        key={categoryName}
                                        onClick={() => setSelectedCategory(categoryName)}
                                        variant={selectedCategory === categoryName ? "default" : "outline"}
                                        size="sm"
                                        className="text-sm"
                                    >
                                        {categoryLabels[categoryName] || categoryName}
                                    </Button>
                                );
                            })}
                        </div>
                </div>
            </div>

            {
                error instanceof Error && (
                    <Alert className="bg-red-50 border-red-200 mb-6" variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription className="flex items-center justify-between">
                            <span>{error.message}</span>
                            <Button
                                onClick={() => refetch()}
                                variant="ghost"
                                size="sm"
                                className="text-red-600 hover:text-red-800"
                            >
                                Retry
                            </Button>
                        </AlertDescription>
                    </Alert>
                )
            }

            {
                isLoading && photos.length === 0 && (
                    <div className="flex items-center justify-center py-12">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                            <p className="text-gray-600">Loading photos...</p>
                        </div>
                    </div>
                )
            }

            {
                !isLoading && photos.length === 0 && !error && (
                    <div className="text-center py-12">
                        <Trophy className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No Photos Yet</h3>
                        <p className="text-gray-600">Photos will appear here once they are uploaded.</p>
                    </div>
                )
            }

            {
                photos.length > 0 && (
                    <>
                        {filteredPhotos.length === 0 ? (
                            <div className="text-center py-12">
                                <Filter className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-gray-900 mb-2">No Photos in this Category</h3>
                                <p className="text-gray-600">Try selecting a different category to see photos.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {filteredPhotos.map((photo: Photo, index: number) => (
                                    <PhotoCard
                                        key={photo.id}
                                        photo={photo}
                                        onVote={handleVote}
                                        canVote={!!canVote}
                                        hasUserVoted={hasVoted}
                                        isUserVotedPhoto={photo.id === votedPhotoId}
                                        isLoading={voteMutation.isPending || isLoading}
                                        onClick={() => handlePhotoClick(index)}
                                    />
                                ))}
                            </div>
                        )}
                    </>
                )
            }

            {
                photos.length > 0 && (
                    <div className="mt-12 pt-8 border-t text-center text-gray-500 text-sm">
                        <p>
                            {hasVoted
                                ? `You voted for "${photos.find((p: Photo) => p.id === votedPhotoId)?.name}". Thank you for participating!`
                                : votingActive
                                    ? 'Make sure to vote before the voting period ends!'
                                    : 'Voting is not currently active.'
                            }
                        </p>
                    </div>
                )
            }

            <PhotoSlider
                photos={filteredPhotos}
                initialPhotoIndex={selectedPhotoIndex}
                isOpen={sliderOpen}
                onClose={closeSlider}
            />
        </div >
    );
}

export default withAuth(Voting);