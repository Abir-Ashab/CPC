'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast, Toaster } from 'sonner';
import { useSearchUsers, useUpdateUserRole } from '@/hooks/useUsers';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search, UserPlus } from 'lucide-react';
import { withAuth } from '@/utils/withAuth';
import { UserRole } from '@/types';
import { useUser } from '@/hooks/useUser';

function AdminManagementPage() {
    const [showAddAdmin, setShowAddAdmin] = useState(false);
    const { user } = useUser();
    const {
        data: users = [],
        isLoading: usersLoading,
        query: searchQuery,
        setQuery: setSearchQuery
    } = useSearchUsers();

    const updateRoleMutation = useUpdateUserRole();

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
    };

    const handleRoleUpdate = async (userId: string, newRole: 'USER' | 'ADMIN') => {
        if (newRole === 'USER' && userId === user?._id) {
            toast.error('You cannot remove yourself as admin');
            return;
        }

        toast.promise(
            () => updateRoleMutation.mutateAsync({ userId, role: newRole }),
            {
                loading: newRole === 'ADMIN' ? 'Making user admin...' : 'Removing admin privileges...',
                success: newRole === 'ADMIN' ? 'User has been made admin successfully' : 'Admin privileges removed successfully',
                error: (err: Error) => err.message || `Failed to ${newRole === 'ADMIN' ? 'make user admin' : 'remove admin privileges'}`
            }
        );
    };

    return (
        <div className="container mx-auto p-6 max-w-5xl">
            <Toaster position="top-right" expand={true} richColors />

            {/* Header with search toggle */}
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Admin Management</h1>
                <Button
                    onClick={() => setShowAddAdmin(!showAddAdmin)}
                    variant="outline"
                    size="sm"
                >
                    {showAddAdmin ? (
                        <>View Admins List</>
                    ) : (
                        <><UserPlus className="h-4 w-4 mr-2" /> Add New Admin</>
                    )}
                </Button>
            </div>

            {!showAddAdmin && (
                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>User</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Role</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {usersLoading ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center py-8">
                                        <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full mx-auto" />
                                    </TableCell>
                                </TableRow>
                            ) : users.filter(u => u.role === 'ADMIN').length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                                        No administrators found
                                    </TableCell>
                                </TableRow>
                            ) : (
                                users.filter(u => u.role === 'ADMIN').map((admin) => (
                                    <TableRow key={admin._id}>
                                        <TableCell className="flex items-center gap-3">
                                            <Avatar>
                                                <AvatarImage src={admin.avatar} alt={admin.name} />
                                                <AvatarFallback>{admin.name?.charAt(0)}</AvatarFallback>
                                            </Avatar>
                                            <span className="font-medium">{admin.name}</span>
                                        </TableCell>
                                        <TableCell>{admin.email}</TableCell>
                                        <TableCell>
                                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
                                                {admin.role}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button
                                                variant="destructive"
                                                size="sm"
                                                disabled={admin._id === user?._id}
                                                onClick={() => handleRoleUpdate(admin._id, 'USER')}
                                            >
                                                Remove
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            )}
            {showAddAdmin && (
                <div className="space-y-6">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            type="text"
                            placeholder="Search users by name or email..."
                            value={searchQuery}
                            onChange={handleSearch}
                            className="pl-10"
                            disabled={usersLoading}
                        />
                        {usersLoading && (
                            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full" />
                            </div>
                        )}
                    </div>

                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>User</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead>Role</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {usersLoading ? (
                                    <TableRow>
                                        <TableCell colSpan={4} className="text-center py-8">
                                            <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full mx-auto" />
                                        </TableCell>
                                    </TableRow>
                                ) : users.filter(u => u.role !== 'ADMIN').length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                                            {searchQuery ? 'No users found matching your search' : 'Enter a search term to find users'}
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    users.filter(u => u.role !== 'ADMIN').map((user) => (
                                        <TableRow key={user._id}>
                                            <TableCell className="flex items-center gap-3">
                                                <Avatar>
                                                    <AvatarImage src={user.avatar} alt={user.name} />
                                                    <AvatarFallback>{user.name?.charAt(0)}</AvatarFallback>
                                                </Avatar>
                                                <span className="font-medium">{user.name}</span>
                                            </TableCell>
                                            <TableCell>{user.email}</TableCell>
                                            <TableCell>
                                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                                    {user.role}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button
                                                    size="sm"
                                                    onClick={() => handleRoleUpdate(user._id, 'ADMIN')}
                                                >
                                                    Make Admin
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            )}
        </div>
    );
}

export default withAuth(AdminManagementPage, UserRole.ADMIN, '/voting');