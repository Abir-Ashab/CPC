import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect } from 'react';
import api from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';
import type { User } from '@/stores/authStore';

export function useUser() {
    const queryClient = useQueryClient();
    const { user: cachedUser, setUser, logout: clearClientAuth } = useAuthStore();

    // Server-state query
    const query = useQuery<User, Error>({
        queryKey: ['user'],
        queryFn: async (): Promise<User> => {
            try {
                const { data } = await api.get<User>('/auth/me');
                return data;
            } catch (error: any) {
                // Clear user data on auth errors
                if (error?.response?.status === 401 || error?.response?.status === 403) {
                    clearClientAuth();
                    queryClient.setQueryData(['user'], null);
                }
                throw error;
            }
        },
        retry: (failureCount, error: any) => {
            // Don't retry on auth errors
            if (error?.response?.status === 401 || error?.response?.status === 403) {
                return false;
            }
            return failureCount < 3;
        },
        staleTime: 1000 * 60 * 5,
        gcTime: 1000 * 60 * 30,
        refetchOnWindowFocus: true,
        refetchOnReconnect: true,
    });

    // Update client state when server state changes
    useEffect(() => {
        if (query.data) {
            setUser(query.data);
        }
    }, [query.data, setUser]);

    // Proper logout function
    const logout = useCallback(async () => {
        try {
            clearClientAuth();
            queryClient.setQueryData(['user'], null);
            queryClient.removeQueries({ queryKey: ['user'] });
            await api.post('/auth/logout');

        } catch (error) {
            console.error('Logout API error:', error);
        } finally {
            // 4. Always redirect to login page
            if (typeof window !== 'undefined') {
                window.location.href = '/login';
            }
        }
    }, [queryClient, clearClientAuth]);

    return {
        user: query.data ?? cachedUser,
        error: query.error,
        isLoading: query.isLoading && !cachedUser,
        isError: query.isError,
        logout,
        refetch: query.refetch
    };
}