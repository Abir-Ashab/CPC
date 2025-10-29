'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Heart, Trophy, User, Clock, Check, Eye, Award, RefreshCw } from 'lucide-react';
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
    votingActive = false
}: PhotoCardProps) {
    const [isVoting, setIsVoting] = useState(false);
    const [imageLoaded, setImageLoaded] = useState(false);
    const { user } = useUser();

    const handleVote = async () => {
        if (isVoting || !votingActive) return;

        setIsVoting(true);
        try {
            const success = await onVote(photo.id);
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

    const handleImageError = () => {
        toast.error('Failed to load image', {
            description: 'Please try refreshing the page.'
        });
    };

    const getWinnerBadge = () => {
        if (!photo.isWinner) return null;

        const positions = [
            { label: '1st Place', color: 'bg-gradient-to-r from-yellow-400 to-yellow-600', icon: '🥇' },
            { label: '2nd Place', color: 'bg-gradient-to-r from-gray-300 to-gray-500', icon: '🥈' },
            { label: '3rd Place', color: 'bg-gradient-to-r from-orange-400 to-orange-600', icon: '🥉' }
        ];
        const position = photo.winnerPosition ? photo.winnerPosition - 1 : 0;
        const winner = positions[position];

        return (
            <div className={`${winner.color} text-white absolute top-1 left-3 z-10 px-3 py-1.5 rounded-lg shadow-lg flex items-center gap-1.5 text-sm font-semibold`}>
                <Trophy className="h-4 w-4" />
                {winner.label}
            </div>
        );
    };

    return (
        <Card className={`group flex flex-col justify-between relative overflow-hidden transition-all duration-300 hover:shadow-xl`}>
            {getWinnerBadge()}

            <CardHeader className="p-0">
                <div 
                    className="relative aspect-square overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 cursor-pointer"
                    onClick={onClick}
                >
                    {!imageLoaded && (
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="flex flex-col items-center gap-1">
                                <div className="animate-spin rounded-full h-10 w-10 border-4 border-gray-300 border-t-gray-700"></div>
                                <span className="text-sm text-gray-500 font-medium">Loading...</span>
                            </div>
                        </div>
                    )}
                    <img
                        src={photo.url}
                        alt={photo.name}
                        className={`w-full h-full object-cover transition-all duration-500 group-hover:scale-110 ${
                            imageLoaded ? 'opacity-100' : 'opacity-0'
                        }`}
                        loading="lazy"
                        onLoad={() => setImageLoaded(true)}
                        onError={handleImageError}
                    />

                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                        <Eye className="h-8 w-8 text-white" />
                    </div>
                </div>
            </CardHeader>

            <CardContent className="p-5">
                <div className="space-y-3">
                    <div className="flex flex-col justify-start">
                        <h3 className="font-bold text-lg line-clamp-2 text-gray-900 leading-tight mb-2">
                            {photo.name}
                        </h3>
                        
                    </div>

                    <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />
                    {photo.participantName && user?.role === 'ADMIN' && (
                        <div className="flex items-center gap-2 text-sm pt-1">
                            <div className="flex-1 min-w-0">
                                <p className="font-semibold text-gray-900 truncate">{photo.participantName}</p>
                                {photo.participantEmail && (
                                    <p className="text-xs text-gray-500 truncate">{photo.participantEmail}</p>
                                )}
                            </div>
                        </div>
                    )}

                    <div className="flex items-center justify-between text-sm pt-1">                       
                        {user?.role === 'ADMIN' && (
                            <div className="flex items-center gap-2">
                                <Heart className={`h-4 w-4 ${photo.voteCount > 0 ? 'text-red-500 fill-red-500' : 'text-gray-400'}`} />
                                <span className="font-bold text-gray-900">{photo.voteCount}</span>
                                <span className="text-gray-500 text-xs">{photo.voteCount === 1 ? 'vote' : 'votes'}</span>
                            </div>
                        )}
                        {photo.category && (
                            <Badge variant="secondary" className="text-xs font-medium w-fit">
                                {photo.category}
                            </Badge>
                        )}
                    </div>
                </div>
            </CardContent>

            <CardFooter className="p-5 pt-0">
                {votingActive ? (
                    <>
                        {!hasUserVoted ? (
                            <Button
                                onClick={handleVote}
                                disabled={isVoting || isLoading}
                                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-md hover:shadow-lg transition-all duration-300"
                                size="lg"
                            >
                                {isVoting ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                                        Submitting Vote...
                                    </>
                                ) : (
                                    <>
                                        <Heart className="h-5 w-5 mr-2" />
                                        Cast Your Vote
                                    </>
                                )}
                            </Button>
                        ) : (
                            <div className="w-full space-y-2">
                                {isUserVotedPhoto ? (
                                    <div className="bg-green-50 border-2 border-green-500 rounded-lg p-3 flex items-center justify-center gap-2">
                                        <Check className="h-5 w-5 text-green-600" />
                                        <span className="text-green-700 font-medium">Your Vote</span>
                                    </div>
                                ) : (
                                    <Button
                                        onClick={handleVote}
                                        disabled={isVoting || isLoading}
                                        variant="outline"
                                        className="w-full border-2 border-blue-500 text-blue-700 hover:bg-blue-50 transition-all duration-300"
                                        size="lg"
                                    >
                                        {isVoting ? (
                                            <>
                                                <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent mr-2"></div>
                                                Changing Vote...
                                            </>
                                        ) : (
                                            votingActive ? (
                                                <>
                                                    <RefreshCw className="h-5 w-5 mr-2" />
                                                    Change Vote
                                                </>
                                            ) : null
                                        )}
                                    </Button>
                                )}
                            </div>
                        )}
                    </>
                ) : (
                    <div className="w-full bg-gray-100 border-2 border-gray-300 rounded-lg p-3 flex items-center justify-center">
                        <span className="font-medium text-gray-500">
                            Voting is closed
                        </span>
                    </div>
                )}
            </CardFooter>
        </Card>
    );
}