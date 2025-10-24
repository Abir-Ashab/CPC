import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@/services/adminApi';

export const useAnalytics = () => {
    return useQuery({
        queryKey: ['analytics'],
        queryFn: adminApi.getAnalytics
    });
};

export const useStartVoting = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: adminApi.startVoting,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['votingSettings'] });
            queryClient.invalidateQueries({ queryKey: ['analytics'] });
        }
    });
};

export const useStopVoting = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: adminApi.stopVoting,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['votingSettings'] });
            queryClient.invalidateQueries({ queryKey: ['analytics'] });
        }
    });
};

export const useDeclareWinners = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: adminApi.declareWinners,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['analytics'] });
            queryClient.invalidateQueries({ queryKey: ['winners'] });
        }
    });
};

// Helper hooks that combine analytics data
export const useVotingStats = () => {
    const analyticsQuery = useAnalytics();
    const analytics = analyticsQuery.data;

    if (!analytics) {
        return {
            totalVotes: 0,
            totalPhotos: 0,
            averageVotes: 0,
            votingActive: false,
            isLoading: analyticsQuery.isLoading
        };
    }

    const totalVotes = analytics.totalVotes;
    const totalPhotos = analytics.totalPhotos;
    const averageVotes = totalPhotos > 0 ? totalVotes / totalPhotos : 0;
    const votingActive = analytics.votingSettings.isVotingActive;

    return {
        totalVotes,
        totalPhotos,
        averageVotes,
        votingActive,
        isLoading: analyticsQuery.isLoading
    };
};