// stores/adminStore.ts - Zustand store for admin functionality
import { create } from 'zustand';
import api from '@/lib/api';
import { Photo, VotingSettings } from './votingStore';

export interface AdminAnalytics {
    totalVotes: number;
    totalPhotos: number;
    photosWithVotes: Array<{
        id: string;
        name: string;
        voteCount: number;
        participantName?: string;
        participantEmail?: string;
        isWinner: boolean;
        winnerPosition?: number;
    }>;
    votingSettings: VotingSettings;
}

interface AdminState {
    // State
    analytics: AdminAnalytics | null;
    isLoading: boolean;
    error: string | null;

    // Actions
    fetchAnalytics: () => Promise<void>;
    startVoting: () => Promise<boolean>;
    stopVoting: () => Promise<boolean>;
    declareWinners: (winnerIds: string[]) => Promise<boolean>;
    setError: (error: string | null) => void;
    clearError: () => void;

    // Helper methods
    getTopPhotos: (limit?: number) => Array<{
        id: string;
        name: string;
        voteCount: number;
        participantName?: string;
        participantEmail?: string;
        isWinner: boolean;
        winnerPosition?: number;
    }>;
    getVotingStats: () => {
        totalVotes: number;
        totalPhotos: number;
        averageVotes: number;
        votingActive: boolean;
    };
}

export const useAdminStore = create<AdminState>((set, get) => ({
    // Initial state
    analytics: null,
    isLoading: false,
    error: null,

    // Actions
    fetchAnalytics: async () => {
        try {
            set({ isLoading: true, error: null });
            const { data } = await api.get('/voting/analytics');
            set({ analytics: data.analytics, isLoading: false });
        } catch (error: any) {
            const errorMessage = error?.response?.data?.message || 'Failed to fetch analytics';
            set({ error: errorMessage, isLoading: false });
        }
    },

    startVoting: async () => {
        try {
            set({ isLoading: true, error: null });
            const { data } = await api.post('/voting/start');
            
            if (data.settings) {
                // Update analytics with new settings
                const { analytics } = get();
                if (analytics) {
                    set({
                        analytics: {
                            ...analytics,
                            votingSettings: data.settings
                        },
                        isLoading: false
                    });
                }
                return true;
            }
            return false;
        } catch (error: any) {
            const errorMessage = error?.response?.data?.message || 'Failed to start voting';
            set({ error: errorMessage, isLoading: false });
            return false;
        }
    },

    stopVoting: async () => {
        try {
            set({ isLoading: true, error: null });
            const { data } = await api.post('/voting/stop');
            
            if (data.settings) {
                // Update analytics with new settings
                const { analytics } = get();
                if (analytics) {
                    set({
                        analytics: {
                            ...analytics,
                            votingSettings: data.settings
                        },
                        isLoading: false
                    });
                }
                return true;
            }
            return false;
        } catch (error: any) {
            const errorMessage = error?.response?.data?.message || 'Failed to stop voting';
            set({ error: errorMessage, isLoading: false });
            return false;
        }
    },

    declareWinners: async (winnerIds: string[]) => {
        try {
            set({ isLoading: true, error: null });
            const { data } = await api.post('/voting/winners', { winnerIds });
            
            if (data.success) {
                await get().fetchAnalytics();
                return true;
            }
            return false;
        } catch (error: any) {
            const errorMessage = error?.response?.data?.message || 'Failed to declare winners';
            set({ error: errorMessage, isLoading: false });
            return false;
        }
    },

    setError: (error: string | null) => {
        set({ error });
    },

    clearError: () => {
        set({ error: null });
    },

    // Helper methods
    getTopPhotos: (limit = 10) => {
        const { analytics } = get();
        if (!analytics) return [];
        
        return analytics.photosWithVotes
            .sort((a, b) => b.voteCount - a.voteCount)
            .slice(0, limit);
    },

    getVotingStats: () => {
        const { analytics } = get();
        if (!analytics) {
            return {
                totalVotes: 0,
                totalPhotos: 0,
                averageVotes: 0,
                votingActive: false
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
            votingActive
        };
    },
}));