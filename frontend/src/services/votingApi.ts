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
    votingStartTime?: Date;
    votingEndTime?: Date;
    winners: string[];
    resultsPublished: boolean;
    maxVotesPerUser: number;
}

export const votingApi = {
    getPhotos: async () => {
        const { data } = await api.get('/photos');
        return data.photos as Photo[];
    },

    getVotingSettings: async () => {
        const { data } = await api.get('/voting/settings');
        return data.settings as VotingSettings;
    },

    getUserVote: async () => {
        const { data } = await api.get('/voting/my-vote');
        return data.vote as Vote;
    },

    getWinners: async () => {
        const { data } = await api.get('/voting/winners');
        return data.winners as Photo[];
    },

    vote: async (photoId: string) => {
        const { data } = await api.post(`/voting/vote/${photoId}`);
        return data.success;
    }
};