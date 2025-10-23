'use client';

import {  useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useVotingState, useWinners, usePhotos } from '@/hooks/useVoting';
import { Photo } from '@/services/votingApi';
import {
    Trophy,
    Medal,
    Award,
    Users,
    Heart,
    Clock,
    AlertCircle,
    RefreshCcw,
    Crown
} from 'lucide-react';
import { useUser } from '@/hooks/useUser';

export default function Results() {
    const {
        photos,
        settings: votingSettings,
        totalVotes,
        votingActive
    } = useVotingState();

    const { data: winners = [] } = useWinners();
    const { isLoading, error, refetch } = usePhotos();
    const [isRefreshing, setIsRefreshing] = useState(false);
    const { user } = useUser();
    const isAdminUser = user?.role === 'ADMIN';

    const handleRefresh = async () => {
        setIsRefreshing(true);
        try {
            await refetch();
        } finally {
            setIsRefreshing(false);
        }
    };

    const sortedPhotos = [...photos].sort((a, b) => b.voteCount - a.voteCount);
    const hasResults = votingSettings?.resultsPublished || false;
    const calcTotalVotes = photos.reduce((sum: number, photo: Photo) => sum + photo.voteCount, 0);
    const canViewResults = user?.role === 'ADMIN' || hasResults;

    const getPositionIcon = (position: number) => {
        switch (position) {
            case 1: return <Crown className="h-6 w-6 text-yellow-500" />;
            case 2: return <Medal className="h-6 w-6 text-gray-400" />;
            case 3: return <Award className="h-6 w-6 text-orange-600" />;
            default: return <Trophy className="h-5 w-5 text-gray-400" />;
        }
    };

    const getPositionBadge = (position: number) => {
        const configs = [
            { bg: 'bg-yellow-500', text: 'text-white', label: '1st Place' },
            { bg: 'bg-gray-400', text: 'text-white', label: '2nd Place' },
            { bg: 'bg-orange-600', text: 'text-white', label: '3rd Place' }
        ];

        const config = configs[position - 1];
        if (!config) return null;

        return (
            <Badge className={`${config.bg} ${config.text} px-3 py-1`}>
                {getPositionIcon(position)}
                <span className="ml-2">{config.label}</span>
            </Badge>
        );
    };

    // Show blank page for normal users when results are not published
    if (!canViewResults) {
        return (
            <div className="max-w-4xl mx-auto">
                <div className="text-center py-16">
                    <Trophy className="h-20 w-20 text-gray-300 mx-auto mb-6" />
                    <h1 className="text-3xl font-bold text-gray-900 mb-4">
                        Contest Results
                    </h1>
                    <p className="text-lg text-gray-600 mb-8">
                        Results will be published here once the voting period ends and winners are announced.
                    </p>
                    <Alert className="bg-blue-50 border-blue-200 max-w-md mx-auto">
                        <Clock className="h-4 w-4" />
                        <AlertDescription>
                            Please check back later for the official results!
                        </AlertDescription>
                    </Alert>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">
                            Contest Results
                        </h1>
                        <p className="text-gray-600">
                            {isAdminUser ? 'Admin view - See how the photos performed in the voting' : 'Official contest results'}
                        </p>
                    </div>

                    {isAdminUser && (
                        <Button
                            onClick={handleRefresh}
                            variant="outline"
                            disabled={isRefreshing}
                            className="flex items-center"
                        >
                            <RefreshCcw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                            Refresh
                        </Button>
                    )}
                </div>

                {/* Stats */}
                <div className="flex flex-wrap gap-4 mb-6">
                    <Badge variant="outline" className="px-3 py-1">
                        <Users className="h-4 w-4 mr-1" />
                        {photos.length} Photos
                    </Badge>

                    <Badge variant="outline" className="px-3 py-1">
                        <Heart className="h-4 w-4 mr-1" />
                        {calcTotalVotes} Total Votes
                    </Badge>

                    <Badge variant={hasResults ? "default" : "secondary"} className="px-3 py-1">
                        <Trophy className="h-4 w-4 mr-1" />
                        {hasResults ? 'Final Results' : 'Live Results'}
                    </Badge>
                </div>

                {/* Status Messages */}
                {!hasResults && (
                    <Alert className="bg-blue-50 border-blue-200 mb-6">
                        <Clock className="h-4 w-4" />
                        <AlertDescription>
                            {votingSettings?.isVotingActive
                                ? 'Voting is still active. These are live results that may change.'
                                : 'Voting has ended but winners have not been officially announced yet.'
                            }
                        </AlertDescription>
                    </Alert>
                )}

                {hasResults && winners.length > 0 && (
                    <Alert className="bg-green-50 border-green-200 mb-6">
                        <Trophy className="h-4 w-4" />
                        <AlertDescription>
                            <strong>Winners have been announced!</strong> Congratulations to all participants.
                        </AlertDescription>
                    </Alert>
                )}
            </div>

            {/* Error Display */}
            {error instanceof Error && (
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
            )}

            {/* Loading State */}
            {isLoading && photos.length === 0 && (
                <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                        <p className="text-gray-600">Loading results...</p>
                    </div>
                </div>
            )}

            {/* Winners Section */}
            {hasResults && winners.length > 0 && (
                <div className="mb-12">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
                        🏆 Official Winners 🏆
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        {winners.map((winner: Photo) => (
                            <Card key={winner.id} className="relative overflow-hidden border-2 border-yellow-200 bg-gradient-to-br from-yellow-50 to-orange-50">
                                <div className="absolute top-4 left-4 z-10">
                                    {getPositionBadge(winner.winnerPosition || 1)}
                                </div>

                                <div className="aspect-square relative overflow-hidden">
                                    <img
                                        src={winner.url}
                                        alt={winner.name}
                                        className="w-full h-full object-cover"
                                    />
                                </div>

                                <CardContent className="p-6">
                                    <h3 className="font-bold text-lg mb-2">{winner.name}</h3>
                                    {winner.participantName && isAdminUser && (
                                        <p className="text-gray-600 mb-2">
                                            by {winner.participantName}
                                        </p>
                                    )}
                                    <div className="flex items-center text-lg font-semibold text-blue-600">
                                        <Heart className="h-5 w-5 mr-1 text-red-500" />
                                        {winner.voteCount} votes
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            )}

            {/* All Results */}
            <div>
                <h2 className="text-xl font-bold text-gray-900 mb-6">
                    {hasResults ? 'Final Standings' : 'Current Standings'}
                </h2>

                {photos.length > 0 ? (
                    <div className="space-y-4">
                        {sortedPhotos.map((photo, index) => (
                            <Card key={photo.id} className={`${photo.isWinner ? 'border-yellow-300 bg-yellow-50' : ''
                                }`}>
                                <CardContent className="p-6">
                                    <div className="flex items-center gap-6">
                                        <div className="flex-shrink-0 text-center">
                                            <div className="text-2xl font-bold text-gray-400">
                                                #{index + 1}
                                            </div>
                                            {photo.isWinner && getPositionIcon(photo.winnerPosition || 1)}
                                        </div>

                                        <div className="w-24 h-24 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                                            <img
                                                src={photo.url}
                                                alt={photo.name}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>

                                        {/* Info */}
                                        <div className="flex-grow min-w-0">
                                            <h3 className="font-semibold text-lg mb-1 truncate">
                                                {photo.name}
                                            </h3>
                                            {photo.participantName && isAdminUser && (
                                                <p className="text-gray-600 mb-2">
                                                    by {photo.participantName}
                                                </p>
                                            )}
                                            <div className="text-sm text-gray-500">
                                                Uploaded {new Date(photo.uploadedAt).toLocaleDateString()}
                                            </div>
                                        </div>

                                        {/* Votes */}
                                        <div className="flex-shrink-0 text-right">
                                            <div className="flex items-center text-lg font-semibold">
                                                <Heart className="h-5 w-5 mr-2 text-red-500" />
                                                {photo.voteCount}
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                {totalVotes > 0 ?
                                                    `${((photo.voteCount / totalVotes) * 100).toFixed(1)}%`
                                                    : '0%'
                                                }
                                            </div>
                                            {photo.isWinner && (
                                                <Badge className="mt-2 bg-yellow-500 text-white">
                                                    Winner
                                                </Badge>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                ) : !isLoading && (
                    <div className="text-center py-12">
                        <Trophy className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No Results Yet</h3>
                        <p className="text-gray-600">Results will appear here once voting begins.</p>
                    </div>
                )}
            </div>
        </div>
    );
}