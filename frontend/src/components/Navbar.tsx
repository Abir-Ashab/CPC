// components/Navbar.tsx
'use client';

import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import Link from 'next/link';
import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Camera, Trophy, Settings, LogOut, User } from 'lucide-react';

export default function Navbar() {
    const { 
        user, 
        isLoading, 
        isAuthenticated,
        fetchUser, 
        logout,
        isAdmin,
    } = useAuthStore();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (!isAuthenticated && !user) {
            fetchUser();
        }
    }, [isAuthenticated, user, fetchUser]);

    useEffect(() => {
        if (!isLoading && !isAuthenticated && !user && pathname !== '/login') {
            router.push('/login');
        }
    }, [isLoading, isAuthenticated, user, router, pathname]);

    if (pathname === '/login') return null;

    if (isLoading) {
        return (
            <nav className="border-b bg-white shadow-sm">
                <div className="container mx-auto px-4 py-3">
                    <div className="flex justify-between items-center">
                        <div className="text-xl font-bold text-gray-900">
                            Photography Contest
                        </div>
                        <div className="animate-pulse bg-gray-200 h-8 w-24 rounded"></div>
                    </div>
                </div>
            </nav>
        );
    }

    if (!isAuthenticated || !user) {
        return null;
    }

    const handleLogout = async () => {
        await logout();
    };

    return (
        <nav className="border-b bg-white shadow-sm sticky top-0 z-50">
            <div className="container mx-auto px-4 py-3">
                <div className="flex justify-between items-center">
                    <Link href="/" className="text-xl font-bold text-gray-900 flex items-center">
                        <Camera className="h-6 w-6 mr-2 text-blue-600" />
                        Photography Contest
                    </Link>
                    
                    <div className="flex items-center space-x-6">
                        <div className="hidden md:flex items-center space-x-4">
                            <Link 
                                href="/voting" 
                                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                                    pathname === '/voting' 
                                        ? 'bg-blue-100 text-blue-700' 
                                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                                }`}
                            >
                                <Trophy className="h-4 w-4 inline mr-2" />
                                Voting
                            </Link>
                            
                            <Link 
                                href="/results" 
                                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                                    pathname === '/results' 
                                        ? 'bg-blue-100 text-blue-700' 
                                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                                }`}
                            >
                                Results
                            </Link>
                            
                            {(isAdmin()) && (
                                <Link 
                                    href="/admin" 
                                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                                        pathname.startsWith('/admin') 
                                            ? 'bg-blue-100 text-blue-800' 
                                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                                    }`}
                                >
                                    <Settings className="h-4 w-4 inline mr-2" />
                                    Admin Panel
                                </Link>
                            )}
                        </div>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="flex items-center space-x-2 p-2">
                                    <Avatar className="h-8 w-8">
                                        <AvatarImage src={user.avatar} alt={user.name} />
                                        <AvatarFallback className="bg-blue-100 text-blue-700">
                                            {user.name?.charAt(0)?.toUpperCase() || user.email?.charAt(0)?.toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                    <span className="hidden sm:block text-sm font-medium">
                                        {user.name || user.email.split('@')[0]}
                                    </span>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56">
                                <DropdownMenuLabel className="font-normal">
                                    <div className="flex flex-col space-y-1">
                                        <p className="text-sm font-medium leading-none">
                                            {user.name || 'User'}
                                        </p>
                                        <p className="text-xs leading-none text-muted-foreground">
                                            {user.email}
                                        </p>
                                    </div>
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                
                                <DropdownMenuLabel className="text-xs text-muted-foreground uppercase">
                                    Role: {user.role}
                                </DropdownMenuLabel>
                                
                                <DropdownMenuSeparator />
                                
                                {/* Mobile Navigation */}
                                <div className="md:hidden">
                                    <DropdownMenuItem asChild>
                                        <Link href="/voting" className="flex items-center">
                                            <Trophy className="h-4 w-4 mr-2" />
                                            Voting
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem asChild>
                                        <Link href="/results" className="flex items-center">
                                            <User className="h-4 w-4 mr-2" />
                                            Results
                                        </Link>
                                    </DropdownMenuItem>
                                    {isAdmin() && (
                                        <DropdownMenuItem asChild>
                                            <Link href="/admin" className="flex items-center">
                                                <Settings className="h-4 w-4 mr-2" />
                                                Admin Panel
                                            </Link>
                                        </DropdownMenuItem>
                                    )}
                                    <DropdownMenuSeparator />
                                </div>
                                
                                <DropdownMenuItem onClick={handleLogout} className="text-blue-600">
                                    <LogOut className="h-4 w-4 mr-2" />
                                    Logout
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            </div>
        </nav>
    );
}