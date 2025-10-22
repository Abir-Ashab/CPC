import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '@/lib/api';

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

interface AuthState {
    user: User | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    error: string | null;
    hasAttemptedFetch: boolean;

    setUser: (user: User | null) => void;
    setLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;
    login: (redirectUrl?: string) => void;
    logout: () => Promise<void>;
    fetchUser: () => Promise<void>;
    clearError: () => void;
    reset: () => void;

    isAdmin: () => boolean;
    isSuperAdmin: () => boolean;
    canVote: () => boolean;
    canManageVoting: () => boolean;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set, get) => ({
            user: null,
            isLoading: false,
            isAuthenticated: false,
            error: null,
            hasAttemptedFetch: false,

            // Actions
            setUser: (user: User | null) => {
                set({ 
                    user, 
                    isAuthenticated: !!user,
                    isLoading: false,
                    error: null,
                    hasAttemptedFetch: true
                });
            },

            setLoading: (loading: boolean) => {
                set({ isLoading: loading });
            },

            setError: (error: string | null) => {
                set({ error, isLoading: false });
            },

            login: (redirectUrl?: string) => {
                if (typeof window === 'undefined') {
                    return;
                }
                set({ 
                    user: null, 
                    isAuthenticated: false, 
                    isLoading: false,
                    error: null,
                    hasAttemptedFetch: false
                });
                
                const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
                const redirect = redirectUrl || window.location.href;
                const googleAuthUrl = `${baseUrl}/auth/google?redirect=${encodeURIComponent(redirect)}`;
                window.location.href = googleAuthUrl;
            },

            logout: async () => {
                try {
                    set({ isLoading: true });
                    await api.get('/auth/logout');
                    set({ 
                        user: null, 
                        isAuthenticated: false, 
                        isLoading: false,
                        error: null,
                        hasAttemptedFetch: false 
                    });
                    if (typeof window !== 'undefined') {
                        window.location.href = '/';
                    }
                } catch (error) {
                    console.error('Logout error:', error);
                    set({ 
                        user: null, 
                        isAuthenticated: false, 
                        isLoading: false,
                        error: 'Failed to logout properly',
                        hasAttemptedFetch: false 
                    });
                }
            },

            fetchUser: async () => {
                const { isLoading, hasAttemptedFetch } = get();
                if (isLoading && hasAttemptedFetch) {
                    return;
                }

                try {
                    set({ isLoading: true, error: null, hasAttemptedFetch: true });
                    const { data } = await api.get('/auth/me');
                    set({ 
                        user: data, 
                        isAuthenticated: true, 
                        isLoading: false,
                        error: null 
                    });
                } catch (error: any) {
                    const is401 = error?.response?.status === 401;
                    const errorMessage = is401 ? null : (error?.response?.data?.message || 'Failed to fetch user');
                    set({ 
                        user: null, 
                        isAuthenticated: false, 
                        isLoading: false,
                        error: errorMessage 
                    });
                }
            },

            clearError: () => {
                set({ error: null });
            },

            reset: () => {
                set({ 
                    user: null, 
                    isAuthenticated: false, 
                    isLoading: false,
                    error: null,
                    hasAttemptedFetch: false
                });
            },

            isAdmin: () => {
                const { user } = get();
                return user?.role === UserRole.ADMIN;
            },

            isSuperAdmin: () => {
                const { user } = get();
                return user?.email === 'abir.ashab@cefalo.com' && user?.role === UserRole.ADMIN;
            },

            canVote: () => {
                const { user } = get();
                return !!user && user.role === UserRole.USER;
            },

            canManageVoting: () => {
                const { user } = get();
                return user?.role === UserRole.ADMIN || user?.email === 'abir.ashab@cefalo.com';
            },
        }),
        {
            name: 'auth-storage',
            partialize: (state) => ({ 
                user: state.user,
                isAuthenticated: state.isAuthenticated,
                hasAttemptedFetch: state.hasAttemptedFetch
            }),
        }
    )
);