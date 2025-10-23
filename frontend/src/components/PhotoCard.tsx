// components/PhotoCard.tsx
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Heart, Trophy, User, Clock, Check } from 'lucide-react';
import { Photo } from '@/services/votingApi';
import { useAuthStore } from '@/stores/authStore';

interface PhotoCardProps {
    photo: Photo;
    onVote: (photoId: string) => Promise<boolean>;
    canVote: boolean;
    hasUserVoted: boolean;
    isUserVotedPhoto: boolean;
    isLoading?: boolean;
}

export default function PhotoCard({
    photo,
    onVote,
    canVote,
    hasUserVoted,
    isUserVotedPhoto,
    isLoading = false
}: PhotoCardProps) {
    const [isVoting, setIsVoting] = useState(false);
    const { isAdmin } = useAuthStore();

    const handleVote = async () => {
        if (!canVote || isVoting) return;

        setIsVoting(true);
        try {
            await onVote(photo.id);
        } finally {
            setIsVoting(false);
        }
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
        <Card className={`group relative overflow-hidden transition-all duration-300 hover:shadow-lg ${isUserVotedPhoto ? 'ring-2 ring-blue-500 bg-blue-50' : ''
            }`}>
            {getWinnerBadge()}

            <div className="relative aspect-square overflow-hidden bg-gray-100">
                <img
                    src={photo.url}
                    alt={photo.name}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    loading="lazy"
                />

                {isUserVotedPhoto && (
                    <div className="absolute inset-0 bg-blue-600 bg-opacity-20 flex items-center justify-center">
                        <div className="bg-white rounded-full p-2">
                            <Check className="h-6 w-6 text-blue-600" />
                        </div>
                    </div>
                )}
            </div>

            <CardContent className="p-4">
                <h3 className="font-semibold text-lg mb-2 line-clamp-2">
                    {photo.name}
                </h3>

                {/* Participant Info - Only show for admins */}
                {photo.participantName && isAdmin() && (
                    <div className="flex items-center text-sm text-gray-600 mb-2">
                        <User className="h-4 w-4 mr-1" />
                        <span>{photo.participantName}</span>
                    </div>
                )}

                <div className="flex items-center text-sm text-gray-500 mb-3">
                    <Clock className="h-4 w-4 mr-1" />
                    <span>{new Date(photo.uploadedAt).toLocaleDateString()}</span>
                </div>

                <div className="flex items-center justify-between">
                    <div className="flex items-center text-sm">
                        <Heart className={`h-4 w-4 mr-1 ${photo.voteCount > 0 ? 'text-red-500' : 'text-gray-400'}`} />
                        <span className="font-medium">
                            {photo.voteCount} {photo.voteCount === 1 ? 'vote' : 'votes'}
                        </span>
                    </div>

                    {isAdmin() && (
                        <Badge variant="secondary">
                            Votes: {photo.voteCount}
                        </Badge>
                    )}
                </div>
            </CardContent>

            <CardFooter className="p-4 pt-0">
                {canVote && !hasUserVoted ? (
                    <Button
                        onClick={handleVote}
                        disabled={isVoting || isLoading}
                        className="w-full"
                        variant="default"
                    >
                        {isVoting ? (
                            <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                Voting...
                            </>
                        ) : (
                            <>
                                <Heart className="h-4 w-4 mr-2" />
                                Vote for this photo
                            </>
                        )}
                    </Button>
                ) : hasUserVoted ? (
                    <div className="w-full text-center">
                        {isUserVotedPhoto ? (
                            <Badge className="bg-blue-600 text-white">
                                <Check className="h-4 w-4 mr-1" />
                                Your Vote
                            </Badge>
                        ) : (
                            <Badge variant="secondary">
                                Voting Complete
                            </Badge>
                        )}
                    </div>
                ) : (
                    <Badge variant="outline" className="w-full justify-center">
                        Voting Not Active
                    </Badge>
                )}
            </CardFooter>
        </Card>
    );
}