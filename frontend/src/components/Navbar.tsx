// components/Navbar.tsx
'use client';

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
import { useUser } from '@/hooks/useUser';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Camera, Trophy, Settings, LogOut, User, Loader2 } from 'lucide-react';

import { withAuth } from '@/utils/withAuth';

interface NavLinkProps {
    href: string;
    icon?: React.ReactNode;
    children: React.ReactNode;
}

function NavLink({ href, icon, children }: NavLinkProps) {
    const pathname = usePathname();
    const isActive = href === pathname || (href === '/admin' && pathname.startsWith('/admin'));

    return (
        <Link
            href={href}
            className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
        >
            {icon && <span className="inline-block mr-2">{icon}</span>}
            {children}
        </Link>
    );
}

function NavbarComponent() {
    const { user, logout, isLoading } = useUser();
    const pathname = usePathname();

    if (pathname === '/login') return null;

    // Show loading state
    if (isLoading) {
        return (
            <nav className="border-b bg-white shadow-sm sticky top-0 z-50">
                <div className="container mx-auto px-4 py-3">
                    <div className="flex justify-between items-center">
                        <div className="text-xl font-bold text-gray-900 flex items-center">
                            <Camera className="h-6 w-6 mr-2 text-blue-600" />
                            Photography Contest
                        </div>
                        <div className="flex items-center gap-2">
                            <Loader2 className="h-4 w-4 animate-spin" />
                        </div>
                    </div>
                </div>
            </nav>
        );
    }

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
                            <NavLink href="/voting" icon={<Trophy className="h-4 w-4" />}>
                                Voting
                            </NavLink>

                            <NavLink href="/results">
                                Results
                            </NavLink>

                            {user?.role === 'ADMIN' && (
                                <NavLink href="/admin" icon={<Settings className="h-4 w-4" />}>
                                    Admin Panel
                                </NavLink>
                            )}
                        </div>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="flex items-center space-x-2 p-2">
                                    <Avatar className="h-8 w-8">
                                        <AvatarImage src={user?.avatar} alt={user?.name || 'User'} />
                                        <AvatarFallback className="bg-blue-100 text-blue-700">
                                            {(user?.name || user?.email || 'U').charAt(0).toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                    <span className="hidden sm:block text-sm font-medium">
                                        {user?.name || (user?.email && user.email.split('@')[0]) || 'User'}
                                    </span>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56">
                                <DropdownMenuLabel className="font-normal">
                                    <div className="flex flex-col space-y-1">
                                        <p className="text-sm font-medium leading-none">
                                            {user?.name || 'User'}
                                        </p>
                                        <p className="text-xs leading-none text-muted-foreground">
                                            {user?.email}
                                        </p>
                                    </div>
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator />

                                <DropdownMenuLabel className="text-xs text-muted-foreground uppercase">
                                    Role: {user?.role || 'USER'}
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
                                    {user?.role === 'ADMIN' && (
                                        <DropdownMenuItem asChild>
                                            <Link href="/admin" className="flex items-center">
                                                <Settings className="h-4 w-4 mr-2" />
                                                Admin Panel
                                            </Link>
                                        </DropdownMenuItem>
                                    )}
                                    <DropdownMenuSeparator />
                                </div>

                                <DropdownMenuItem onClick={() => logout()} className="text-blue-600">
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

export const Navbar = withAuth(NavbarComponent);
export default Navbar;