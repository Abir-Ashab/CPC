'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { useVotingStore } from '@/stores/votingStore';
import PhotoCard from '@/components/PhotoCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
    Trophy, 
    Clock, 
    Users, 
    Heart, 
    AlertCircle, 
    CheckCircle, 
    RefreshCcw 
} from 'lucide-react';

export default function Voting() {
    const { user, isAuthenticated } = useAuthStore();
    const {
        photos,
        votingSettings,
        userVote,
        isLoading,
        error,
        fetchPhotos,
        fetchVotingSettings,
        fetchUserVote,
        vote,
        clearError,
        canVote,
        hasVoted,
        getUserVotedPhotoId,
        isVotingActive
    } = useVotingStore();
    
    const router = useRouter();
    const [isRefreshing, setIsRefreshing] = useState(false);

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/login');
            return;
        }

        // Fetch initial data
        const fetchData = async () => {
            await Promise.all([
                fetchPhotos(),
                fetchVotingSettings(),
                fetchUserVote()
            ]);
        };

        fetchData();
    }, [isAuthenticated, router]);

    const handleVote = async (photoId: string) => {
        const success = await vote(photoId);
        if (success) {
            // Show success feedback
            setTimeout(() => {
                clearError();
            }, 3000);
        }
        return success;
    };

    const handleRefresh = async () => {
        setIsRefreshing(true);
        try {
            await Promise.all([
                fetchPhotos(),
                fetchVotingSettings(),
                fetchUserVote()
            ]);
        } finally {
            setIsRefreshing(false);
        }
    };

    if (!isAuthenticated || !user) {
        return null;
    }

    const votedPhotoId = getUserVotedPhotoId();
    const votingIsActive = isVotingActive();
    const userCanVote = canVote();
    const userHasVoted = hasVoted();

    return (
        <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">
                            Photography Contest
                        </h1>
                        <p className="text-gray-600">
                            Vote for your favorite photo
                        </p>
                    </div>
                    
                    <Button
                        onClick={handleRefresh}
                        variant="outline"
                        disabled={isRefreshing}
                        className="flex items-center"
                    >
                        <RefreshCcw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                        Refresh
                    </Button>
                </div>

                {/* Voting Status */}
                <div className="flex flex-wrap gap-4 mb-6">
                    <Badge variant={votingIsActive ? "default" : "secondary"} className="px-3 py-1">
                        <Clock className="h-4 w-4 mr-1" />
                        {votingIsActive ? 'Voting Active' : 'Voting Closed'}
                    </Badge>
                    
                    <Badge variant="outline" className="px-3 py-1">
                        <Users className="h-4 w-4 mr-1" />
                        {photos.length} Photos
                    </Badge>
                    
                    <Badge variant="outline" className="px-3 py-1">
                        <Heart className="h-4 w-4 mr-1" />
                        {photos.reduce((sum, photo) => sum + photo.voteCount, 0)} Total Votes
                    </Badge>
                    
                    {userHasVoted && (
                        <Badge variant="default" className="bg-green-600 px-3 py-1">
                            <CheckCircle className="h-4 w-4 mr-1" />
                            You have voted
                        </Badge>
                    )}
                </div>

                {/* Voting Instructions */}
                {!userHasVoted && votingIsActive && (
                    <Alert className="bg-blue-50 border-blue-200">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                            You can vote for <strong>one photo</strong> only. Choose carefully!
                        </AlertDescription>
                    </Alert>
                )}

                {userHasVoted && (
                    <Alert className="bg-green-50 border-green-200">
                        <CheckCircle className="h-4 w-4" />
                        <AlertDescription>
                            Thank you for voting! You voted for "{photos.find(p => p.id === votedPhotoId)?.name}".
                        </AlertDescription>
                    </Alert>
                )}

                {!votingIsActive && (
                    <Alert className="bg-orange-50 border-orange-200">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                            {votingSettings?.resultsPublished 
                                ? 'Voting has ended. Check the results page to see the winners!'
                                : 'Voting is currently not active. Please wait for the voting period to begin.'
                            }
                        </AlertDescription>
                    </Alert>
                )}
            </div>

            {/* Error Display */}
            {error && (
                <Alert className="bg-red-50 border-red-200 mb-6" variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="flex items-center justify-between">
                        <span>{error}</span>
                        <Button 
                            onClick={clearError} 
                            variant="ghost" 
                            size="sm"
                            className="text-red-600 hover:text-red-800"
                        >
                            Dismiss
                        </Button>
                    </AlertDescription>
                </Alert>
            )}

            {/* Loading State */}
            {isLoading && photos.length === 0 && (
                <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                        <p className="text-gray-600">Loading photos...</p>
                    </div>
                </div>
            )}

            {/* No Photos State */}
            {!isLoading && photos.length === 0 && !error && (
                <div className="text-center py-12">
                    <Trophy className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Photos Yet</h3>
                    <p className="text-gray-600">Photos will appear here once they are uploaded.</p>
                </div>
            )}

            {/* Photo Grid */}
            {photos.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {photos.map((photo) => (
                        <PhotoCard
                            key={photo.id}
                            photo={photo}
                            onVote={handleVote}
                            canVote={userCanVote}
                            hasUserVoted={userHasVoted}
                            isUserVotedPhoto={photo.id === votedPhotoId}
                            isLoading={isLoading}
                        />
                    ))}
                </div>
            )}

            {/* Footer */}
            {photos.length > 0 && (
                <div className="mt-12 pt-8 border-t text-center text-gray-500 text-sm">
                    <p>
                        {userHasVoted 
                            ? `You voted for "${photos.find(p => p.id === votedPhotoId)?.name}". Thank you for participating!`
                            : votingIsActive 
                                ? 'Make sure to vote before the voting period ends!'
                                : 'Voting is not currently active.'
                        }
                    </p>
                </div>
            )}
        </div>
    );
}