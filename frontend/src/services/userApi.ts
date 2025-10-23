import api from '@/lib/api';
import { SearchUsersResponse, UpdateUserRoleResponse, User } from '@/types';

export const userApi = {
    searchUsers: async (params: { query?: string; role?: 'USER' | 'ADMIN' }): Promise<User[]> => {
        const searchParams = new URLSearchParams();
        if (params.query) searchParams.append('query', params.query);
        if (params.role) searchParams.append('role', params.role);

        const { data } = await api.get<User[]>(`/users?${searchParams.toString()}`);
        return data;
    },

    updateUserRole: async (userId: string, role: 'USER' | 'ADMIN'): Promise<User> => {
        const { data } = await api.patch<UpdateUserRoleResponse>(`/users/${userId}`, { role });
        return data.user;
    }
};