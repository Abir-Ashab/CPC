import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@/services/adminApi';

export const useAnalytics = () => {
    return useQuery({
        queryKey: ['analytics'],
        queryFn: adminApi.getAnalytics,
        refetchInterval: 30000, // Auto-refresh every 30 seconds when voting is active
    });
};

export const useStartVoting = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: adminApi.startVoting,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['votingSettings'] });
            queryClient.invalidateQueries({ queryKey: ['analytics'] });
            queryClient.invalidateQueries({ queryKey: ['photos'] });
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
            queryClient.invalidateQueries({ queryKey: ['photos'] });
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
            queryClient.invalidateQueries({ queryKey: ['photos'] });
        }
    });
};

export const useUpdateVotingSettings = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: adminApi.updateVotingSettings,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['votingSettings'] });
            queryClient.invalidateQueries({ queryKey: ['analytics'] });
            queryClient.invalidateQueries({ queryKey: ['photos'] });
        }
    });
};

export const useResetVoting = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: adminApi.resetVoting,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['votingSettings'] });
            queryClient.invalidateQueries({ queryKey: ['analytics'] });
            queryClient.invalidateQueries({ queryKey: ['photos'] });
            queryClient.invalidateQueries({ queryKey: ['winners'] });
            queryClient.invalidateQueries({ queryKey: ['userVote'] });
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
            votingActive: false,
            isLoading: analyticsQuery.isLoading
        };
    }

    const totalVotes = analytics.totalVotes;
    const totalPhotos = analytics.totalPhotos;
    const votingActive = analytics.votingSettings.isVotingActive;

    return {
        totalVotes,
        totalPhotos,
        votingActive,
        isLoading: analyticsQuery.isLoading
    };
};