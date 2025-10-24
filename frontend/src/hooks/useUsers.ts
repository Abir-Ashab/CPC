import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userApi } from '@/services/userApi';
import { useState, useMemo } from 'react';
import { useDebounce } from '@/hooks/useDebounce';
import { User } from '@/types';

// Hook for searching users by name or email
export const useSearchUsers = () => {
    const [query, setQuery] = useState('');
    const debouncedQuery = useDebounce(query, 400);

    const searchQuery = useQuery<User[]>({
        queryKey: ['users', 'search', { query: debouncedQuery }],
        queryFn: () => userApi.searchUsers({ query: debouncedQuery }),
        enabled: !!debouncedQuery, // Only run when there's a search query
        staleTime: 60 * 1000,
    });

    return {
        ...searchQuery,
        query,
        setQuery,
    };
};

// Hook for fetching admin users only
export const useAdmins = () => {
    return useQuery<User[]>({
        queryKey: ['users', 'admins'],
        queryFn: () => userApi.searchUsers({ role: 'ADMIN' }),
        staleTime: 60 * 1000,
    });
};

export const useUpdateUserRole = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ userId, role }: { userId: string; role: 'USER' | 'ADMIN' }) =>
            userApi.updateUserRole(userId, role),

        onSuccess: (updatedUser, variables) => {
            // Invalidate and refetch both admin list and search queries
            queryClient.invalidateQueries({ queryKey: ['users', 'admins'] });
            queryClient.invalidateQueries({ queryKey: ['users', 'search'] });

            // Optional: Update cache immediately for better UX
            queryClient.setQueriesData(
                { queryKey: ['users'] },
                (oldData: any) => {
                    if (!oldData) return oldData;
                    // Handle different query structures
                    if (Array.isArray(oldData)) {
                        return oldData.map((u: User) =>
                            u._id === variables.userId ? { ...u, role: variables.role } : u
                        );
                    }
                    return oldData;
                }
            );
        },
    });
};