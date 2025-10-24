import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ComponentType, createElement } from 'react';
import { UserRole } from '@/types';
import { useUser } from '@/hooks/useAuth';

export function withAuth<P extends object>(
    WrappedComponent: ComponentType<P>,
    role?: UserRole,
    redirectTo = '/login'
) {
    function WithAuthComponent(props: P) {
        const router = useRouter();
        const { user, isLoading } = useUser();

        useEffect(() => {

            if (!isLoading && !user) {
                router.replace(redirectTo);
                return;
            }

            if (!isLoading && role && user?.role !== role) {
                router.replace('/unauthorized');
                return;
            }
        }, [user, router, role]);

        return createElement(WrappedComponent, props);
    }

    return WithAuthComponent;
}

