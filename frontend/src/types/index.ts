import { VotingSettings } from "@/services/votingApi";

export interface User {
    _id: string;
    email: string;
    name: string;
    avatar?: string;
    role: 'USER' | 'ADMIN';
    googleId?: string;
}

export enum UserRole {
    USER = 'USER',
    ADMIN = 'ADMIN'
}

export interface SearchUsersResponse {
    users: User[];
}

export interface UpdateUserRoleResponse {
    success: boolean;
    user: User;
}

export interface ApiError {
    message: string;
    statusCode: number;
}

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