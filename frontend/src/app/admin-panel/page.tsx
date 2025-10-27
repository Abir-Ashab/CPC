'use client';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
    useAnalytics,
    useStartVoting,
    useStopVoting,
    useDeclareWinners,
    useVotingStats,
    useUpdateVotingSettings,
    useResetVoting
} from '@/hooks/useAdmin';
import {
    Play,
    Square,
    Trophy,
    Users,
    Heart,
    AlertCircle,
    RefreshCcw,
    Crown,
    CheckCircle,
    Clock,
    BarChart3,
    Calendar,
    Eye,
    EyeOff,
    RotateCcw
} from 'lucide-react';
import { withAuth } from '@/utils/withAuth';
import { UserRole } from '@/types';
import { toast } from 'sonner';
import { VotingSettingsDialog } from '@/components/modules/voting-settings/VotingSettingsDialog';
import { ResetConfirmationDialog } from '@/components/modules/voting-settings/ResetConfirmationDialog';

interface PhotoWithVotes {
    id: string;
    name: string;
    voteCount: number;
    participantName?: string;
    participantEmail?: string;
    isWinner: boolean;
    winnerPosition?: number;
}

function AdminDashboard() {
    const { data: analytics, isLoading, error, refetch } = useAnalytics();
    const { mutateAsync: startVotingMutation } = useStartVoting();
    const { mutateAsync: stopVotingMutation } = useStopVoting();
    const { mutateAsync: declareWinnersMutation } = useDeclareWinners();
    const { mutateAsync: updateVotingSettingsMutation } = useUpdateVotingSettings();
    const { mutateAsync: resetVotingMutation } = useResetVoting();
    const votingStats = useVotingStats();

    const [selectedWinners, setSelectedWinners] = useState<string[]>([]);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [showSettingsDialog, setShowSettingsDialog] = useState(false);
    const [showResetDialog, setShowResetDialog] = useState(false);
    const [customExtendHours, setCustomExtendHours] = useState('');

    const [timeLeft, setTimeLeft] = useState<string>('');

    useEffect(() => {
        if (analytics?.votingSettings?.votingEndTime) {
            const endTime = new Date(analytics.votingSettings.votingEndTime).getTime();
            const updateCountdown = () => {
                const now = new Date().getTime();
                const distance = endTime - now;

                if (distance <= 0) {
                    setTimeLeft('Voting ended');
                    return;
                }

                const hours = Math.floor(distance / (1000 * 60 * 60));
                const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
                const seconds = Math.floor((distance % (1000 * 60)) / 1000);

                setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
            };

            updateCountdown();
            const interval = setInterval(updateCountdown, 1000);
            return () => clearInterval(interval);
        }
    }, [analytics?.votingSettings?.votingEndTime]);

    
    const handleStartVoting = async (settings?: { startTime?: Date; durationHours?: number }) => {
        setActionLoading('start');
        try {
            const durationHours = settings?.durationHours || 24; 
            const startTime = settings?.startTime || new Date();
            const endTime = new Date(startTime.getTime() + durationHours * 60 * 60 * 1000);

            const now = new Date();
            const isFuture = startTime.getTime() > now.getTime();

            await updateVotingSettingsMutation({
                isVotingActive: !isFuture,
                votingStartTime: startTime,
                votingEndTime: endTime,
            });

            const message = isFuture
                ? `Voting scheduled successfully!`
                : `Voting started successfully!`;
            toast.success(message);

            await refetch();
        } catch (err: any) {
            toast.error(err.message || 'Failed to start voting');
        } finally {
            setActionLoading(null);
            setShowSettingsDialog(false);
        }
    };

    const handleStopVoting = async () => {
        setActionLoading('stop');
        try {
            await stopVotingMutation();
            toast.success('Voting stopped successfully!');
            await refetch();
        } catch (err: any) {
            toast.error(err.message || 'Failed to stop voting');
        } finally {
            setActionLoading(null);
        }
    };

    const handleExtendVoting = async (additionalHours: number) => {
        if (!analytics?.votingSettings?.votingEndTime) return;

        try {
            const currentEndTime = new Date(analytics.votingSettings.votingEndTime);
            const newEndTime = new Date(currentEndTime.getTime() + additionalHours * 60 * 60 * 1000);

            await updateVotingSettingsMutation({
                votingEndTime: newEndTime,
            });

            toast.success(`Voting extended by ${additionalHours} hours!`);
            await refetch();
        } catch (err: any) {
            toast.error(err.message || 'Failed to extend voting');
        }
    };

    const handleToggleResults = async (publish: boolean) => {
        setActionLoading(publish ? 'publish' : 'unpublish');
        try {
            await updateVotingSettingsMutation({
                resultsPublished: publish,
            });
            toast.success(publish ? 'Results published successfully!' : 'Results unpublished successfully!');
            await refetch();
        } catch (err: any) {
            toast.error(err.message || `Failed to ${publish ? 'publish' : 'unpublish'} results`);
        } finally {
            setActionLoading(null);
        }
    };

    const handleWinnerSelection = (photoId: string) => {
        setSelectedWinners((prev) => {
            if (prev.includes(photoId)) {
                return prev.filter((id) => id !== photoId);
            } else if (prev.length < 3) {
                return [...prev, photoId];
            }
            return prev;
        });
    };

    const handleDeclareWinners = async () => {
        if (selectedWinners.length !== 3) {
            toast.error('Please select exactly 3 winners');
            return;
        }

        setActionLoading('winners');
        try {
            await declareWinnersMutation(selectedWinners);
            toast.success('Winners declared successfully!');
            await refetch();
            setSelectedWinners([]);
        } catch (err: any) {
            toast.error(err.message || 'Failed to declare winners');
        } finally {
            setActionLoading(null);
        }
    };

    const handleResetVoting = async () => {
        setActionLoading('reset');
        try {
            await resetVotingMutation();
            toast.success('Voting system reset successfully!');
            await refetch();
            setSelectedWinners([]);
        } catch (err: any) {
            toast.error(err.message || 'Failed to reset voting');
        } finally {
            setActionLoading(null);
            setShowResetDialog(false);
        }
    };

    const votingActive = votingStats.votingActive;
    const resultsPublished = analytics?.votingSettings?.resultsPublished || false;
    const topPhotos = analytics?.photosWithVotes
        .sort((a, b) => b.voteCount - a.voteCount)
        .slice(0, 10) || [];

    return (
        <div className="max-w-7xl mx-auto p-6">
            <div className="mb-8">
                <div className="flex items-center justify-end mb-4">
                    <Button
                        onClick={() => setShowResetDialog(true)}
                        variant="outline"
                        className="flex items-center text-red-600 border-red-200 hover:bg-red-50"
                    >
                        <RotateCcw className="h-4 w-4 mr-2" />
                        Reset
                    </Button>
                </div>

                <div className="flex flex-wrap gap-4 mb-6">
                    <Badge variant={votingActive ? "default" : "secondary"} className="px-3 py-1">
                        <Clock className="h-4 w-4 mr-1" />
                        {votingActive ? 'Voting Active' : 'Voting Inactive'}
                    </Badge>

                    <Badge variant={resultsPublished ? "default" : "outline"} className="px-3 py-1">
                        <Trophy className="h-4 w-4 mr-1" />
                        {resultsPublished ? 'Results Published' : 'Results Pending'}
                    </Badge>

                    {votingActive && timeLeft && (
                        <Badge variant="destructive" className="px-3 py-1">
                            <Calendar className="h-4 w-4 mr-1" />
                            Ends in: {timeLeft}
                        </Badge>
                    )}
                </div>
            </div>
            {error instanceof Error && (
                <Alert className="bg-red-50 border-red-200 mb-6">
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
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total Votes</CardTitle>
                                <Heart className="h-4 w-4 text-red-500" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{votingStats.totalVotes}</div>
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
                                <div className="text-2xl font-bold">{votingStats.totalPhotos}</div>
                                <p className="text-xs text-muted-foreground">
                                    In the contest
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
                                <BarChart3 className="h-5 w-5 mr-2" />
                                Voting Controls
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex flex-wrap gap-4">
                                {!votingActive ? (
                                    <Button
                                        onClick={() => setShowSettingsDialog(true)}
                                        disabled={actionLoading === 'start'}
                                        className="flex items-center"
                                    >
                                        {actionLoading === 'start' ? (
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                        ) : (
                                            <Play className="h-4 w-4 mr-2" />
                                        )}
                                        Start Voting
                                    </Button>
                                ) : (
                                    <>
                                        <Button
                                            onClick={handleStopVoting}
                                            disabled={actionLoading === 'stop'}
                                            variant="destructive"
                                            className="flex items-center"
                                        >
                                            {actionLoading === 'stop' ? (
                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                            ) : (
                                                <Square className="h-4 w-4 mr-2" />
                                            )}
                                            Stop Voting
                                        </Button>

                                        <Button
                                            onClick={() => handleExtendVoting(1)}
                                            variant="outline"
                                            className="flex items-center"
                                        >
                                            <Clock className="h-4 w-4 mr-2" />
                                            Extend 1 Hour
                                        </Button>

                                        <Button
                                            onClick={() => handleExtendVoting(24)}
                                            variant="outline"
                                            className="flex items-center"
                                        >
                                            <Calendar className="h-4 w-4 mr-2" />
                                            Extend 24 Hours
                                        </Button>
                                        {/* Custom extend input */}
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="number"
                                                min="1"
                                                max="720"
                                                className="border rounded px-2 py-1 w-20"
                                                placeholder="Hours"
                                                value={customExtendHours}
                                                onChange={e => setCustomExtendHours(e.target.value.replace(/^0+/, ''))}
                                            />
                                            <Button
                                                variant="outline"
                                                className="flex items-center"
                                                onClick={() => {
                                                    const hours = parseInt(customExtendHours);
                                                    if (!isNaN(hours) && hours > 0 && hours <= 720) {
                                                        handleExtendVoting(hours);
                                                        setCustomExtendHours('');
                                                    } else {
                                                        toast.error('Enter a valid number of hours (1-720)');
                                                    }
                                                }}
                                                disabled={!customExtendHours || isNaN(parseInt(customExtendHours)) || parseInt(customExtendHours) < 1 || parseInt(customExtendHours) > 720}
                                            >
                                                <Clock className="h-4 w-4 mr-2" />
                                                Extend
                                            </Button>
                                        </div>
                                    </>
                                )}

                                {!votingActive && analytics.photosWithVotes.length > 0 && (
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

                                {resultsPublished ? (
                                    <Button
                                        onClick={() => handleToggleResults(false)}
                                        disabled={actionLoading === 'unpublish'}
                                        variant="outline"
                                        className="flex items-center"
                                    >
                                        {actionLoading === 'unpublish' ? (
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                        ) : (
                                            <EyeOff className="h-4 w-4 mr-2" />
                                        )}
                                        Unpublish Results
                                    </Button>
                                ) : (
                                    analytics.votingSettings.winners.length === 3 && (
                                        <Button
                                            onClick={() => handleToggleResults(true)}
                                            disabled={actionLoading === 'publish'}
                                            className="flex items-center bg-green-600 hover:bg-green-700"
                                        >
                                            {actionLoading === 'publish' ? (
                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                            ) : (
                                                <Eye className="h-4 w-4 mr-2" />
                                            )}
                                            Publish Results
                                        </Button>
                                    )
                                )}
                            </div>

                            {!votingActive && !resultsPublished && analytics.photosWithVotes.length > 0 && (
                                <Alert className="bg-blue-50 border-blue-200">
                                    <AlertCircle className="h-4 w-4" />
                                    <AlertDescription>
                                        Select exactly 3 photos below to declare as winners (1st, 2nd, 3rd place).
                                    </AlertDescription>
                                </Alert>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <Trophy className="h-5 w-5 mr-2" />
                                Photo Rankings {votingActive && '(Live)'}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {topPhotos.length > 0 ? (
                                <div className="space-y-4">
                                    {topPhotos.map((photo: PhotoWithVotes, index: number) => (
                                        <div
                                            key={photo.id}
                                            className={`flex items-center gap-4 p-4 rounded-lg border-2 transition-all cursor-pointer ${selectedWinners.includes(photo.id)
                                                ? 'border-yellow-300 bg-yellow-50'
                                                : photo.isWinner
                                                    ? 'border-green-300 bg-green-50'
                                                    : 'border-gray-200 hover:border-gray-300'
                                                }`}
                                            onClick={() => !resultsPublished && !votingActive && handleWinnerSelection(photo.id)}
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
                                                    {votingStats.totalVotes > 0 ?
                                                        `${((photo.voteCount / votingStats.totalVotes) * 100).toFixed(1)}%`
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

            <VotingSettingsDialog
                open={showSettingsDialog}
                onOpenChange={setShowSettingsDialog}
                onStartVoting={handleStartVoting}
                loading={actionLoading === 'start'}
            />

            <ResetConfirmationDialog
                open={showResetDialog}
                onOpenChange={setShowResetDialog}
                onConfirm={handleResetVoting}
                loading={actionLoading === 'reset'}
            />
        </div>
    );
}

export default withAuth(AdminDashboard, UserRole.ADMIN, '/voting');