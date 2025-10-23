import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userApi } from '@/services/userApi';
import { useState } from 'react';

export const useSearchUsers = () => {
    const [query, setQuery] = useState('');
    const [role, setRole] = useState<'USER' | 'ADMIN' | undefined>();

    const searchQuery = useQuery({
        queryKey: ['users', 'search', { query, role }],
        queryFn: () => userApi.searchUsers({ query, role }),
    });

    return {
        ...searchQuery,
        query,
        setQuery,
        role,
        setRole
    };
};

export const useUpdateUserRole = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ userId, role }: { userId: string; role: 'USER' | 'ADMIN' }) =>
            userApi.updateUserRole(userId, role),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
        }
    });
};