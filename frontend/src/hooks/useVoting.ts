import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { votingApi } from '@/services/votingApi';

export const usePhotos = () => {
    return useQuery({
        queryKey: ['photos'],
        queryFn: votingApi.getPhotos
    });
};

export const useVotingSettings = () => {
    return useQuery({
        queryKey: ['votingSettings'],
        queryFn: votingApi.getVotingSettings
    });
};

export const useUserVote = () => {
    return useQuery({
        queryKey: ['userVote'],
        queryFn: votingApi.getUserVote
    });
};

export const useWinners = () => {
    return useQuery({
        queryKey: ['winners'],
        queryFn: votingApi.getWinners
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
        }
    });
};

// Helper hooks that combine multiple queries
export const useVotingState = () => {
    const photosQuery = usePhotos();
    const settingsQuery = useVotingSettings();
    const userVoteQuery = useUserVote();

    const photos = photosQuery.data ?? [];
    const canVote = settingsQuery.data?.isVotingActive && !userVoteQuery.data;
    const hasVoted = !!userVoteQuery.data;
    const votedPhotoId = userVoteQuery.data?.photoId;
    const votingActive = settingsQuery.data?.isVotingActive ?? false;
    const totalVotes = photos.reduce((sum: number, photo) => sum + photo.voteCount, 0);

    return {
        photos,
        settings: settingsQuery.data,
        userVote: userVoteQuery.data,
        isLoading: photosQuery.isLoading || settingsQuery.isLoading || userVoteQuery.isLoading,
        canVote,
        hasVoted,
        votedPhotoId,
        votingActive,
        totalVotes
    };
};