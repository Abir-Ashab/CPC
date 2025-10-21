'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { useAdminStore } from '@/stores/adminStore';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
    Settings, 
    Play, 
    Square, 
    Trophy, 
    Users, 
    Heart, 
    TrendingUp,
    AlertCircle,
    RefreshCcw,
    Crown,
    CheckCircle,
    Clock,
    BarChart3
} from 'lucide-react';

export default function AdminDashboard() {
    const { user, isAuthenticated, canManageVoting } = useAuthStore();
    const {
        analytics,
        isLoading,
        error,
        fetchAnalytics,
        startVoting,
        stopVoting,
        declareWinners,
        clearError,
        getTopPhotos,
        getVotingStats
    } = useAdminStore();
    
    const router = useRouter();
    const [selectedWinners, setSelectedWinners] = useState<string[]>([]);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/login');
            return;
        }

        if (!canManageVoting()) {
            router.push('/voting');
            return;
        }

        // Fetch initial data
        fetchAnalytics();
    }, [isAuthenticated, canManageVoting, router]);

    const handleRefresh = async () => {
        setIsRefreshing(true);
        try {
            await fetchAnalytics();
        } finally {
            setIsRefreshing(false);
        }
    };

    const handleStartVoting = async () => {
        setActionLoading('start');
        try {
            const success = await startVoting();
            if (success) {
                // Success feedback will be shown via updated analytics
            }
        } finally {
            setActionLoading(null);
        }
    };

    const handleStopVoting = async () => {
        setActionLoading('stop');
        try {
            const success = await stopVoting();
            if (success) {
                // Success feedback will be shown via updated analytics
            }
        } finally {
            setActionLoading(null);
        }
    };

    const handleWinnerSelection = (photoId: string) => {
        setSelectedWinners(prev => {
            if (prev.includes(photoId)) {
                return prev.filter(id => id !== photoId);
            } else if (prev.length < 3) {
                return [...prev, photoId];
            }
            return prev;
        });
    };

    const handleDeclareWinners = async () => {
        if (selectedWinners.length !== 3) {
            alert('Please select exactly 3 winners');
            return;
        }

        setActionLoading('winners');
        try {
            const success = await declareWinners(selectedWinners);
            if (success) {
                setSelectedWinners([]);
            }
        } finally {
            setActionLoading(null);
        }
    };

    if (!isAuthenticated || !user || !canManageVoting()) {
        return null;
    }

    const stats = getVotingStats();
    const topPhotos = getTopPhotos(10);
    const votingActive = stats.votingActive;
    const resultsPublished = analytics?.votingSettings?.resultsPublished || false;

    return (
        <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">
                            Admin Dashboard
                        </h1>
                        <p className="text-gray-600">
                            Manage voting and view analytics
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

                {/* Status */}
                <div className="flex flex-wrap gap-4 mb-6">
                    <Badge variant={votingActive ? "default" : "secondary"} className="px-3 py-1">
                        <Clock className="h-4 w-4 mr-1" />
                        {votingActive ? 'Voting Active' : 'Voting Inactive'}
                    </Badge>
                    
                    <Badge variant={resultsPublished ? "default" : "outline"} className="px-3 py-1">
                        <Trophy className="h-4 w-4 mr-1" />
                        {resultsPublished ? 'Results Published' : 'Results Pending'}
                    </Badge>
                </div>
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
            {isLoading && !analytics && (
                <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                        <p className="text-gray-600">Loading analytics...</p>
                    </div>
                </div>
            )}

            {analytics && (
                <>
                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total Votes</CardTitle>
                                <Heart className="h-4 w-4 text-red-500" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stats.totalVotes}</div>
                                <p className="text-xs text-muted-foreground">
                                    Across all photos
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total Photos</CardTitle>
                                <Users className="h-4 w-4 text-blue-500" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stats.totalPhotos}</div>
                                <p className="text-xs text-muted-foreground">
                                    In the contest
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Average Votes</CardTitle>
                                <TrendingUp className="h-4 w-4 text-green-500" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stats.averageVotes.toFixed(1)}</div>
                                <p className="text-xs text-muted-foreground">
                                    Per photo
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Status</CardTitle>
                                <BarChart3 className="h-4 w-4 text-purple-500" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    {votingActive ? 'Live' : 'Closed'}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Voting {votingActive ? 'in progress' : 'ended'}
                                </p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Controls */}
                    <Card className="mb-8">
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <Settings className="h-5 w-5 mr-2" />
                                Voting Controls
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-wrap gap-4">
                                <Button
                                    onClick={handleStartVoting}
                                    disabled={votingActive || actionLoading === 'start'}
                                    className="flex items-center"
                                    variant={votingActive ? "secondary" : "default"}
                                >
                                    {actionLoading === 'start' ? (
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                    ) : (
                                        <Play className="h-4 w-4 mr-2" />
                                    )}
                                    {votingActive ? 'Voting Active' : 'Start Voting'}
                                </Button>

                                <Button
                                    onClick={handleStopVoting}
                                    disabled={!votingActive || actionLoading === 'stop'}
                                    variant={!votingActive ? "secondary" : "destructive"}
                                    className="flex items-center"
                                >
                                    {actionLoading === 'stop' ? (
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                    ) : (
                                        <Square className="h-4 w-4 mr-2" />
                                    )}
                                    Stop Voting
                                </Button>

                                {!votingActive && !resultsPublished && (
                                    <Button
                                        onClick={handleDeclareWinners}
                                        disabled={selectedWinners.length !== 3 || actionLoading === 'winners'}
                                        className="flex items-center bg-yellow-600 hover:bg-yellow-700"
                                    >
                                        {actionLoading === 'winners' ? (
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                        ) : (
                                            <Crown className="h-4 w-4 mr-2" />
                                        )}
                                        Declare Winners ({selectedWinners.length}/3)
                                    </Button>
                                )}

                                {resultsPublished && (
                                    <Badge className="bg-green-600 text-white px-4 py-2">
                                        <CheckCircle className="h-4 w-4 mr-2" />
                                        Winners Declared
                                    </Badge>
                                )}
                            </div>

                            {!votingActive && !resultsPublished && (
                                <Alert className="mt-4 bg-blue-50 border-blue-200">
                                    <AlertCircle className="h-4 w-4" />
                                    <AlertDescription>
                                        Select exactly 3 photos below to declare as winners (1st, 2nd, 3rd place).
                                    </AlertDescription>
                                </Alert>
                            )}
                        </CardContent>
                    </Card>

                    {/* Top Photos */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <Trophy className="h-5 w-5 mr-2" />
                                Photo Rankings
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {topPhotos.length > 0 ? (
                                <div className="space-y-4">
                                    {topPhotos.map((photo, index) => (
                                        <div 
                                            key={photo.id} 
                                            className={`flex items-center gap-4 p-4 rounded-lg border-2 transition-all cursor-pointer ${
                                                selectedWinners.includes(photo.id) 
                                                    ? 'border-yellow-300 bg-yellow-50' 
                                                    : photo.isWinner 
                                                        ? 'border-green-300 bg-green-50'
                                                        : 'border-gray-200 hover:border-gray-300'
                                            }`}
                                            onClick={() => !resultsPublished && handleWinnerSelection(photo.id)}
                                        >
                                            <div className="text-lg font-bold text-gray-400 w-8 text-center">
                                                #{index + 1}
                                            </div>

                                            <div className="flex-grow">
                                                <h3 className="font-semibold">{photo.name}</h3>
                                                {photo.participantName && (
                                                    <p className="text-sm text-gray-600">by {photo.participantName}</p>
                                                )}
                                            </div>

                                            <div className="text-right">
                                                <div className="flex items-center text-lg font-semibold">
                                                    <Heart className="h-4 w-4 mr-1 text-red-500" />
                                                    {photo.voteCount}
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    {stats.totalVotes > 0 ? 
                                                        `${((photo.voteCount / stats.totalVotes) * 100).toFixed(1)}%` 
                                                        : '0%'
                                                    }
                                                </div>
                                            </div>

                                            {selectedWinners.includes(photo.id) && (
                                                <Badge className="bg-yellow-500 text-white">
                                                    Selected #{selectedWinners.indexOf(photo.id) + 1}
                                                </Badge>
                                            )}

                                            {photo.isWinner && (
                                                <Badge className="bg-green-600 text-white">
                                                    <Crown className="h-3 w-3 mr-1" />
                                                    Winner #{photo.winnerPosition}
                                                </Badge>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8 text-gray-500">
                                    No photos available yet
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </>
            )}
        </div>
    );
}