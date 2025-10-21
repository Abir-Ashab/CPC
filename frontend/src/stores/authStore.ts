// stores/authStore.ts - Zustand store for auth
import { create } from 'zustand';
import api from '@/lib/api';

interface User {
    _id: string;
    email: string;
    name: string;
    avatar?: string;
    role: 'USER' | 'ADMIN';
    googleId?: string;
}

interface AuthState {
    user: User | null;
    isLoading: boolean;
    setUser: (user: User | null) => void;
    logout: () => Promise<void>;
    fetchUser: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    isLoading: true,
    setUser: (user) => set({ user, isLoading: false }),
    logout: async () => {
        await api.get('/auth/logout');
        set({ user: null });
    },
    fetchUser: async () => {
        set({ isLoading: true });
        try {
            const { data } = await api.get('/auth/me');
            set({ user: data, isLoading: false });
        } catch {
            set({ user: null, isLoading: false });
        }
    },
}));