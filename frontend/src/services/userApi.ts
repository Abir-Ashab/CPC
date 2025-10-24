import api from '@/lib/api';
import { User, UpdateUserRoleResponse } from '@/types';

export const userApi = {
    async searchUsers(params: { query?: string; role?: 'USER' | 'ADMIN' }): Promise<User[]> {
        const searchParams = new URLSearchParams();
        if (params.query) searchParams.append('query', params.query);
        if (params.role) searchParams.append('role', params.role);

        const { data } = await api.get<User[]>(`/users?${searchParams.toString()}`);
        return data;
    },

    async updateUserRole(userId: string, role: 'USER' | 'ADMIN'): Promise<User> {
        const { data } = await api.patch<UpdateUserRoleResponse>(`/users/${userId}`, { role });
        return data.user;
    },
};