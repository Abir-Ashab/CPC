import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { votingApi } from '@/services/votingApi';
import { toast } from 'sonner';

export const usePhotos = () => {
    return useQuery({
        queryKey: ['photos'],
        queryFn: votingApi.getPhotos,
        staleTime: 30000, // 30 seconds
    });
};

export const useVotingSettings = () => {
    return useQuery({
        queryKey: ['votingSettings'],
        queryFn: votingApi.getVotingSettings,
        refetchInterval: (query) => {
            const data = query.state.data;
            // Refresh more frequently when voting is active
            return data?.isVotingActive ? 30000 : 60000; // 30s vs 60s
        },
    });
};

export const useUserVote = () => {
    return useQuery({
        queryKey: ['userVote'],
        queryFn: votingApi.getUserVote,
        staleTime: 30000,
    });
};

export const useWinners = () => {
    return useQuery({
        queryKey: ['winners'],
        queryFn: votingApi.getWinners,
    });
};

export const useVote = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: votingApi.vote,
        onSuccess: () => {
            // Invalidate related queries
            queryClient.invalidateQueries({ queryKey: ['photos'] });
            queryClient.invalidateQueries({ queryKey: ['userVote'] });
        },
        onError: (error: any) => {
            toast.error('Voting failed', {
                description: error.message || 'Please try again later.'
            });
        }
    });
};

// Helper hooks that combine multiple queries
export const useVotingState = () => {
    const photosQuery = usePhotos();
    const settingsQuery = useVotingSettings();
    const userVoteQuery = useUserVote();

    const photos = photosQuery.data ?? [];
    const canVote = settingsQuery.data?.isVotingActive && !userVoteQuery.data?.votedPhotoId;
    const hasVoted = !!userVoteQuery.data?.votedPhotoId;
    console.log("data is: \n", userVoteQuery.data);
    const votedPhotoId = userVoteQuery.data?.votedPhotoId;
    const votingActive = settingsQuery.data?.isVotingActive ?? false;
    const totalVotes = photos.reduce((sum: number, photo) => sum + (photo.voteCount || 0), 0);

    return {
        photos,
        settings: settingsQuery.data,
        userVote: userVoteQuery.data,
        isLoading: photosQuery.isLoading || settingsQuery.isLoading || userVoteQuery.isLoading,
        error: photosQuery.error || settingsQuery.error || userVoteQuery.error,
        canVote,
        hasVoted,
        votedPhotoId,
        votingActive,
        totalVotes
    };
};