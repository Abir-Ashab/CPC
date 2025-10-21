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
import { useRouter } from 'next/navigation';

export default function Navbar() {
    const { user, isLoading, fetchUser, logout } = useAuthStore();
    const router = useRouter();

    useEffect(() => {
        fetchUser();
    }, []);

    if (isLoading) return null;

    if (!user) {
        router.push('/login');
        return null;
    }

    return (
        <nav className="border-b py-4">
            <div className="container mx-auto flex justify-between items-center">
                <Link href="/" className="text-lg font-bold">
                    Voting App
                </Link>
                <div className="flex items-center space-x-4">
                    <Link href="/voting">Voting</Link>
                    <Link href="/results">Results</Link>
                    {user.role === 'ADMIN' && <Link href="/admin/dashboard">Admin</Link>}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="flex items-center space-x-2">
                                <Avatar className="h-8 w-8">
                                    <AvatarImage src={user.avatar} alt={user.name} />
                                    <AvatarFallback>{user.name?.[0]}</AvatarFallback>
                                </Avatar>
                                <span>{user.name}</span>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>{user.email}</DropdownMenuLabel>
                            <DropdownMenuLabel>Role: {user.role}</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={logout}>Logout</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </nav>
    );
}