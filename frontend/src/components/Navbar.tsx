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
import { useUser } from '@/hooks/useAuth';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Camera, Trophy, Settings, LogOut, User, Loader2, Users } from 'lucide-react';
import { withAuth } from '@/utils/withAuth';

interface NavLinkProps {
    href: string;
    icon?: React.ReactNode;
    children: React.ReactNode;
}

function NavLink({ href, icon, children }: NavLinkProps) {
    const pathname = usePathname();
    const isActive = href === pathname;

    return (
        <Link
            href={href}
            className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${isActive
                    ? 'text-blue-600 bg-blue-50'
                    : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                }`}
        >
            {icon && <span className="mr-2">{icon}</span>}
            {children}
        </Link>
    );
}

function NavbarComponent() {
    const { user, logout, isLoading } = useUser();
    const pathname = usePathname();

    if (pathname === '/login') return null;


    return (
        <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
                <div className="flex justify-between items-center">
                    <Link href="/" className="flex items-center space-x-2">
                        <div className='flex gap-2 align-text-top'>
                            <Camera className="h-6 w-6 text-black-600" />
                            <span className="text-xl font-semibold text-gray-900">Photography Contest</span>
                        </div>
                    </Link>

                    <div className="flex items-center space-x-6">
                        <div className="hidden md:flex items-center space-x-2">
                            <NavLink href="/voting" icon={<Trophy className="h-5 w-4" />}>
                                Voting
                            </NavLink>
                            <NavLink href="/results">
                                Results
                            </NavLink>
                            {user?.role === 'ADMIN' && (
                                <>
                                    <NavLink href="/admin-panel" icon={<Settings className="h-4 w-4" />}>
                                        Admin Panel
                                    </NavLink>
                                    <NavLink href="/admin-panel/admins" icon={<Users className="h-4 w-4" />}>
                                        Admins
                                    </NavLink>
                                </>
                            )}
                        </div>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="ghost"
                                    className="flex items-center space-x-2 p-1 hover:bg-blue-50 rounded-full transition-all duration-200"
                                >
                                    <Avatar className="h-8 w-8">
                                        <AvatarImage src={user?.avatar} alt={user?.name || 'User'} />
                                        <AvatarFallback className="bg-blue-100 text-blue-600 font-medium">
                                            {(user?.name || user?.email || 'U').charAt(0).toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                    <span className="hidden sm:block text-sm font-medium text-gray-900">
                                        {user?.name || (user?.email && user.email.split('@')[0]) || 'User'}
                                    </span>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56 p-2 bg-white rounded-lg shadow-lg border border-gray-100">
                                <DropdownMenuLabel className="font-normal">
                                    <div className="flex flex-col space-y-1 p-2">
                                        <p className="text-sm font-medium text-gray-900">
                                            {user?.name || 'User'}
                                        </p>
                                        <p className="text-xs text-gray-500">{user?.email}</p>
                                    </div>
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator className="bg-gray-100" />
                                <DropdownMenuLabel className="text-xs text-gray-500 uppercase px-2 py-1.5">
                                    Role: {user?.role || 'USER'}
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator className="bg-gray-100" />
                                <div className="md:hidden">
                                    <DropdownMenuItem asChild>
                                        <Link href="/voting" className="flex items-center px-2 py-1.5 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-md">
                                            <Trophy className="h-4 w-4 mr-2" />
                                            Voting
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem asChild>
                                        <Link href="/results" className="flex items-center px-2 py-1.5 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-md">
                                            <User className="h-4 w-4 mr-2" />
                                            Results
                                        </Link>
                                    </DropdownMenuItem>
                                    {user?.role === 'ADMIN' && (
                                        <>
                                            <DropdownMenuItem asChild>
                                                <Link href="/admin-panel" className="flex items-center px-2 py-1.5 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-md">
                                                    <Settings className="h-4 w-4 mr-2" />
                                                    Admin Panel
                                                </Link>
                                            </DropdownMenuItem>
                                            <DropdownMenuItem asChild>
                                                <Link href="/admin-panel/admins" className="flex items-center px-2 py-1.5 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-md">
                                                    <Users className="h-4 w-4 mr-2" />
                                                    Admins
                                                </Link>
                                            </DropdownMenuItem>
                                        </>
                                    )}
                                    <DropdownMenuSeparator className="bg-gray-100" />
                                </div>
                                <DropdownMenuItem
                                    onClick={() => logout()}
                                    className="flex items-center px-2 py-1.5 text-blue-600 hover:bg-blue-50 rounded-md cursor-pointer"
                                >
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