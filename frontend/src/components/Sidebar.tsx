'use client';

import { useAuthStore } from '@/store/authStore';
import { BookOpen, Home, Bell, MessageSquare, LogOut, Settings, Users } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import clsx from 'clsx';

export default function Sidebar() {
    const { user, logout } = useAuthStore();
    const pathname = usePathname();
    const router = useRouter();

    const handleLogout = () => {
        logout();
        router.push('/login');
    };

    const menuItems = [
        { name: 'Dashboard', icon: Home, path: '/dashboard' },
        { name: 'Courses', icon: BookOpen, path: '/dashboard/courses' },
        { name: 'Chat Room', icon: MessageSquare, path: '/dashboard/chat' },
        { name: 'Announcements', icon: Bell, path: '/dashboard/announcements' },
    ];

    const adminItems = [
        { name: 'Admin Home', icon: Settings, path: '/dashboard/admin' },
        { name: 'Manage Courses', icon: BookOpen, path: '/dashboard/admin/courses' },
        { name: 'Gradebook', icon: BookOpen, path: '/dashboard/admin/grading' },
        { name: 'Manage Users', icon: Users, path: '/dashboard/admin/users' },
    ];

    return (
        <div className="w-64 h-screen bg-darker border-r border-white/10 flex flex-col pt-6 sticky top-0">
            <div className="px-6 mb-10">
                <Link href="/dashboard" className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
                    Happy Hackers
                </Link>
            </div>

            <nav className="flex-grow px-4 space-y-2 overflow-y-auto">
                <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 px-4 mt-2">Student Area</div>
                {menuItems.map((item) => (
                    <Link
                        key={item.name}
                        href={item.path}
                        className={clsx(
                            'flex items-center space-x-3 px-4 py-3 rounded-xl transition-all',
                            pathname === item.path
                                ? 'bg-primary/20 text-accent border border-primary/30'
                                : 'text-gray-400 hover:bg-white/5 hover:text-white'
                        )}
                    >
                        <item.icon size={20} className={pathname === item.path ? 'text-accent' : ''} />
                        <span className="font-medium">{item.name}</span>
                    </Link>
                ))}

                {user?.role === 'ADMIN' && (
                    <>
                        <div className="text-xs font-bold text-red-500/80 uppercase tracking-wider mb-2 px-4 mt-8">Teacher / Admin</div>
                        {adminItems.map((item) => (
                            <Link
                                key={item.name}
                                href={item.path}
                                className={clsx(
                                    'flex items-center space-x-3 px-4 py-3 rounded-xl transition-all',
                                    pathname === item.path
                                        ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                                        : 'text-gray-400 hover:bg-white/5 hover:text-white'
                                )}
                            >
                                <item.icon size={20} className={pathname === item.path ? 'text-red-400' : ''} />
                                <span className="font-medium">{item.name}</span>
                            </Link>
                        ))}
                    </>
                )}
            </nav>

            <div className="p-4 border-t border-white/10">
                <div className="bg-white/5 p-4 rounded-xl border border-white/5 flex flex-col mb-4">
                    <div className="text-sm font-bold text-white truncate">{user?.name}</div>
                    <div className="text-xs text-primary mb-2 truncate">{user?.email}</div>
                    <div className="flex space-x-2 text-xs text-gray-400">
                        <span className="bg-white/10 px-2 py-1 rounded">{user?.role}</span>
                        {user?.grade && <span className="bg-white/10 px-2 py-1 rounded">Grade {user.grade}</span>}
                    </div>
                </div>

                <button
                    onClick={handleLogout}
                    className="flex items-center space-x-3 px-4 py-3 w-full text-gray-400 hover:bg-red-500/10 hover:text-red-400 rounded-xl transition"
                >
                    <LogOut size={20} />
                    <span className="font-medium">Logout</span>
                </button>
            </div>
        </div>
    );
}
