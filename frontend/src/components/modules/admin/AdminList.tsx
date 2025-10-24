'use client';
import { Button } from '@/components/ui/button';
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from 'sonner';
import { User } from '@/types';
import { useUser } from '@/hooks/useAuth';
import { useUpdateUserRole } from '@/hooks/useUsers';

interface AdminListProps {
    admins: User[];
    isLoading: boolean;
}

export default function AdminList({ admins, isLoading }: AdminListProps) {
    const { user: currentUser } = useUser();
    const updateRoleMutation = useUpdateUserRole();

    const handleRemoveAdmin = async (userId: string, userName: string) => {
        if (userId === currentUser?._id) {
            toast.error('You cannot remove yourself as admin');
            return;
        }

        try {
            await toast.promise(
                updateRoleMutation.mutateAsync({ userId, role: 'USER' }),
                {
                    loading: `Removing admin privileges from ${userName}...`,
                    success: `${userName} has been removed as admin`,
                    error: (err: Error) => err.message || 'Failed to remove admin',
                }
            );
        } catch (error) {
            // Error handling is done in the toast
        }
    };

    return (
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
                    {isLoading ? (
                        <TableRow>
                            <TableCell colSpan={4} className="text-center py-8">
                                <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full mx-auto" />
                            </TableCell>
                        </TableRow>
                    ) : admins.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                                No administrators found
                            </TableCell>
                        </TableRow>
                    ) : (
                        admins.map((admin) => (
                            <TableRow key={admin._id}>
                                <TableCell className="flex items-center gap-3">
                                    <Avatar>
                                        <AvatarImage src={admin.avatar} alt={admin.name} />
                                        <AvatarFallback>{admin.name?.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <div className="flex flex-col">
                                        <span className="font-medium">{admin.name}</span>
                                        {admin._id === currentUser?._id && (
                                            <span className="text-xs text-muted-foreground">(You)</span>
                                        )}
                                    </div>
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
                                        disabled={admin._id === currentUser?._id}
                                        onClick={() => handleRemoveAdmin(admin._id, admin.name)}
                                    >
                                        Remove Admin
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
        </div>
    );
}