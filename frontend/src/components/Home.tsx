'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { withAuth } from '@/utils/withAuth';
import { useUser } from '@/hooks/useUser';

export function HomeComponent() {
    const router = useRouter();
    const { user, isLoading } = useUser();
    useEffect(() => {
        if (user) {
            router.push(user.role === 'ADMIN' ? '/admin' : '/voting');
        }
    }, [user, router]);

    if (isLoading) {
        return (
            <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-sm text-gray-600">Loading...</p>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
            <div className="text-center max-w-md p-8 bg-white rounded-lg shadow-lg">
                <h1 className="text-4xl font-bold mb-6">Cefalo Photography Contest</h1>
                <p className="text-lg text-gray-600 mb-8">
                    Join our photography contest! Sign in with Google to vote for your favorite photos.
                </p>
            </div>
        </main>
    );
}

export const Home = withAuth(HomeComponent);
