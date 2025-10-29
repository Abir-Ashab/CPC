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
    category?: string;
    caption?: string;
}

export interface UserVote {
    votedPhotoId?: string;
    votedAt?: Date;
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
    getPhotos: async (): Promise<Photo[]> => {
        const { data } = await api.get('/photos');
        return data.photos as Photo[];
    },

    getVotingSettings: async (): Promise<VotingSettings> => {
        const { data } = await api.get('/voting/settings');
        return data.settings as VotingSettings;
    },

    getUserVote: async (): Promise<UserVote> => {
        const { data } = await api.get('/voting/my-vote');
        console.log("data.vote", data);
        
        return data.vote as UserVote;
    },

    getWinners: async (): Promise<Photo[]> => {
        const { data } = await api.get('/voting/winners');
        return data.winners as Photo[];
    },

    vote: async (photoId: string): Promise<{ success: boolean; message: string }> => {
        const { data } = await api.post(`/voting/vote/${photoId}`);
        return data;
    }
};