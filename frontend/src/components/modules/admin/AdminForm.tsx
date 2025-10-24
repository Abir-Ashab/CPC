'use client';
import { useForm } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Search } from 'lucide-react';
import { useSearchUsers, useUpdateUserRole } from '@/hooks/useUsers';
import SearchUserList from './SearchUserList';

interface SearchFormValues {
    query: string;
}

export default function AddAdminForm() {
    const { register, watch, reset } = useForm<SearchFormValues>({
        defaultValues: { query: '' },
    });

    const query = watch('query');
    const { data: users = [], isLoading, refetch } = useSearchUsers();
    const updateRoleMutation = useUpdateUserRole();

    const handleMakeAdmin = async (userId: string) => {
        try {
            await toast.promise(
                updateRoleMutation.mutateAsync({ userId, role: 'ADMIN' }),
                {
                    loading: 'Making user admin...',
                    success: 'User has been made admin successfully',
                    error: (err: Error) => err.message || 'Failed to make user admin',
                }
            );
            // Clear search and reset form after successful admin assignment
            reset();
            // Refetch to update the list
            refetch();
        } catch (error) {
            // Error handling is done in the toast
        }
    };

    return (
        <div className="space-y-6">
            <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                    type="text"
                    placeholder="Search users by name or email..."
                    {...register('query')}
                    className="pl-10"
                    disabled={isLoading}
                />
                {isLoading && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full" />
                    </div>
                )}
            </div>

            <SearchUserList
                users={users.filter((u) => u.role !== 'ADMIN')} // Only show non-admin users
                isLoading={isLoading}
                onMakeAdmin={handleMakeAdmin}
                query={query}
            />
        </div>
    );
}