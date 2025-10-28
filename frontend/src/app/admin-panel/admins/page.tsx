'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Toaster } from 'sonner';
import { UserPlus } from 'lucide-react';
import { withAuth } from '@/utils/withAuth';
import { UserRole } from '@/types';
import { useAdmins } from '@/hooks/useUsers';
import AdminList from '@/components/modules/admin/AdminList';
import AddAdminForm from '@/components/modules/admin/AdminForm';

function AdminManagementPage() {
    const [showAddAdmin, setShowAddAdmin] = useState(false);
    const { data: admins = [], isLoading } = useAdmins();

    return (
        <div className="max-w-7xl mx-auto">
            <Toaster position="top-right" expand richColors />
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
                        <>
                            <UserPlus className="h-4 w-4 mr-2" />
                            Add New Admin
                        </>
                    )}
                </Button>
            </div>

            {!showAddAdmin ? (
                <AdminList admins={admins} isLoading={isLoading} />
            ) : (
                <AddAdminForm />
            )}
        </div>
    );
}

export default withAuth(AdminManagementPage, UserRole.ADMIN, '/voting');