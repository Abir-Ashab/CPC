// stores/votingStore.ts - Zustand store for voting functionality
import { create } from 'zustand';
import api from '@/lib/api';

export interface Photo {
    id: string;
    name: string;
    url: string;
    uploadedAt: string;
    voteCount: number;
    isWinner: boolean;
    winnerPosition?: number;
    participantName?: string;
    participantEmail?: string;
}

export interface Vote {
    photoId: string;
    userId: string;
    userEmail: string;
    votedAt: string;
}

export interface VotingSettings {
    isVotingActive: boolean;
    votingStartTime?: string;
    votingEndTime?: string;
    winners: string[];
    resultsPublished: boolean;
    maxVotesPerUser: number;
}

interface VotingState {
    // State
    photos: Photo[];
    votingSettings: VotingSettings | null;
    userVote: Vote | null;
    winners: Photo[];
    isLoading: boolean;
    error: string | null;

    // Actions
    fetchPhotos: () => Promise<void>;
    fetchVotingSettings: () => Promise<void>;
    fetchUserVote: () => Promise<void>;
    fetchWinners: () => Promise<void>;
    vote: (photoId: string) => Promise<boolean>;
    setError: (error: string | null) => void;
    clearError: () => void;

    // Helper methods
    canVote: () => boolean;
    hasVoted: () => boolean;
    getUserVotedPhotoId: () => string | null;
    getPhotoById: (id: string) => Photo | undefined;
    isVotingActive: () => boolean;
}

export const useVotingStore = create<VotingState>((set, get) => ({
    // Initial state
    photos: [],
    votingSettings: null,
    userVote: null,
    winners: [],
    isLoading: false,
    error: null,

    // Actions
    fetchPhotos: async () => {
        try {
            set({ isLoading: true, error: null });
            const { data } = await api.get('/photos');
            set({ photos: data.photos, isLoading: false });
        } catch (error: any) {
            const errorMessage = error?.response?.data?.message || 'Failed to fetch photos';
            set({ error: errorMessage, isLoading: false });
        }
    },

    fetchVotingSettings: async () => {
        try {
            const { data } = await api.get('/voting/settings');
            set({ votingSettings: data.settings });
        } catch (error: any) {
            console.error('Failed to fetch voting settings:', error);
        }
    },

    fetchUserVote: async () => {
        try {
            const { data } = await api.get('/voting/my-vote');
            set({ userVote: data.vote });
        } catch (error: any) {
            // User hasn't voted yet, this is expected
            set({ userVote: null });
        }
    },

    fetchWinners: async () => {
        try {
            const { data } = await api.get('/voting/winners');
            set({ winners: data.winners });
        } catch (error: any) {
            console.error('Failed to fetch winners:', error);
        }
    },

    vote: async (photoId: string) => {
        try {
            set({ isLoading: true, error: null });
            const { data } = await api.post(`/voting/vote/${photoId}`);
            
            if (data.success) {
                // Refresh data after voting
                await Promise.all([
                    get().fetchPhotos(),
                    get().fetchUserVote(),
                ]);
                return true;
            }
            return false;
        } catch (error: any) {
            const errorMessage = error?.response?.data?.message || 'Failed to vote';
            set({ error: errorMessage, isLoading: false });
            return false;
        } finally {
            set({ isLoading: false });
        }
    },

    setError: (error: string | null) => {
        set({ error });
    },

    clearError: () => {
        set({ error: null });
    },

    // Helper methods
    canVote: () => {
        const { votingSettings, userVote } = get();
        return !!(votingSettings?.isVotingActive && !userVote);
    },

    hasVoted: () => {
        const { userVote } = get();
        return !!userVote;
    },

    getUserVotedPhotoId: () => {
        const { userVote } = get();
        return userVote?.photoId || null;
    },

    getPhotoById: (id: string) => {
        const { photos } = get();
        return photos.find(photo => photo.id === id);
    },

    isVotingActive: () => {
        const { votingSettings } = get();
        return !!(votingSettings?.isVotingActive);
    },
}));