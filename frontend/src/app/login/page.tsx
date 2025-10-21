'use client';

import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/stores/authStore';
import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function Login() {
    const { 
        user, 
        isLoading, 
        error, 
        isAuthenticated,
        login, 
        fetchUser, 
        clearError,
        isAdmin 
    } = useAuthStore();
    const router = useRouter();
    const searchParams = useSearchParams();
    const [isRedirecting, setIsRedirecting] = useState(false);

    useEffect(() => {
        // Try to fetch user on component mount
        if (!isAuthenticated && !user) {
            fetchUser();
        }
    }, []);

    useEffect(() => {
        // Handle authentication redirect
        if (isAuthenticated && user && !isRedirecting) {
            setIsRedirecting(true);
            const redirectTo = searchParams.get('redirect') || (isAdmin() ? '/admin' : '/voting');
            router.push(redirectTo);
        }
    }, [isAuthenticated, user, isAdmin, router, searchParams, isRedirecting]);

    const handleGoogleLogin = () => {
        clearError();
        const currentUrl = typeof window !== 'undefined' ? window.location.href : '';
        login(currentUrl);
    };

    if (isLoading || isRedirecting) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen">
                <Loader2 className="h-8 w-8 animate-spin mb-4" />
                <p className="text-gray-600">
                    {isRedirecting ? 'Redirecting...' : 'Loading...'}
                </p>
            </div>
        );
    }

    if (isAuthenticated && user) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen">
                <Loader2 className="h-8 w-8 animate-spin mb-4" />
                <p className="text-gray-600">Redirecting...</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
            <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full mx-4">
                <div className="text-center mb-6">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        Photography Contest
                    </h1>
                    <p className="text-gray-600">
                        Sign in to view photos and participate in voting
                    </p>
                </div>

                {error && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                        <p className="text-red-600 text-sm">{error}</p>
                        <button 
                            onClick={clearError}
                            className="text-red-500 hover:text-red-700 text-xs underline mt-1"
                        >
                            Dismiss
                        </button>
                    </div>
                )}

                <Button 
                    onClick={handleGoogleLogin} 
                    variant="outline"
                    className="w-full py-3 text-lg font-medium"
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <>
                            <Loader2 className="h-5 w-5 animate-spin mr-2" />
                            Signing in...
                        </>
                    ) : (
                        <>
                            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                            </svg>
                            Continue with Google
                        </>
                    )}
                </Button>

                <p className="text-xs text-gray-500 text-center mt-4">
                    By signing in, you agree to participate in the photography contest
                </p>
            </div>
        </div>
    );
}