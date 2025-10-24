'use client';

import { useState, useMemo } from 'react';
import PhotoCard from '@/components/modules/photo/PhotoCard';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { useVotingState, useVote, usePhotos } from '@/hooks/useVoting';
import { Photo } from '@/services/votingApi';
import {
    Trophy,
    AlertCircle,
    CheckCircle,
    Filter,
    Clock,
    Users,
    Heart
} from 'lucide-react';
import { withAuth } from '@/utils/withAuth';
import { toast } from 'sonner';

function Voting() {
    const {
        photos,
        settings,
        canVote,
        hasVoted,
        votedPhotoId,
        votingActive,
        totalVotes,
        isLoading
    } = useVotingState();

    const { refetch } = usePhotos();
    const voteMutation = useVote();
    const [selectedCategory, setSelectedCategory] = useState<string>('All');

    // Handle undefined photos array
    const safePhotos = photos || [];
    
    // Fixed categories calculation using useMemo and Array.from
    const categories = useMemo(() => {
        const uniqueCategories = new Set<string>();
        safePhotos.forEach((photo: Photo) => {
            if (photo.category) {
                uniqueCategories.add(photo.category);
            }
        });
        return ['All', ...Array.from(uniqueCategories)];
    }, [safePhotos]);

    const categoryLabels: { [key: string]: string } = {
        'All': 'All Photos',
        'Cefalo': 'Cefalo',
        'Nature': 'Nature',
        'Cityscape': 'Cityscape',
    };

    const filteredPhotos = selectedCategory === 'All'
        ? safePhotos
        : safePhotos.filter((photo: Photo) => photo.category === selectedCategory);

    const handleVote = async (photoId: string) => {
        try {
            await voteMutation.mutateAsync(photoId);
            await refetch();
            const votedPhoto = safePhotos.find(p => p.id === photoId);
            toast.success(`Vote recorded for "${votedPhoto?.name}"!`, {
                description: 'Thank you for participating in the voting.'
            });
            return true;
        } catch (error: any) {
            toast.error('Failed to vote', {
                description: error.message || 'Please try again later.'
            });
            return false;
        }
    };

    const getTimeRemaining = () => {
        if (!settings?.votingEndTime) return null;

        const endTime = new Date(settings.votingEndTime).getTime();
        const now = new Date().getTime();
        const distance = endTime - now;

        if (distance <= 0) return 'Voting ended';

        const hours = Math.floor(distance / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));

        return `${hours}h ${minutes}m remaining`;
    };

    // Find the voted photo safely
    const votedPhoto = safePhotos.find((p: Photo) => p.id === votedPhotoId);

    return (
        <div className="max-w-7xl mx-auto p-6">
            {/* Header Section */}
            <div className="mb-8 text-center">
                <h1 className="text-4xl font-bold text-gray-900 mb-4">
                    Photo Voting Contest
                </h1>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                    Vote for your favorite photos! You can only vote once, so choose carefully.
                </p>
            </div>

            {/* Stats Bar */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <div className="bg-blue-50 rounded-lg p-4 text-center">
                    <div className="flex items-center justify-center mb-2">
                        <Users className="h-5 w-5 text-blue-600 mr-2" />
                        <span className="text-sm font-medium text-blue-900">Total Photos</span>
                    </div>
                    <div className="text-2xl font-bold text-blue-700">{safePhotos.length}</div>
                </div>

                <div className="bg-green-50 rounded-lg p-4 text-center">
                    <div className="flex items-center justify-center mb-2">
                        <Heart className="h-5 w-5 text-green-600 mr-2" />
                        <span className="text-sm font-medium text-green-900">Total Votes</span>
                    </div>
                    <div className="text-2xl font-bold text-green-700">{totalVotes}</div>
                </div>

                <div className={`rounded-lg p-4 text-center ${votingActive ? 'bg-orange-50' : 'bg-gray-50'}`}>
                    <div className="flex items-center justify-center mb-2">
                        <Clock className={`h-5 w-5 mr-2 ${votingActive ? 'text-orange-600' : 'text-gray-600'}`} />
                        <span className={`text-sm font-medium ${votingActive ? 'text-orange-900' : 'text-gray-900'}`}>
                            Status
                        </span>
                    </div>
                    <div className={`text-lg font-bold ${votingActive ? 'text-orange-700' : 'text-gray-700'}`}>
                        {votingActive ? (
                            <div className="flex flex-col">
                                <span>Voting Active</span>
                                {getTimeRemaining() && (
                                    <span className="text-sm font-normal mt-1">{getTimeRemaining()}</span>
                                )}
                            </div>
                        ) : (
                            'Voting Closed'
                        )}
                    </div>
                </div>
            </div>

            {/* Category Filter */}
            {safePhotos.length > 0 && (
                <div className="mb-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                            <Filter className="h-5 w-5 mr-2" />
                            Filter by Category
                        </h2>
                        <Badge variant="secondary" className="text-sm">
                            {filteredPhotos.length} {filteredPhotos.length === 1 ? 'photo' : 'photos'}
                        </Badge>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {categories.map((category) => {
                            const categoryName = category || 'Uncategorized';
                            return (
                                <Button
                                    key={categoryName}
                                    onClick={() => setSelectedCategory(categoryName)}
                                    variant={selectedCategory === categoryName ? "default" : "outline"}
                                    size="sm"
                                    className="text-sm transition-all"
                                >
                                    {categoryLabels[categoryName] || categoryName}
                                </Button>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Status Alerts */}
            <div className="mb-8 space-y-4">
                {!hasVoted && votingActive && (
                    <Alert className="bg-blue-50 border-blue-200">
                        <AlertCircle className="h-4 w-4 text-blue-600" />
                        <AlertDescription className="text-blue-800">
                            <strong>Ready to vote!</strong> You can vote for <strong>one photo</strong> only. Choose carefully!
                        </AlertDescription>
                    </Alert>
                )}

                {hasVoted && votedPhoto && (
                    <Alert className="bg-green-50 border-green-200">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <AlertDescription className="text-green-800">
                            <strong>Thank you for voting!</strong> You voted for "{votedPhoto.name}".
                            {settings?.resultsPublished && ' Check the results page to see the winners!'}
                        </AlertDescription>
                    </Alert>
                )}

                {!votingActive && (
                    <Alert className="bg-orange-50 border-orange-200">
                        <AlertCircle className="h-4 w-4 text-orange-600" />
                        <AlertDescription className="text-orange-800">
                            {settings?.resultsPublished
                                ? 'Voting has ended. Check the results page to see the winners!'
                                : 'Voting is currently not active. Please wait for the voting period to begin.'
                            }
                        </AlertDescription>
                    </Alert>
                )}
            </div>

            {/* Photos Grid */}
            {isLoading && safePhotos.length === 0 && (
                <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                        <p className="text-gray-600">Loading photos...</p>
                    </div>
                </div>
            )}

            {!isLoading && safePhotos.length === 0 && (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                    <Trophy className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Photos Available</h3>
                    <p className="text-gray-600 mb-4">Photos will appear here once they are uploaded for voting.</p>
                    <Button variant="outline" onClick={() => refetch()}>
                        Refresh
                    </Button>
                </div>
            )}

            {safePhotos.length > 0 && (
                <>
                    {filteredPhotos.length === 0 ? (
                        <div className="text-center py-12 bg-gray-50 rounded-lg">
                            <Filter className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No Photos in this Category</h3>
                            <p className="text-gray-600 mb-4">Try selecting a different category to see photos.</p>
                            <Button
                                variant="outline"
                                onClick={() => setSelectedCategory('All')}
                            >
                                Show All Photos
                            </Button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {filteredPhotos.map((photo: Photo) => (
                                <PhotoCard
                                    key={photo.id}
                                    photo={photo}
                                    onVote={handleVote}
                                    canVote={!!canVote}
                                    hasUserVoted={hasVoted}
                                    isUserVotedPhoto={photo.id === votedPhotoId}
                                    isLoading={voteMutation.isPending}
                                    votingActive={votingActive}
                                />
                            ))}
                        </div>
                    )}
                </>
            )}

            {/* Footer Info */}
            {safePhotos.length > 0 && (
                <div className="mt-12 pt-8 border-t text-center">
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-gray-600 text-sm">
                        <div className="flex items-center">
                            <Users className="h-4 w-4 mr-1" />
                            <span>{safePhotos.length} photos in contest</span>
                        </div>
                        <div className="flex items-center">
                            <Heart className="h-4 w-4 mr-1" />
                            <span>{totalVotes} total votes</span>
                        </div>
                        <div className="flex items-center">
                            <Clock className="h-4 w-4 mr-1" />
                            <span>
                                {votingActive
                                    ? (getTimeRemaining() || 'Voting active')
                                    : 'Voting closed'
                                }
                            </span>
                        </div>
                    </div>

                    {hasVoted && votedPhoto && (
                        <p className="mt-4 text-gray-500">
                            You voted for <strong>"{votedPhoto.name}"</strong>. Thank you for participating!
                        </p>
                    )}
                </div>
            )}
        </div>
    );
}

export default withAuth(Voting);