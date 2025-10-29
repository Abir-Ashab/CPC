import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface User {
    _id: string;
    email: string;
    name: string;
    avatar?: string;
    role: 'USER' | 'ADMIN';
    googleId?: string;
    isSuperAdmin?: boolean;
}

export enum UserRole {
    USER = 'USER',
    ADMIN = 'ADMIN',
}

interface AuthState {
    user: User | null;
    setUser: (user: User | null) => void;
    login: (redirectUrl?: string) => void;
    logout: () => Promise<void>;
    reset: () => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,

            setUser: (user) => {
                set({ user });
            },

            login: (redirectUrl?: string) => {
                if (typeof window === 'undefined') return;
                const baseUrl = process.env.NEXT_PUBLIC_API_URL;
                const redirect = redirectUrl || window.location.href;
                window.location.href = `${baseUrl}/auth/google?redirect=${encodeURIComponent(redirect)}`;
            },

            // SIMPLIFY logout - let the hook handle the API call
            logout: async () => {
                // Just clear client state
                set({ user: null });
            },

            reset: () => {
                set({ user: null });
            }
        }),
        {
            name: 'auth-storage',
            partialize: (state) => ({ user: state.user }),
        }
    )
);