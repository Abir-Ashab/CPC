'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Heart, Trophy, User, Clock, Check, Eye } from 'lucide-react';
import { Photo } from '@/services/votingApi';
import { useUser } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface PhotoCardProps {
    photo: Photo;
    onVote: (photoId: string) => Promise<boolean>;
    canVote: boolean;
    hasUserVoted: boolean;
    isUserVotedPhoto: boolean;
    isLoading?: boolean;
    onClick?: () => void;
    votingActive?: boolean;
}

export default function PhotoCard({
    photo,
    onVote,
    canVote,
    hasUserVoted,
    isUserVotedPhoto,
    isLoading = false,
    onClick,
    votingActive = true
}: PhotoCardProps) {
    const [isVoting, setIsVoting] = useState(false);
    const [imageLoaded, setImageLoaded] = useState(false);
    const { user } = useUser();

    const handleVote = async () => {
        if (!canVote || isVoting || !votingActive) return;

        setIsVoting(true);
        try {
            const success = await onVote(photo.id);
            if (success) {
                toast.success('Vote cast successfully!');
            }
        } finally {
            setIsVoting(false);
        }
    };

    const handleImageError = () => {
        toast.error('Failed to load image', {
            description: 'Please try refreshing the page.'
        });
    };

    const getWinnerBadge = () => {
        if (!photo.isWinner) return null;

        const positions = ['1st', '2nd', '3rd'];
        const colors = ['bg-yellow-500', 'bg-gray-400', 'bg-orange-600'];
        const position = photo.winnerPosition ? photo.winnerPosition - 1 : 0;

        return (
            <Badge className={`${colors[position]} text-white absolute top-2 left-2 z-10`}>
                <Trophy className="h-3 w-3 mr-1" />
                {positions[position]} Place
            </Badge>
        );
    };

    return (
        <Card className={`group relative overflow-hidden transition-all duration-300 hover:shadow-lg border-2 ${isUserVotedPhoto
            ? 'border-blue-500 bg-blue-50 shadow-md'
            : photo.isWinner
                ? 'border-yellow-300 bg-yellow-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}>
            {getWinnerBadge()}

            <div 
                className="relative aspect-square overflow-hidden bg-gray-100 cursor-pointer"
                onClick={onClick}
            >
                {!imageLoaded && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-200">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-600"></div>
                    </div>
                )}
                <img
                    src={photo.url}
                    alt={photo.name}
                    className={`w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 ${imageLoaded ? 'opacity-100' : 'opacity-0'
                        }`}
                    loading="lazy"
                    onLoad={() => setImageLoaded(true)}
                    onError={handleImageError}
                />

                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <Eye className="h-8 w-8 text-white" />
                </div>

                {isUserVotedPhoto && (
                    <div className="absolute top-2 right-2 z-10">
                        <Badge className="bg-blue-600 text-white">
                            <Check className="h-3 w-3 mr-1" />
                            Your Vote
                        </Badge>
                    </div>
                )}
            </div>

            <CardContent className="p-4">

                <h3 className="font-semibold text-lg mb-2 line-clamp-2 text-gray-900">
                    {photo.name}
                </h3>

                {photo.participantName && user?.role === 'ADMIN' && (
                    <div className="flex items-center text-sm text-gray-600 mb-2">
                        <User className="h-4 w-4 mr-1" />
                        <span className="font-medium">{photo.participantName}</span>
                        {photo.participantEmail && (
                            <span className="text-gray-500 ml-2">({photo.participantEmail})</span>
                        )}
                    </div>
                )}

                <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                    <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        <span>{new Date(photo.uploadedAt).toLocaleDateString()}</span>
                    </div>
                    {photo.category && (
                        <Badge variant="secondary" className="text-xs">
                            {photo.category}
                        </Badge>
                    )}
                </div>


                <div className="flex items-center justify-between">
                    <div className="flex items-center text-sm">
                        {user?.role === 'ADMIN' && (
                        <span className="font-medium text-gray-900">
                            <Heart className={`h-4 w-4 mr-1 ${photo.voteCount > 0 ? 'text-red-500 fill-red-500' : 'text-gray-400'}`} />
                            {photo.voteCount} {photo.voteCount === 1 ? 'vote' : 'votes'}
                        </span>
                        )}
                    </div>
                </div>
            </CardContent>

            <CardFooter className="p-4 pt-0">
                {canVote && !hasUserVoted && votingActive ? (
                    <Button
                        onClick={handleVote}
                        disabled={isVoting || isLoading}
                        className="w-full bg-black text-white"
                        size="lg"
                    >
                        {isVoting ? (
                            <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                Voting...
                            </>
                        ) : (
                            <>
                                <Heart className="h-4 w-4 mr-2" />
                                Vote Now
                            </>
                        )}
                    </Button>
                ) : hasUserVoted ? (
                    <div className="w-full text-center">
                        {isUserVotedPhoto ? (
                            <Badge className="bg-green-600 text-white px-4 py-2 text-sm">
                                <Check className="h-4 w-4 mr-1" />
                                You Voted for This
                            </Badge>
                        ) : (
                            <Badge variant="secondary" className="px-4 py-2 text-sm">
                                Vote Submitted
                            </Badge>
                        )}
                    </div>
                ) : (
                    <Badge variant="outline" className="w-full justify-center py-2 text-sm">
                        {votingActive ? 'Vote Now' : 'Voting Closed'}
                    </Badge>
                )}
            </CardFooter>
        </Card>
    );
}