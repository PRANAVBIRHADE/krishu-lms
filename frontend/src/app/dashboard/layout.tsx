'use client';

import Sidebar from '@/components/Sidebar';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { user, isLoading, checkAuth } = useAuthStore();
    const router = useRouter();

    useEffect(() => {
        checkAuth();
    }, [checkAuth]);

    useEffect(() => {
        if (!isLoading && !user) {
            router.push('/login');
        }
    }, [user, isLoading, router]);

    if (isLoading || !user) {
        return (
            <div className="h-screen w-full flex items-center justify-center bg-dark">
                <Loader2 className="animate-spin text-primary" size={48} />
            </div>
        );
    }

    return (
        <div className="flex h-screen overflow-hidden bg-dark text-white">
            <Sidebar />
            <main className="flex-1 overflow-y-auto relative">
                <div className="absolute top-0 right-0 w-full h-[50vh] bg-gradient-to-br from-primary/5 via-transparent to-accent/5 pointer-events-none -z-10" />
                <div className="p-8 pb-20">
                    {children}
                </div>
            </main>
        </div>
    );
}
