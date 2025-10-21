'use client';

import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/stores/authStore';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Login() {
    const { user, fetchUser } = useAuthStore();
    const router = useRouter();

    useEffect(() => {
        fetchUser();
        if (user) {
            if (user.role === 'ADMIN') {
                router.push('/admin/dashboard');
            } else {
                router.push('/voting');
            }
        }
    }, [user]);

    const handleGoogleLogin = () => {
        window.location.href = 'http://localhost:5000/api/auth/google'; // Backend Google endpoint
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen">
            <h1 className="text-2xl font-bold mb-4">Login</h1>
            <Button onClick={handleGoogleLogin} variant="outline">
                Login with Google
            </Button>
        </div>
    );
}