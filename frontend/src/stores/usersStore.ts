import { create } from 'zustand';
import api from '@/lib/api';
import { User } from './authStore';

interface UsersState {
    // State
    users: User[];
    searchResults: User[];
    isLoading: boolean;
    error: string | null;

    // Actions
    searchUsers: (query: string) => Promise<void>;
    updateUserRole: (userId: string, role: 'USER' | 'ADMIN') => Promise<boolean>;
    clearSearchResults: () => void;
    setError: (error: string | null) => void;
}

export const useUsersStore = create<UsersState>((set, get) => ({
    users: [],
    searchResults: [],
    isLoading: false,
    error: null,

    searchUsers: async (query: string) => {
        try {
            set({ isLoading: true, error: null });
            const { data } = await api.get(`/users/search?query=${encodeURIComponent(query)}`);
            set({ searchResults: data.users, isLoading: false });
        } catch (error: any) {
            const errorMessage = error?.response?.data?.message || 'Failed to search users';
            set({ error: errorMessage, isLoading: false });
        }
    },

    updateUserRole: async (userId: string, role: 'USER' | 'ADMIN') => {
        try {
            set({ isLoading: true, error: null });
            const { data } = await api.patch(`/users/${userId}`, { role });

            // Update the user in searchResults
            const { searchResults } = get();
            const updatedResults = searchResults.map(user =>
                user._id === userId ? { ...user, role } : user
            );
            set({ searchResults: updatedResults, isLoading: false });

            return true;
        } catch (error: any) {
            const errorMessage = error?.response?.data?.message || 'Failed to update user role';
            set({ error: errorMessage, isLoading: false });
            throw new Error(errorMessage); // Throw error for toast handling
        }
    },

    clearSearchResults: () => {
        set({ searchResults: [] });
    },

    setError: (error: string | null) => {
        set({ error });
    },
}));