'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Users, FileCheck, Trophy, ArrowRight, Loader2 } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import Link from 'next/link';

export default function AdminDashboardPage() {
    const { user } = useAuthStore();
    const router = useRouter();
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user && user.role !== 'ADMIN') {
            router.push('/dashboard');
            return;
        }

        const fetchStats = async () => {
            try {
                const { data } = await api.get('/admin/dashboard');
                setStats(data);
            } catch (error) {
                console.error('Failed to fetch admin stats', error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, [user, router]);

    if (loading) {
        return <div className="flex justify-center items-center h-full"><Loader2 className="animate-spin text-primary" size={40} /></div>;
    }

    return (
        <div className="max-w-6xl mx-auto space-y-8">
            <div className="flex justify-between items-end mb-8">
                <div>
                    <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
                    <p className="text-gray-400">Overview of student progress and platform metrics.</p>
                </div>
            </div>

            {/* Top Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6 flex items-center justify-between border-green-500/20">
                    <div>
                        <p className="text-gray-400 text-sm font-bold uppercase tracking-wider mb-1">Active Students</p>
                        <h2 className="text-4xl font-black text-white">{stats?.studentCount || 0}</h2>
                    </div>
                    <div className="bg-green-500/20 p-4 rounded-full text-green-400"><Users size={32} /></div>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-6 flex items-center justify-between border-orange-500/20">
                    <div>
                        <p className="text-gray-400 text-sm font-bold uppercase tracking-wider mb-1">Pending Grading</p>
                        <h2 className="text-4xl font-black text-white">{stats?.pendingSubmissions || 0}</h2>
                    </div>
                    <div className="bg-orange-500/20 p-4 rounded-full text-orange-400"><FileCheck size={32} /></div>
                </motion.div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-4">
                {/* Leaderboard */}
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card p-6 border-yellow-500/20">
                    <h2 className="text-xl font-bold flex items-center gap-2 mb-6"><Trophy className="text-yellow-500" /> Top Hackers</h2>
                    <div className="space-y-3">
                        {stats?.topStudents?.length > 0 ? (
                            stats.topStudents.map((student: any, i: number) => (
                                <div key={student.id} className="flex items-center justify-between bg-darker p-4 rounded-xl border border-white/5">
                                    <div className="flex items-center gap-4">
                                        <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-sm">
                                            {i + 1}
                                        </div>
                                        <div>
                                            <p className="font-bold">{student.name}</p>
                                            {student.grade && <p className="text-xs text-gray-400">Grade {student.grade}</p>}
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-black text-accent">{student.xp} XP</p>
                                        <p className="text-xs text-gray-500">Level {Math.floor(student.xp / 200) + 1}</p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-gray-500 italic text-center py-4">No active students found.</p>
                        )}
                    </div>
                </motion.div>

                {/* Quick Actions */}
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="space-y-4">
                    <h2 className="text-xl font-bold mb-6">Quick Actions</h2>

                    <Link href="/dashboard/admin/grading" className="glass-card p-6 flex items-center justify-between hover:border-primary/50 transition-colors group">
                        <div className="flex items-center gap-4">
                            <div className="bg-primary/20 p-3 rounded-xl text-primary"><FileCheck size={24} /></div>
                            <div>
                                <h3 className="font-bold text-lg group-hover:text-primary transition-colors">Grade Submissions</h3>
                                <p className="text-sm text-gray-400">Review student code and award XP.</p>
                            </div>
                        </div>
                        <ArrowRight className="text-gray-600 group-hover:text-primary transition-colors" />
                    </Link>

                    <Link href="/dashboard/admin/courses" className="glass-card p-6 flex items-center justify-between hover:border-primary/50 transition-colors group">
                        <div className="flex items-center gap-4">
                            <div className="bg-accent/20 p-3 rounded-xl text-accent"><Users size={24} /></div>
                            <div>
                                <h3 className="font-bold text-lg group-hover:text-accent transition-colors">Manage Courses</h3>
                                <p className="text-sm text-gray-400">Create lessons, modules and assignments.</p>
                            </div>
                        </div>
                        <ArrowRight className="text-gray-600 group-hover:text-accent transition-colors" />
                    </Link>
                </motion.div>
            </div>
        </div>
    );
}
