import api from '@/lib/api';
import { VotingSettings } from './votingApi';
import { AdminAnalytics } from '@/types';

export const adminApi = {
    getAnalytics: async () => {
        const { data } = await api.get('/voting/analytics');
        return data.analytics as AdminAnalytics;
    },

    startVoting: async () => {
        const { data } = await api.post('/voting/start');
        return data.settings as VotingSettings;
    },

    stopVoting: async () => {
        const { data } = await api.post('/voting/stop');
        return data.settings as VotingSettings;
    },

    declareWinners: async (winnerIds: string[]) => {
        const { data } = await api.post('/voting/winners', { winnerIds });
        return data.success;
    },

    updateVotingSettings: async (settings: Partial<VotingSettings>) => {
        const { data } = await api.put('/voting/settings', settings);
        return data.settings as VotingSettings;
    },

    resetVoting: async () => {
        const { data } = await api.post('/voting/reset');
        return data.success;
    }
};